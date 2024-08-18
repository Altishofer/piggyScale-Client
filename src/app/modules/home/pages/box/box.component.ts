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
  currentBox: string = "1";
  box_data: BoxResponse[] = [];
  confirmationMessage: string | null = null;
  chart: any = null;
  boxPlotChart: any = null;
  barChart: any = null;

  constructor(private cd: ChangeDetectorRef, private restService: RestService) {
    this.onGetBox(this.currentBox);
  }

  public onGetBox(box: string): void {
    this.restService.getBox(box).subscribe({
      next: (response): void => {
        if (Array.isArray(response)) {
          this.box_data = response as BoxResponse[];

          this.box_data.sort((a, b) => {
            const dateA = new Date(a.DATE_TIME).getTime();
            const dateB = new Date(b.DATE_TIME).getTime();
            return dateA - dateB;
          });

          this.createCharts();
          this.createBarChart()
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

  onChartChange(box: string) {
    this.currentBox = box;
    this.onGetBox(this.currentBox);
  }

  createCharts(): void {
    const dailyWeights: { [date: string]: number[] } = {};

    // Group weights by date
    this.box_data.forEach((item: BoxResponse) => {
      const dateTime = item.DATE_TIME.split('-')[0]; // Extract date part "DD.MM.YYYY"
      const [day, month, year] = dateTime.split('.'); // Split by '.' to get day, month, year

      // Convert to "YYYY-MM-DD" format for correct sorting
      const formattedDate = `${year}-${month}-${day}`;

      if (!dailyWeights[formattedDate]) {
        dailyWeights[formattedDate] = [];
      }
      dailyWeights[formattedDate].push(item.WEIGHT);
    });

    // Sort the dates in "YYYY-MM-DD" format
    const sortedDates = Object.keys(dailyWeights).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    // Convert back to "DD.MM.YYYY" format after sorting
    const chartLabels = sortedDates.map(date => {
      const [year, month, day] = date.split('-');
      return `${day}.${month}.${year}`;
    });

    const chartData = sortedDates.map(date => {
      const weights = dailyWeights[date];
      const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
      return totalWeight / weights.length;
    });

    this.chart = {
      id: this.currentBox.toString(),
      data: {
        labels: chartLabels, // Use "DD.MM.YYYY" format for the labels
        datasets: [
          {
            data: chartData,
            borderColor: '#3C5B6F',
            backgroundColor: "#3C5B6F4D",
            fill: true,
            datalabels: {
              color: "#3C5B6F",
              display: function(context: any) {
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
              display: false
            },
            ticks: {
              autoSkip: true,
              maxRotation: 20,
              minRotation: 20,
              color: '#000000'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Weight (kg)',
              color: '#3C5B6F',
              font: {
                size: 14
              }
            },
            beginAtZero: true,
            max: 110,
            ticks: {
              autoSkip: false,
              color: '#3C5B6F',
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
            display: false
          },
          tooltip: {
            enabled: false
          },
          datalabels: {
            display: false
          }
        }
      }
    };
  }




  createBarChart(): void {
    const weightCategories = Array.from({length: 12}, (_, i) => i * 10);
    const categoryCounts = new Array(weightCategories.length).fill(0);

    this.box_data.forEach(box => {
      const weight = box.WEIGHT;
      if (weight >= 0 && weight <= 110) {
        const categoryIndex = Math.floor(weight / 10);
        categoryCounts[categoryIndex]++;
      }
    });

    this.barChart = {
      options: {
        maintainAspectRatio: false,
        responsive: true,
        animation: {
          duration: 0,
        },
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          },
          datalabels: {
            display: function (context: any) {
              return window.innerWidth > 600;
            },
            color: '#3C5B6F',
            font: {
              weight: 'bold'
            },
            formatter: (value: number) => {
              return value === 0 ? '' : value;
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: '#3C5B6F',
              autoSkip: false,
            },
            title: {
              display: true,
              text: 'Measurements',
              color: '#3C5B6F',
              font: {
                size: 14
              }
            }
          },
          y: {
            grid: {
              display: true,
              borderColor: '#3C5B6F',
              drawBorder: true,
              drawTicks: true, // Draw ticks for each y-axis label
            },
            ticks: {
              color: '#3C5B6F', // Color of y-axis ticks
              autoSkip: false, // Ensure all y-axis labels are shown
              maxTicksLimit: weightCategories.length, // Ensure enough grid lines for y-axis labels
              stepSize: 1 // Set a step size to ensure each label has a corresponding grid line
            },
            title: {
              display: true,
              text: 'Weight Class (kg)',
              color: '#3C5B6F',
              font: {
                size: 14
              }
            }
          }
        }
      },
      labels: weightCategories.map(w => `${w}-${w + 10}`).reverse(),
      datasets: [{
        label: 'Weight Categories (kg)',
        data: categoryCounts.reverse(),
        backgroundColor: this.generateGreenGradientColors(categoryCounts.length),
        borderColor: 'rgba(0, 0, 0, 0)',
        borderWidth: 2,
        barThickness: function (context: any) {
          return window.innerWidth > 600 ? 10 : 10;
        },
        minBarLength: 10
      }]
    };

  }


  public generateGreenGradientColors(numColors: number) {
    const startColor = { r: 27, g: 94, b: 32 }; // Dark green
    const endColor = { r: 27, g: 220, b: 32 };   // Bright green
    const colors = [];

    for (let i = 0; i < numColors; i++) {
      const ratio = i / (numColors - 1); // Ratio for gradient
      const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
      const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
      const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));
      colors.push(`rgba(${r}, ${g}, ${b}, 1)`); // Add alpha for transparency
    }

    return colors;
  }
}
