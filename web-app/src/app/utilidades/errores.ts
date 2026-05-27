import { HttpErrorResponse } from '@angular/common/http';

export function mensajeDeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'No fue posible conectar con el servidor. Verifica que los servicios estén arriba.';
    const cuerpo = error.error as { message?: string | string[] } | null;
    const mensaje = cuerpo?.message;
    if (Array.isArray(mensaje)) return mensaje.join(', ');
    if (typeof mensaje === 'string') return mensaje;
  }

  return 'Ocurrió un error inesperado. Intenta de nuevo.';
}
