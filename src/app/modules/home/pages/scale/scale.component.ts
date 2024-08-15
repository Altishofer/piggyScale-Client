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

    const width: number = 50;
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
            this.realTimeEstimate = avg.toString();
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

  public resetEstimate(){
    this.realTimeEstimate = null;
    this.lowestStdDev = null;
    this.feedbackMessage = null;
  }

  public lastestRaw() : string {
    let latestV : number | null = this.lineChartData.datasets[0].data[this.lineChartData.datasets[0].data.length-1] as number | null;
    if (isNumber(latestV)){
      return latestV.toFixed(2);
    }
    return "0";
  }

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Real Time',
        borderColor: 'rgba(151,175,152,0.44)',
        backgroundColor: 'rgba(151,175,152,0.44)',
        fill: false,
      },
      {
        data: [],
        label: '10 - Average',
        borderColor: '#1b5e20',
        fill: true,
        datalabels: {
          color: "#fffff",
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
        enabled: true,
        mode: 'nearest',
        callbacks: {
          label: function(tooltipItem) {
            return `${tooltipItem.formattedValue} kg`;
          },
          title: function() {
            return ''; // This ensures the title (label) is empty
          }
        }
      },
      datalabels: {
        display: false // Disable datalabels globally
      }
    }
  };

  ngOnInit() {
    this.mqttService.subscribe('measurements/realtime');
  }

  public getStdDevColor(): string {
    const stdDevValue = parseFloat(this.stdDev);
    const maxStdDev : number = 10; // Define the maximum stdDev value for red color
    const minStdDev: number = 0;  // Define the minimum stdDev value for green color

    // Clamp the stdDevValue between minStdDev and maxStdDev
    const clampedStdDev : number = Math.max(minStdDev, Math.min(maxStdDev, stdDevValue));

    // Calculate the proportion of red and green
    const red : number = Math.min(255, Math.floor((clampedStdDev / maxStdDev) * 255));
    const green : number = Math.min(150, Math.floor(((maxStdDev - clampedStdDev) / maxStdDev) * 255));

    return `rgb(${red}, ${green}, 0)`;
  }

  public onPostFinal(): void {
    const weight = this.realTimeEstimate;
    if (weight == null){
      return;
    }
    this.restService.postFinal(weight).subscribe({
      next: (value) : void => {
        this.resetEstimate();
        this.feedbackMessage = `Weight ${weight} kg stored successfully.`;
        console.log("REST reported weight:", weight);
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

  public onDeleteLastFinal(): void {
    this.restService.deleteLastFinal().subscribe({
      next: (value) : void => {
        this.resetEstimate();
        this.feedbackMessage = `Weight ${weight} kg stored successfully.`;
        console.log("REST reported weight:", weight);
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async computeStatisticsWithoutOutliers(): Promise< {
    mean: number,
    median: number,
    confidenceInterval: [number, number]}> {

    this.estimation_lst = [];
    this.estimate = true;

    await delay(4000);

    this.estimate = false;

    if (this.estimation_lst.length === 0) {
      throw new Error("The list of values cannot be empty.");
    }

    // Sort the values
    this.estimation_lst.sort((a, b) => a - b);

    // Calculate Q1 and Q3
    const q1 = this.estimation_lst[Math.floor((this.estimation_lst.length / 4))];
    const q3 = this.estimation_lst[Math.floor((this.estimation_lst.length * (3 / 4)))];
    const iqr = q3 - q1;

    // Calculate lower and upper bounds
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    // Filter out outliers
    const filteredValues: number[] = this.estimation_lst.filter(value => value >= lowerBound && value <= upperBound);

    if (filteredValues.length === 0) {
      throw new Error("All values are considered outliers. Adjust the criteria or check the data.");
    }

    // Calculate the mean of the filtered values
    const mean: number = filteredValues.reduce((sum, value) => sum + value, 0) / filteredValues.length;

    // Calculate the standard deviation of the filtered values
    const stdDev = Math.sqrt(filteredValues.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / (filteredValues.length - 1));

    // Calculate the standard error
    const standardError = stdDev / Math.sqrt(filteredValues.length);

    // 95% confidence interval
    const marginOfError = 1.96 * standardError;
    const confidenceInterval: [number, number] = [mean - marginOfError, mean + marginOfError];

    // Calculate the median of the filtered values
    const middle = Math.floor(filteredValues.length / 2);
    let median: number;
    if (filteredValues.length % 2 === 0) {
      median = (filteredValues[middle - 1] + filteredValues[middle]) / 2;
    } else {
      median = filteredValues[middle];
    }

    this.confirmationMessage2 = `Mean ${mean}, median ${median}, confidentalInverval  [${confidenceInterval[0]}, ${confidenceInterval[1]}]`;

    return {
      mean: mean,
      median: median,
      confidenceInterval: confidenceInterval
    };
  }


  // const stats = computeStatisticsWithoutOutliers(values);
  // console.log(`Mean: ${stats.mean}`);
  // console.log(`Median: ${stats.median}`);
  // console.log(`95% Confidence Interval: [${stats.confidenceInterval[0]}, ${stats.confidenceInterval[1]}]`);


}
