import {Component, OnInit, ChangeDetectorRef, ViewChild} from '@angular/core';
import {MqttService} from "../data/services/mqtt.service";
import {NgFor} from "@angular/common";
import {Chart, ChartConfiguration, ChartData, ChartOptions, registerables} from 'chart.js';
Chart.register(...registerables);

import {BaseChartDirective} from "ng2-charts";

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

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  constructor(private mqttService: MqttService, private cd: ChangeDetectorRef) {
    this.mqttService.client.on('message', (topic: any, message: { toString: () => string; }) => {
      this.addDataToChart(new Date(), parseFloat(String(message)));
    });
  }

  addDataToChart(time: Date, value: number) {
    if (this.lineChartData.labels && this.lineChartData.datasets) {
      this.cd.detectChanges();
      this.lineChartData.labels.push(this.counter);
      this.lineChartData.datasets[0].data.push(value);
      while (this.lineChartData.datasets[0].data.length < 20) {
        this.lineChartData.labels.push(null);
        this.lineChartData.datasets[0].data.push(null);
        console.log("pushed");
      }

      if (this.lineChartData.datasets[0].data.length > 20) {
        this.lineChartData.labels.shift();
        this.lineChartData.datasets[0].data.shift();
      }
    }
    this.counter++;
    if (this.chart) {
      this.chart.update();
    }
  }

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Measurements',
        borderColor: '#3e95cd',
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
        display: true,
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
