import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../servicios/autenticacion.service';


export const sesionGuard: CanActivateChildFn = () => {
  const router = inject(Router);
  if (inject(AutenticacionService).usuario()) return true;
  return router.createUrlTree(['/login']);
};

export const invitadoGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (inject(AutenticacionService).usuario()) return router.createUrlTree(['/']);
  return true;
};
