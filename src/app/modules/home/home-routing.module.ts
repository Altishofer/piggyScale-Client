import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ScaleComponent} from "./pages/scale/scale.component";
import {OverviewComponent} from "@modules/home/pages/overview/overview.component";
import {BoxComponent} from "@modules/home/pages/box/box.component";
import {InputComponent} from "@modules/home/pages/input/input.component";
import {ExportComponent} from "@modules/home/pages/export/export.component";
import {LoginComponent} from "@modules/home/pages/login/login.component";
import {loggedInGuard} from "@data/guards/authentication.guard";

const routes: Routes = [
  {
    path:'',
    redirectTo: 'login',
    pathMatch: 'prefix'
  },
  {
    path: 'scale',
    component: ScaleComponent,
    canActivate: [loggedInGuard]
  },
  {
    path:'overview',
    component: OverviewComponent,
    canActivate: [loggedInGuard]
  },
  {
    path:'box',
    component: BoxComponent,
    canActivate: [loggedInGuard]
  },
  {
    path:'input',
    component: InputComponent,
    canActivate: [loggedInGuard]
  },
  {
    path:'export',
    component: ExportComponent,
    canActivate: [loggedInGuard]
  },
  {
    path:'login',
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
