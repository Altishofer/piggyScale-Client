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

  postFinal(weight: string, stddev: string, box: string, userId: string): Observable<any> {
    return this.http.post<any>(
      this.weightUrl + "/store",
      { weight: weight, box: box , stddev: stddev, userId: userId},
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  deleteLastFinal(): Observable<any> {
    return this.http.post<any>(
      this.weightUrl + "/deleteLast",
      {},
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  getOverview(): Observable<any> {
    return this.http.get<any>(
      this.weightUrl + "/overview",
      { headers: { 'Content-Type': 'application/json' }
      });
    }

    getBox(box: string, timeLine: string): Observable<any> {
      return this.http.get<any>(
        this.weightUrl + "/box/" + box + "/" + timeLine,
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

  getAll(): Observable<any> {
    return this.http.get<any>(
      this.weightUrl + "/export",
      { headers: { 'Content-Type': 'application/json' } }
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


  getRound(roundId : string) : Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': "bearer " + this.cookieService.get("userToken"),
      'Content-Type': 'application/json'
    });
    return this.http.get(`${this.weightUrl}/GetRound/${roundId}`, { observe:'response', headers  });
  }


}
