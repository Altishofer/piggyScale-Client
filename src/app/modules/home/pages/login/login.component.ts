import { Component, OnInit } from '@angular/core';
import { User } from "@data/models/user.interface";
import { RestService } from "app/data/services/rest.service";
import { CookieService } from "ngx-cookie-service";
import { catchError, Observable } from "rxjs";
import {Router, RouterLinkActive} from '@angular/router';
import {FormGroup, Validators, FormBuilder, ReactiveFormsModule} from '@angular/forms';
import { Md5 } from "ts-md5";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field";
import {MatDivider} from "@angular/material/divider";
import {CommonModule} from "@angular/common";
import {MatHint, MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [
    MatCard,
    MatCardHeader,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatError,
    MatDivider,
    CommonModule,
    MatLabel,
    MatCardTitle,
    MatHint,
    MatButton,
    MatInput,
    RouterLinkActive
  ],
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit{
  errorMsg : string = '';
  loginForm: FormGroup;
  isLogin: boolean = true;
  unexpectedErrorMsg : string = "An unexpected error occurred."
  statusCodeZero: string = "The server cannot be reached, please try again later."
  constructor(
    private restService: RestService,
    private cookieService: CookieService,
    private router: Router,
    private fb: FormBuilder
  ) {

    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^(\S){1,10}$/), Validators.maxLength(10)]],
      password: ['', [Validators.required, Validators.pattern(/^(\S){1,50}$/)]]
    });

    this.loginForm.valueChanges.subscribe(value => {
      // console.log('Form value changed', value);
    });

    this.loginForm.statusChanges.subscribe(status => {
      if (status == "VALID"){
        this.user.userName = this.loginForm.value.username;
        this.user.userPassword = Md5.hashStr(this.loginForm.value.password);
      }
    });
  };

  ngOnInit() {
  }

  user: User = {
    userName: "",
    userPassword: ""
  };

  toggleForm() {
    this.isLogin = !this.isLogin;
    this.errorMsg = "";
  }

  doLogin(): void {
    this.actionWrapper(this.restService.login.bind(this.restService), "Login");
  }

  doRegister(): void {
    this.actionWrapper(this.restService.register.bind(this.restService), "Register");
  }

  doAction() {
    if (this.loginForm.valid) {
      if (this.isLogin) {
        this.doLogin();
      } else {
        this.doRegister();
      }
    }
  }

  actionWrapper(serviceMethod: (user: User) => Observable<any>, actionName: string): void {
    serviceMethod(this.user)
      .subscribe((response: any): void => {
        if ((response.status >= 200 && response.status < 300) || response.status == 304) {
          this.cookieService.set('userToken', response.body.token.result, new Date().setHours(new Date().getHours() + 1));
          localStorage.setItem('userName', this.user.userName);
          localStorage.setItem('userId', response.body.id);
          this.restService.refreshTokenPeriodically();
          this.router.navigate(["scale", response.body.id]);
        } else {
          this.errorMsg = this.unexpectedErrorMsg;
        }
      });
  }

}

