import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParamsOptions} from '@angular/common/http';
import { CookieService } from "ngx-cookie-service";
import { environment } from "@environments/environment";

import { User } from '@data/models/user.interface'
import {catchError, Observable} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class RestService {

  public hubUrl : string = environment.HUB_URL;
  public userUrl : string = environment.API_URL + "/User";
  public weightUrl : string = environment.API_URL + "/Weight";

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  postFinal(weight: string, stddev: string, box: string): Observable<any> {
    const headers : HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Bearer-Token':  this.cookieService.get("userToken"),
      'Authorization': `bearer ${this.cookieService.get("userToken")}`
    });
    return this.http.post<any>(
      this.weightUrl + "/store",
      { weight: weight, box: box , stddev: stddev},
      { headers: headers }
    );
  }

  deleteLastFinal(): Observable<any> {
    const headers : HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Bearer-Token':  this.cookieService.get("userToken"),
      'Authorization': `bearer ${this.cookieService.get("userToken")}`
    });
    return this.http.post<any>(
      this.weightUrl + "/deleteLast/",
      {},
      { headers: headers }
    );
  }

  getOverview(): Observable<any> {
    const headers : HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Bearer-Token':  this.cookieService.get("userToken"),
      'Authorization': `bearer ${this.cookieService.get("userToken")}`
    });
    return this.http.get<any>(
      this.weightUrl + "/overview",
      { headers: headers }
    );
  }

  getBox(box: string, days: string): Observable<any> {
    const headers : HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Bearer-Token':  this.cookieService.get("userToken"),
      'Authorization': `bearer ${this.cookieService.get("userToken")}`
    });
    return this.http.get<any>(
      this.weightUrl + "/box/" + box + "/" + days,
      { headers: headers }
    );
  }

  getAll(): Observable<any> {
    const headers : HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Bearer-Token':  this.cookieService.get("userToken"),
      'Authorization': `bearer ${this.cookieService.get("userToken")}`
    });
    return this.http.get<any>(
      this.weightUrl + "/export",
      { headers: headers }
    );
  }

  register(user: User): Observable<any> {
    const headers : HttpHeaders = new HttpHeaders ({
      'Content-Type': 'application/json',
    });
    const body : string = JSON.stringify(user);
    return this.http.post(`${this.userUrl}/register`, body, { observe:'response', headers });
  }

  login(user: User): Observable<any> {
    const headers : HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const body : string = JSON.stringify(user);
    return this.http.post(`${this.userUrl}/login`, body, { observe:'response', headers });
  }

  refreshTokenPeriodically() {
    setInterval(() => {
      const headers : HttpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'Bearer-Token':  this.cookieService.get("userToken"),
        'Authorization': `bearer ${this.cookieService.get("userToken")}`
      });
      return this.http.get(`${this.userUrl}/refresh-token`, { observe:'response', headers })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            console.log(JSON.stringify(error.error));
            return[];
          })
        )
        .subscribe((response: any) => {
          if ((response.status >= 200 && response.status < 300) || response.status == 304) {
            this.cookieService.set('userToken', response.body.result, 1);
            console.log("SUCCESS: refreshing token");
          } else {
            console.log("ERROR: refreshing token was not successful");
          }
        });
    }, 10 * 1000);//15 * 60 * 1000); // Refresh every 15 minutes
  }

}
