import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ScaleComponent} from "./pages/scale/scale.component";
import {OverviewComponent} from "@modules/home/pages/overview/overview.component";
import {BoxComponent} from "@modules/home/pages/box/box.component";

const routes: Routes = [
  {
    path:'',
    redirectTo: 'scale',
    pathMatch: 'prefix'
  },
  {
    path:'scale',
    component: ScaleComponent
  },
  {
    path:'overview',
    component: OverviewComponent
  },
  {
    path:'box',
    component: BoxComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
