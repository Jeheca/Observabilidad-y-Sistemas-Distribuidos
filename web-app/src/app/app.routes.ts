import { Routes } from '@angular/router';
import { invitadoGuard, sesionGuard } from './guards/sesion.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Ingresar · Taracea',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage)
  },
  {
    path: '',
    canActivateChild: [sesionGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Catálogo · Taracea',
        loadComponent: () => import('./pages/catalogo/catalogo').then((m) => m.CatalogoPage)
      },
      {
        path: 'producto/:id',
        title: 'Producto · Taracea',
        loadComponent: () => import('./pages/detalle/detalle').then((m) => m.DetallePage)
      },
      {
        path: 'nuevo-producto',
        title: 'Nuevo producto · Taracea',
        loadComponent: () =>
          import('./pages/nuevo-producto/nuevo-producto').then((m) => m.NuevoProductoPage)
      },
      {
        path: 'carrito',
        title: 'Carrito · Taracea',
        loadComponent: () => import('./pages/carrito/carrito').then((m) => m.CarritoPage)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
