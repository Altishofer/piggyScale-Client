import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParamsOptions} from '@angular/common/http';
import { CookieService } from "ngx-cookie-service";
import { environment } from "@environments/environment";

import { User } from '@data/models/user.interface'
import {catchError, Observable, tap} from "rxjs";


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
  login(user: User): Observable<any> {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const body: string = JSON.stringify(user);
    return this.http.post(`${this.userUrl}/login`, body, { observe: 'response', headers })
      .pipe(
        tap((response: any) => {
          if ((response.status >= 200 && response.status < 300) || response.status == 304) {
            this.setTokenAndLocalStorage(response.body.token.result, user.userName, response.body.id);
          }
        })
      );
  }

  register(user: User): Observable<any> {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const body: string = JSON.stringify(user);
    return this.http.post(`${this.userUrl}/register`, body, { observe: 'response', headers })
      .pipe(
        tap((response: any) => {
          if ((response.status >= 200 && response.status < 300) || response.status == 304) {
            this.setTokenAndLocalStorage(response.body.token.result, user.userName, response.body.id);
          }
        })
      );
  }
  refreshTokenPeriodically() {
    setInterval(() => {
      const headers: HttpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'Bearer-Token': this.cookieService.get('userToken'),
        'Authorization': `bearer ${this.cookieService.get('userToken')}`
      });
      return this.http.get(`${this.userUrl}/refresh-token`, { observe: 'response', headers })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            console.log(JSON.stringify(error.error));
            return [];
          })
        )
        .subscribe((response: any) => {
          if ((response.status >= 200 && response.status < 300) || response.status == 304) {
            this.setTokenAndLocalStorage(response.body.result, localStorage.getItem('userName')!, localStorage.getItem('userId')!);
            console.log("SUCCESS: refreshing token");
          } else {
            console.log("ERROR: refreshing token was not successful");
          }
        });
    }, 15 * 60 * 1000); // Refresh every 10 seconds
  }

  isUserTokenValid(): boolean {
    const userToken = this.cookieService.get('userToken');
    if (!userToken) {
      return false;
    }

    const tokenExpiration = new Date(this.cookieService.get('userTokenExpiration'));
    const currentTime = new Date();

    // console.log("tokenExpiration", tokenExpiration);
    // console.log("currentTime", currentTime);
    // console.log("stillValid", currentTime < tokenExpiration);
    // console.log("userName", localStorage.getItem("userName"));
    // console.log("userId", localStorage.getItem("userId"));

    return currentTime < tokenExpiration && !!localStorage.getItem('userName') && !!localStorage.getItem('userId');
  }

  setTokenAndLocalStorage(token: string, userName: string, userId: string): void {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 23);
    this.cookieService.set('userToken', token, expirationDate);
    this.cookieService.set('userTokenExpiration', expirationDate.toString(), expirationDate);
    localStorage.setItem('userName', userName);
    localStorage.setItem('userId', userId);
  }

}
