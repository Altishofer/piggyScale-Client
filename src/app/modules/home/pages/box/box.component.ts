import {ChangeDetectorRef, Component} from '@angular/core';
import {BaseChartDirective} from "ng2-charts";
import {NgIf} from "@angular/common";
import {RestService} from "@data/services/rest.service";
import 'chartjs-chart-box-and-violin-plot';
import {MatButtonToggle, MatButtonToggleGroup} from "@angular/material/button-toggle";
import {FormsModule} from "@angular/forms";
import {MatDivider} from "@angular/material/divider";
import {BoxResponse} from "@data/models/boxResponse.interface"
import {ActivatedRoute} from "@angular/router";


@Component({
  selector: 'app-box',
  standalone: true,
  imports: [
    BaseChartDirective,
    NgIf,
    MatButtonToggleGroup,
    MatButtonToggle,
    FormsModule,
    MatDivider
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
  public timeLine: string = "7";
  public errorMessage: string | null = null;


  constructor(
    private restService: RestService,
    private route: ActivatedRoute
  ) {

    this.onGetBox(this.currentBox);
  }

  public onGetBox(box: string): void {
    this.restService.getBox(box, this.timeLine).subscribe({
      next: (response): void => {
        if (Array.isArray(response)) {
          this.box_data = response as BoxResponse[];

          this.box_data.sort((a, b) => {
            const dateA = new Date(a.dateTime).getTime();
            const dateB = new Date(b.dateTime).getTime();
            return dateA - dateB;
          });

          this.createCharts();
          this.createBarChart()
          this.errorMessage = null;
        } else {
          this.errorMessage = "Server Offline, please contact Admin.";
          console.error("ERROR: Response is not an array", response);
        }
      },
      error: (error): void => {
        this.errorMessage = "Server Offline, please contact Admin.";
        console.log("ERROR: requesting weights failed", error);
      },
      complete: (): void => {
        console.log("GET request completed");
      }
    });
  }

  onChartChange() {
    this.onGetBox(this.currentBox);
  }

  display(): boolean {
    return window.innerWidth > 600 && this.timeLine != "0";
  }

  createCharts(): void {
    const dailyWeights: { [date: string]: number[] } = {};

    // Group weights by date
    this.box_data.forEach((item: BoxResponse) => {
      const dateTime = item.dateTime.split(' ')[0]; // Extract date part "DD.MM.YYYY"
      const [ year, month, day] = dateTime.split('.'); // Split by '.' to get day, month, year

      // Convert to "YYYY-MM-DD" format for correct sorting
      const formattedDate = `${year}-${month}-${day}`;

      if (!dailyWeights[formattedDate]) {
        dailyWeights[formattedDate] = [];
      }
      dailyWeights[formattedDate].push(item.weight);
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
              display: this.display.bind(this),
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
            max: 120,
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
      const weight = box.weight;
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
