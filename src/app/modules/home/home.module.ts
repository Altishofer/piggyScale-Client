import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import {ScaleComponent} from "./pages/scale/scale.component";
import {HeaderComponent} from "@layout/header/header.component";
import {FooterComponent} from "@layout/footer/footer.component";
import {BoxComponent} from "@modules/home/pages/box/box.component";


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HomeRoutingModule,
    ScaleComponent,
    HeaderComponent,
    FooterComponent,
    BoxComponent
  ]
})
export class HomeModule { }
