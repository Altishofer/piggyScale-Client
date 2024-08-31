import {ChangeDetectorRef, Component} from '@angular/core';
import {RestService} from "@data/services/rest.service";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import * as XLSX from 'xlsx';
import { FileSaverService } from 'ngx-filesaver';
import {BoxResponse} from "@data/models/boxResponse.interface"
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './export.component.html',
  styleUrl: './export.component.css'
})
export class ExportComponent {

  box_data: BoxResponse[] = [];
  title: string = "Export";
  feedbackMessage: string | null = null;
  userId: string = "";

  constructor(
    private restService: RestService,
    private fileSaverService: FileSaverService,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe(params => {
      this.userId = params['userId'];
    });
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

          this.exportToExcel();
          console.log("SUCCESS: REST requesting weight:");
        } else {
          console.error("ERROR: Response is not an array", response);
        }
      },
      error: (error): void => {
        this.feedbackMessage = "Server offline, please contact admin.";
        console.log("ERROR: requesting weights failed", error);
      },
      complete: (): void => {
        console.log("GET request completed");
      }
    });
  }

  public resetFeedback(): void {
    this.feedbackMessage = null;
  }

  public exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.box_data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    this.fileSaverService.save(blob, 'box_data.xlsx');
  }

}
