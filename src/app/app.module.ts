import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule} from "@angular/platform-browser";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HeaderComponent } from '@layout/header/header.component';
import { FooterComponent } from '@layout/footer/footer.component';

import {HomeModule} from "@modules/home/home.module";
import { LocationStrategy, PathLocationStrategy} from "@angular/common";
import {HttpClientModule} from "@angular/common/http";
import {MatButtonModule} from '@angular/material/button';
import {RouterModule} from "@angular/router";
import { CommonModule } from '@angular/common';
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HeaderComponent,
    FooterComponent,
    HomeModule,
    HttpClientModule,
    MatButtonModule,
    RouterModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [{
    provide: LocationStrategy,
    useClass: PathLocationStrategy
  }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
