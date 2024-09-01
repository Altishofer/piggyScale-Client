import { Component } from '@angular/core';
import {ActivatedRoute, RouterLink, RouterLinkActive} from "@angular/router";
import {NgIf} from "@angular/common";
import {RestService} from "@data/services/rest.service";
import {FileSaverService} from "ngx-filesaver";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgIf
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(
    private restService: RestService,
    private route: ActivatedRoute
  ) {

  }

  isLoggedIn(): boolean {
    return this.restService.isUserTokenValid();
  }
}
