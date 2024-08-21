import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  private apiUrl = 'http://10.215.39.1:8000'; // Replace with your API URL

  constructor(private http: HttpClient) {}

  postFinal(weight: string, stddev: string): Observable<any> {
    return this.http.post<any>(
      this.apiUrl + "/final",
      { weight: weight, box: 1 , stddev: stddev},
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  deleteLastFinal(): Observable<any> {
    return this.http.post<any>(
      this.apiUrl + "/deleteLast",
      {},
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  getOverview(): Observable<any> {
    return this.http.get<any>(
      this.apiUrl + "/overview",
      { headers: { 'Content-Type': 'application/json' }
      });
    }

    getBox(box: string, timeLine: string): Observable<any> {
      return this.http.get<any>(
        this.apiUrl + "/box/" + box + "/" + timeLine,
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

  getAll(): Observable<any> {
    return this.http.get<any>(
      this.apiUrl + "/export",
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
