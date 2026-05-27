import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BusquedaService {
  readonly texto = signal('');

  limpiar(): void {
    this.texto.set('');
  }
}