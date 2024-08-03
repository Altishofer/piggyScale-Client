import {Component, OnInit, ChangeDetectorRef, ViewChild} from '@angular/core';
import {MqttService} from "../../../../data/services/mqtt.service";
import {NgFor, NgStyle} from "@angular/common";
import {Chart, ChartConfiguration, ChartData, ChartOptions, registerables} from 'chart.js';
Chart.register(...registerables);

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

  messages: string[] = [];
  title: string = "PiggyScale";
  counter: number = 0;
  stdDev: string = "0";
  public confirmationMessage: string | null = null;
  private estimation_lst: number[] = []
  private estimate: boolean = false;

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  constructor(private mqttService: MqttService, private cd: ChangeDetectorRef, private restService: RestService) {
    this.mqttService.client.on('message', (topic: any, message: { toString: () => string; }) => {
      this.addDataToChart(new Date(), parseFloat(String(message)));
    });
  }

  addDataToChart(time: Date, value: number) {
    const rawData : (number | null)[] = this.lineChartData.datasets[0].data as (number | null)[];
    const averageData : (number | null)[] = this.lineChartData.datasets[1].data as (number | null)[];
    const label: (number | null)[] = this.lineChartData.labels as (number | null)[];

    let width: number = 50;
    [rawData, averageData, label].forEach(function(lst: (number | null)[])
    {
      while (lst.length < width) {
        lst.push(null)
      }
    })

    if (label && rawData && averageData) {
      this.cd.detectChanges();
      label.push(this.counter);
      rawData.push(value);

      if (this.estimate){
        this.estimation_lst.push(value);
      }

      let len : number = 10;
      let total : number = 0;
      let notNull: number = 0;
      while (len > 0) {
        const nextV: number | null = rawData[rawData.length - len];
        if (nextV !== null && !isNaN(nextV)) {
          total += nextV;
          notNull++;
        }
        len--;
      }
      const avg : number = total /  notNull;
      if (total && notNull){
        averageData.push(avg);
      }

      len = 10;
      total = 0;

      if (avg && notNull){
        while (len > 0) {
          const nextV: number | null = rawData[rawData.length - len];
          if (nextV !== null && !isNaN(nextV)) {
            total += Math.pow(nextV - avg, 2);
          }
          len--;
        }
        if (total){
          this.stdDev= Math.pow(total /  notNull, 0.5).toFixed(2);
        }
      }

      if (rawData.length > width) {
        label.shift();
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
        label: 'Measurements',
        borderColor: '#3e95cd',
        fill: false,
      },
      {
        data: [],
        label: 'Average',
        borderColor: '#333333',
        fill: false,
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
          text: 'Weight'
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
          color: 'rgb(0, 0, 0)'
        }
      },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        callbacks: {
          label: function(tooltipItem) {
            return `${tooltipItem.raw} kg`;
          }
        }
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
    const weight = this.lastestAverage()
    this.restService.postFinal(weight).subscribe({
      next: (value) : void => {
        this.confirmationMessage = `Weight ${weight} kg stored successfully.`;
        console.log("REST reported weight:", weight);
      },
      error: (error) : void => {
        this.confirmationMessage = `Error storing weight: ${error.message}`;
        console.log("ERROR: posting weight failed", error);
      },
      complete: () : void => {
        console.log("Post request completed");
      }
    });
  }

  public async computeStatisticsWithoutOutliers(): Promise< {
    mean: number,
    median: number,
    confidenceInterval: [number, number]}> {

    this.estimation_lst = [];
    this.estimate = true;

    delay(1000);

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
    const filteredValues: Number[] = this.estimation_lst.filter(value => value >= lowerBound && value <= upperBound);

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
