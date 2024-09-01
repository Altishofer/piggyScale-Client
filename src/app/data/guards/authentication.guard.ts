import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { RestService } from '@data/services/rest.service';

export const loggedInGuard: CanActivateFn = (route, state): boolean => {
  const restService = inject(RestService);
  const router = inject(Router);

  if (restService.isUserTokenValid()) {
    return true;
  } else {
    router.navigate(['login']);
    return false;
  }
};
