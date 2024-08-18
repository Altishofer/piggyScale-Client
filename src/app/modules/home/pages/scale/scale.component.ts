import {Component, OnInit, ChangeDetectorRef, ViewChild} from '@angular/core';
import {MqttService} from "../../../../data/services/mqtt.service";
import {NgFor, NgStyle} from "@angular/common";
import {Chart, ChartConfiguration, ChartData, ChartOptions, registerables} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables, ChartDataLabels);

import {BaseChartDirective} from "ng2-charts";
import {delay, min} from "rxjs";
import {each, isNumber} from "chart.js/helpers";
import {RestService} from "@data/services/rest.service";
import {MatButton} from "@angular/material/button";
import {CommonModule} from "@angular/common";


interface DeleteResponse {
  weight: number;
  stddev: number;
}

@Component({
  selector: 'app-scale',
  standalone: true,
  imports: [NgFor, BaseChartDirective, NgStyle, MatButton, CommonModule],
  templateUrl: './scale.component.html',
  styleUrl: './scale.component.css'
})
export class ScaleComponent {

  title: string = "PiggyScale";
  counter: number = 0;
  stdDev: string = "0";
  public feedbackMessage: string | null = null;
  private estimation_lst: number[] = []
  private estimate: boolean = false;
  public confirmationMessage2: string | null = null;

  public lowestStdDev: number | null = null;
  public realTimeEstimate: string | null = null;

  public showDeleteLast: boolean = false;
  public isProcessing: boolean = false;

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  constructor(private mqttService: MqttService, private cd: ChangeDetectorRef, private restService: RestService) {
    this.mqttService.client.on('message', (topic: any, message: { toString: () => string; }) => {
      this.addDataToChart(new Date(), parseFloat(String(message)));
    });
  }

  addDataToChart(time: Date, value: number) {
    var chartValid : boolean = true;
    const rawData: (number | null)[] = this.lineChartData.datasets[0].data as (number | null)[];
    const averageData: (number | null)[] = this.lineChartData.datasets[1].data as (number | null)[];
    const labels: (number | null)[] = this.lineChartData.labels as (number | null)[];

    const width: number = 30;
    [rawData, averageData, labels].forEach(lst => {
      while (lst.length < width) {
        lst.push(null);
      }
    });

    if (labels && rawData && averageData) {
      this.cd.detectChanges();
      labels.push(this.counter);
      rawData.push(value);

      if (this.estimate) {
        this.estimation_lst.push(value);
      }

      const recentValues = rawData.slice(-10).filter(v => v !== null && !isNaN(v)) as number[];
      const notNull = recentValues.length;

      if (notNull > 0) {
        const avg: number = recentValues.reduce((sum, val) => sum + val, 0) / notNull;
        averageData.push(avg);

        const variance : number = recentValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / notNull;
        const stddev: number = Math.sqrt(variance);

        // @ts-ignore
        if (this.realTimeEstimate == null || this.lowestStdDev > stddev) {
          if (rawData.slice(-10).every(value => value !== null)){
            this.realTimeEstimate = avg.toFixed(2);
            this.lowestStdDev = Number(stddev.toFixed(2));
          } else {
            this.resetEstimate();
          }
        }
        this.stdDev = stddev.toFixed(2);
      }

      while (rawData.length > width) {
        labels.shift();
        rawData.shift();
        averageData.shift();
      }
    }

    this.counter++;
    if (this.chart) {
      this.chart.update();
    }
  }

  public lastestAverage() : string {
    let latestV : number | null = this.lineChartData.datasets[1].data[this.lineChartData.datasets[1].data.length-1] as number | null;
    if (isNumber(latestV)){
      return latestV.toFixed(2);
    }
    return "0";
  }

  public resetEstimate() : void{
    this.realTimeEstimate = null;
    this.lowestStdDev = null;
    this.feedbackMessage = null;
  }

  public resetFeedback() : void{
    this.resetEstimate();
    this.isProcessing = false;
  }

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Real Time',
        borderColor: '#94897980',
        backgroundColor: '#94897900',
        fill: false,
      },
      {
        data: [],
        label: '10 - Average',
        borderColor: '#3C5B6F',
        backgroundColor: "#3C5B6F4D",
        fill: true,
        datalabels: {
          color: "#3C5B6F",
          display: function(context) {
            return window.innerWidth > 600;
          },
          align: "top",
          formatter: Math.round,
          padding: 10,
          font: {
            weight: "bold"
          }
        }
      }
    ],
    labels: []
  };

  public lineChartOptions: ChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    animation: {
      duration: 0, // Disable all animations
      easing: 'linear'
    },
    scales: {
      x: {
        display: false,
        title: {
          display: true,
          text: 'Measurements'
        },
        ticks: {
          stepSize: 10 // Set step size for x-axis ticks
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Weight (kg)'
        },
        beginAtZero: true,
        max: 110,
        ticks: {
          stepSize: 10
        },
      }
    },
    elements: {
      line: {
        tension: 0.4 // Adjust line curve
      },
      point: {
        radius: 3, // Point radius
        hitRadius: 5,
        hoverRadius: 5
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'rgb(0, 0, 0)',
          font: {
            weight: 'bold',
            size: 16
          },
        },

      },
      tooltip: {
        enabled: false
      },
      datalabels: {
        display: false // Disable datalabels globally
      }
    }
  };

  ngOnInit() {
    this.mqttService.subscribe('measurements/realtime');
  }

  public getStdDevColor(stddev: string | undefined): string {

    if (!stddev){
      return `rgb(${46}, ${125}, 50)`
    }
    const stdDevValue = parseFloat(stddev);
    const maxStdDev : number = 5; // Define the maximum stdDev value for red color
    const minStdDev: number = 0;  // Define the minimum stdDev value for green color

    // Clamp the stdDevValue between minStdDev and maxStdDev
    const clampedStdDev : number = Math.max(minStdDev, Math.min(maxStdDev, stdDevValue));

    // Calculate the proportion of red and green
    const red : number = Math.min(95, Math.floor((clampedStdDev / maxStdDev) * 255));
    const green : number = Math.min(150, Math.floor(((maxStdDev - clampedStdDev) / maxStdDev) * 255));

    return `rgb(${red}, ${green}, 31)`;
  }

  public onPostFinal(): void {
    const weight = this.realTimeEstimate;
    const stddev = this.lowestStdDev?.toString();
    if (weight == null || stddev == null){
      return;
    }
    this.restService.postFinal(weight, stddev).subscribe({
      next: (value) : void => {
        this.resetEstimate(); // Weight: {{ realTimeEstimate }} kg | StdDev: {{lowestStdDev}} kg
        this.feedbackMessage = `Weight ${weight} kg | StdDev: ${stddev} kg`;
        this.showDeleteLast = true;
        console.log("REST reported weight:", weight);
      },
      error: (error) : void => {
        this.feedbackMessage = `Error: ${error.message}`;
        console.log("ERROR: posting weight failed", error);
      },
      complete: () : void => {
        console.log("Post request completed");
      }
    });
  }

  public onDeleteLastFinal(): void {
    this.restService.deleteLastFinal().subscribe({
      next: (value: DeleteResponse) : void => {
        this.showDeleteLast = false;
        this.feedbackMessage = `Weight ${value.weight} kg | StdDev: ${value.stddev} kg`;
        console.log("REST deleted weight:", value.weight);
      },
      error: (error) : void => {
        this.feedbackMessage = `Error storing weight: ${error.message}`;
        console.log("ERROR: posting weight failed", error);
      },
      complete: () : void => {
        console.log("Post request completed");
      }
    });
  }

  handleAction(action: () => void, isProcessingKey: 'isProcessing') {
    if (this.realTimeEstimate != null) {
      this[isProcessingKey] = true;
      action();
      setTimeout(() => {
        this[isProcessingKey] = false;
      }, 2000); // Adjust the delay based on your process duration
    }
  }

  handleResetClick() {
    this.handleAction(() => this.resetEstimate(), 'isProcessing');
  }

  handleRevertClick() {
    this.onDeleteLastFinal();
  }

  handleSubmitClick() {
    this.onPostFinal();
    this.isProcessing = true;
  }

}
