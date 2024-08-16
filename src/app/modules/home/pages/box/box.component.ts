import {ChangeDetectorRef, Component} from '@angular/core';
import {BaseChartDirective} from "ng2-charts";
import {NgIf} from "@angular/common";
import {RestService} from "@data/services/rest.service";
import {Chart} from "chart.js";
import {Context} from "chartjs-plugin-datalabels";
import 'chartjs-chart-box-and-violin-plot';

interface BoxResponse {
  BOX: string;
  DATE_TIME: string;
  ID: number;
  STDDEV: number;
  WEIGHT: number;
}

@Component({
  selector: 'app-box',
  standalone: true,
  imports: [
    BaseChartDirective,
    NgIf
  ],
  templateUrl: './box.component.html',
  styleUrl: './box.component.css'
})

export class BoxComponent {

  title = "Box";
  current_box: string = "1";
  box_data: BoxResponse[] = [];
  confirmationMessage: string | null = null;
  chart: any = null;
  boxPlotChart: any = null;

  constructor(private cd: ChangeDetectorRef, private restService: RestService) {
    this.onGetBox();
  }

  public onGetBox(): void {
    this.restService.getBox(this.current_box).subscribe({
      next: (response): void => {
        if (Array.isArray(response)) {
          this.box_data = response as BoxResponse[];
          console.log(this.box_data);
          this.createCharts();
          this.createBoxPlot()
          this.confirmationMessage = "SUCCESS: REST requesting box:";
          console.log("SUCCESS: REST requesting weight:");
        } else {
          console.error("ERROR: Response is not an array", response);
        }
      },
      error: (error): void => {
        this.confirmationMessage = "ERROR: requesting weights failed";
        console.log("ERROR: requesting weights failed", error);
      },
      complete: (): void => {
        console.log("GET request completed");
      }
    });
  }

  createCharts(): void {
    const dailyWeights: { [date: string]: number[] } = {};

    // Group weights by date
    this.box_data.forEach((item: BoxResponse) => {
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

    this.chart = {
      id: this.current_box.toString(),
      data: {
        labels: chartLabels,
        datasets: [
          {
            data: chartData,
            label: `Box ${this.current_box}`,
            borderColor: '#1b5e20',
            fill: true,
            datalabels: {
              color: "#fffff",
              display: function (context : Context) {
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
                text: 'Date'
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
              label: function(tooltipItem: { formattedValue: any; }) {
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
      }
    }
  }

  createBoxPlot(): void {
    const weights = this.box_data.map(item => item.WEIGHT);

    this.boxPlotChart = {
      id: 'boxPlot',
      data: {
        labels: ['Weights'],
        datasets: [
          {
            label: 'Box Plot',
            data: [weights],
            backgroundColor: '#1b5e20',
            borderColor: '#1b5e20',
            borderWidth: 1,
            outlierColor: '#ff0000',
            padding: 10,
            itemRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Category'
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
              stepSize: 10
            }
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
              }
            }
          },
          tooltip: {
            enabled: true,
            mode: 'nearest',
            callbacks: {
              label: function(tooltipItem: { formattedValue: any; }) {
                return `${tooltipItem.formattedValue} kg`;
              },
              title: function() {
                return ''; // This ensures the title (label) is empty
              }
            }
          }
        }
      }
    }
  }
}
