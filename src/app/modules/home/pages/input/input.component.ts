import {ChangeDetectorRef, Component} from '@angular/core';
import {BaseChartDirective} from "ng2-charts";
import {MatProgressBar} from "@angular/material/progress-bar";
import {NgIf} from "@angular/common";
import {MqttService} from "@data/services/mqtt.service";
import {RestService} from "@data/services/rest.service";
import {FormsModule} from "@angular/forms";


interface DeleteResponse {
  weight: number;
  stddev: number;
}


@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    BaseChartDirective,
    MatProgressBar,
    NgIf,
    FormsModule
  ],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent {
  public feedbackMessage: string | null = null;
  public errorMessage: string | null = null;

  public showDeleteLast: boolean = false;
  public isProcessing: boolean = false;

  public lowestStdDev: number | null = 0;
  public realTimeEstimate: string | null = null;

  public title: string = "Manual Input";
  public validInput: boolean = false;

  constructor(private mqttService: MqttService, private cd: ChangeDetectorRef, private restService: RestService) {
  }

  onInputChange(value: string) {
    this.realTimeEstimate = value;
    this.validInput = this.checkIfFloatOrInt(value);
  }

  checkIfFloatOrInt(num: string): boolean {
    if (isNaN(+num) || !isFinite(+num) || /e/i.test(num)){
      return false;
    }
    const fl = parseFloat(num);
    return fl > 0 && fl < 120;
  }

  public resetEstimate() : void{
    this.realTimeEstimate = null;
    this.lowestStdDev = 0;
    this.feedbackMessage = null;
    this.errorMessage = null;
  }

  public onPostFinal(): void {
    const weight = this.realTimeEstimate;
    const stddev = this.lowestStdDev?.toString();
    if (weight == null || stddev == null){
      console.log("one of the following parameters is null");
      console.log("weight: ", weight, "stddev: ", stddev);
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
        this.errorMessage = "Server Offline, please contact Admin.";
        console.log("ERROR: posting weight failed", error);
      },
      complete: () : void => {
        console.log("Post request completed");
      }
    });
  }

  public onDeleteLastFinal(): void {
    this.restService.deleteLastFinal().subscribe({
      next: (value: DeleteResponse): void => {
        this.showDeleteLast = false;
        this.feedbackMessage = `Weight ${value.weight} kg | StdDev: ${value.stddev} kg`;
        console.log("REST deleted weight:", value.weight);
      },
      error: (error): void => {
        this.errorMessage = "Server Offline, please contact Admin.";
        console.log("ERROR: posting weight failed", error);
      },
      complete: (): void => {
        console.log("Post request completed");
      }
    });
  }

  public resetFeedback() : void{
    this.resetEstimate();
  }

  handleResetClick() {
    this.resetEstimate();
    this.validInput = false;
  }

  handleRevertClick() {
    this.onDeleteLastFinal();
  }

  handleSubmitClick() {
    this.onPostFinal();
    this.isProcessing = true;
  }

}
