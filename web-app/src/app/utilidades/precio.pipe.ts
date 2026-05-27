import { Pipe, PipeTransform } from '@angular/core';

const FORMATEADOR = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

@Pipe({ name: 'precio' })
export class PrecioPipe implements PipeTransform {
  transform(valor: number): string {
    return FORMATEADOR.format(valor);
  }
}