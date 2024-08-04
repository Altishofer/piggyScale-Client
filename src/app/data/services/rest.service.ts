import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  private apiUrl = 'http://10.215.39.1:8000'; // Replace with your API URL

  constructor(private http: HttpClient) {}

  postFinal(weight: string): Observable<any> {
    return this.http.post<any>(
      this.apiUrl + "/final",
      { measure: weight, box: 1 },
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  getOverview(): Observable<any> {
    return this.http.get<any>(
      this.apiUrl + "/overview",
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
