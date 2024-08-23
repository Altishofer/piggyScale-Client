import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ScaleComponent} from "./pages/scale/scale.component";
import {OverviewComponent} from "@modules/home/pages/overview/overview.component";
import {BoxComponent} from "@modules/home/pages/box/box.component";
import {InputComponent} from "@modules/home/pages/input/input.component";
import {ExportComponent} from "@modules/home/pages/export/export.component";

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
  },
  {
    path:'input',
    component: InputComponent
  },
  {
    path:'export',
    component: ExportComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
