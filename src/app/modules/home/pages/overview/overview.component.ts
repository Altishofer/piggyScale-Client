import {ChangeDetectorRef, Component} from '@angular/core';
import {BaseChartDirective} from "ng2-charts";
import {CommonModule, NgIf} from "@angular/common";
import {MqttService} from "@data/services/mqtt.service";
import {RestService} from "@data/services/rest.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    BaseChartDirective,
    NgIf,
    CommonModule
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {
  title: string = "Overview";
  data: any;
  charts: any[] = [];
  confirmationMessage: string | null = null;


  constructor(
    private restService: RestService,
    private route: ActivatedRoute
  ) {

  }


  public onGetOverview(): void {
    this.restService.getOverview().subscribe({
      next: (response) : void => {
        this.data = response;
        this.createCharts();
        this.confirmationMessage = "SUCCESS: REST requesting weight:";
        console.log("SUCCESS: REST requesting weight:");
      },
      error: (error) : void => {
        this.confirmationMessage = "ERROR: requesting weights failed";
        console.log("ERROR: requesting weights failed", error);
      },
      complete: () : void => {
        console.log("GET request completed");
      }
    });
  }

  ngOnInit(): void {
    this.onGetOverview();
  }

  createCharts(): void {
    this.charts = [];
    for (let key in this.data) {
      if (this.data.hasOwnProperty(key)) {
        const dailyWeights: { [date: string]: number[] } = {};

        // Group weights by date
        this.data[key].forEach((item: any) => {
          const date = item.DATE_TIME.split('-')[0]; // Extract date part
          if (!dailyWeights[date]) {
            dailyWeights[date] = [];
          }
          dailyWeights[date].push(item.WEIGHT);
        });

        // Calculate average weight for each date
        const chartLabels = Object.keys(dailyWeights).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        const chartData = chartLabels.map(date => {
          const weights = dailyWeights[date];
          const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
          return totalWeight / weights.length;
        });

        this.charts.push({
          id: key,
          data: {
            labels: chartLabels,
            datasets: [
              {
                data: chartData,
                label: `Box ${key}`,
                borderColor: '#3e95cd',
                fill: false
              }
            ]
          },
          options: {
            maintainAspectRatio: false,
          responsive: true,
          animation: {
          duration: 0, // Disable all animations
            easing: 'linear'
        },
        scales: {
          x: {
            display: true,
              title: {
              display: false,
                text: 'Measurements'
            },
            ticks: {
              maxRotation: 20,
              minRotation: 20
            }
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
              stepSize: 7
            },
          }
        },
        elements: {
          line: {
            tension: 0.4 // Adjust line curve
          },
          point: {
            radius: 7, // Point radius
              hitRadius: 10,
              hoverRadius: 10
          }
        },
        plugins: {
          legend: {
            display: false,
              position: 'top',
              labels: {
              color: 'rgb(0, 0, 0)'
            }
          },
          tooltip: {
            enabled: true,
              mode: 'nearest',
              callbacks: {
              label: function(tooltipItem: { raw: any; }) {
                return `${tooltipItem.raw.toFixed(2)} kg`;
              }
            }
          }
        }
      }
        });
      }
    }
  }

}
