import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";

export const authGuard: CanActivateFn = (route, state): boolean => {
  if (localStorage.getItem('userName') && localStorage.getItem('userId')) {
    if (route.url[0].path.toString() === localStorage.getItem('userId')) {
      return true;
    } else {
      inject(Router).navigate(['user', localStorage.getItem('userId'), 'selection']);
      return false;
    }
  } else {
    inject(Router).navigate(['login']);
    return false;
  }
};

export const loggedInGuard: CanActivateFn = (route, state): boolean => {
  if (localStorage.getItem('userName') && localStorage.getItem('userId')) {
    return true;
  } else {
    inject(Router).navigate(['login'])
    return false;
  }
};
