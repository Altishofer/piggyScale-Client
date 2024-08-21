import {ChangeDetectorRef, Component} from '@angular/core';
import {RestService} from "@data/services/rest.service";

interface BoxResponse {
  BOX: string;
  DATE_TIME: string;
  ID: number;
  STDDEV: number;
  WEIGHT: number;
}

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [],
  templateUrl: './export.component.html',
  styleUrl: './export.component.css'
})
export class ExportComponent {

  confirmationMessage: string | null = null;
  box_data: BoxResponse[] = [];

  constructor(private cd: ChangeDetectorRef, private restService: RestService) {
    this.onGetExport();
  }

  public onGetExport(): void {
    this.restService.getAll().subscribe({
      next: (response): void => {
        if (Array.isArray(response)) {
          this.box_data = response as BoxResponse[];

          this.box_data.sort((a, b) => {
            const dateA = new Date(a.DATE_TIME).getTime();
            const dateB = new Date(b.DATE_TIME).getTime();
            return dateA - dateB;
          });

          this.confirmationMessage = "SUCCESS: REST requesting export";
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

}
