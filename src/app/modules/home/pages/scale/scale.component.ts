import {Component, OnInit, ChangeDetectorRef, ViewChild} from '@angular/core';
import {MqttService} from "../../../../data/services/mqtt.service";
import {NgFor} from "@angular/common";
import {Chart, ChartConfiguration, ChartData, ChartOptions, registerables} from 'chart.js';
Chart.register(...registerables);

import {BaseChartDirective} from "ng2-charts";
import {min} from "rxjs";
import {each, isNumber} from "chart.js/helpers";

@Component({
  selector: 'app-scale',
  standalone: true,
  imports: [NgFor, BaseChartDirective],
  templateUrl: './scale.component.html',
  styleUrl: './scale.component.css'
})
export class ScaleComponent {

  messages: string[] = [];
  title: string = "PiggyScale";
  counter: number = 0;
  stdDev: string = "0";


  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  constructor(private mqttService: MqttService, private cd: ChangeDetectorRef) {
    this.mqttService.client.on('message', (topic: any, message: { toString: () => string; }) => {
      this.addDataToChart(new Date(), parseFloat(String(message)));
    });
  }

  addDataToChart(time: Date, value: number) {
    const rawData : (number | null)[] = this.lineChartData.datasets[0].data as (number | null)[];
    const averageData : (number | null)[] = this.lineChartData.datasets[1].data as (number | null)[];
    const label: (number | null)[] = this.lineChartData.labels as (number | null)[];

    if (label && rawData && averageData) {
      this.cd.detectChanges();
      label.push(this.counter);
      rawData.push(value);

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

      let width: number = 50;
      [rawData, averageData, label].forEach(function(lst: (number | null)[])
      {
        while (lst.length < width) {
          lst.push(null)
        }
      })

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

}
