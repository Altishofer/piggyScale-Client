import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ScaleComponent} from "./pages/scale/scale.component";

const routes: Routes = [
  {
    path:'',
    redirectTo: 'scale',
    pathMatch: 'prefix'
  },
  {
    path:'scale',
    component: ScaleComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
