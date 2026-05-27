import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../servicios/carrito.service';
import { AutenticacionService } from '../../servicios/autenticacion.service';
import { OrdenesService } from '../../servicios/ordenes.service';
import { PrecioPipe } from '../../utilidades/precio.pipe';
import { mensajeDeError } from '../../utilidades/errores';

@Component({
  selector: 'app-carrito',
  imports: [RouterLink, PrecioPipe],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss'
})
export class CarritoPage {
  protected readonly carrito = inject(CarritoService);
  private readonly autenticacion = inject(AutenticacionService);
  private readonly ordenes = inject(OrdenesService);

  protected readonly procesando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly ordenConfirmada = signal<number | null>(null);

  protected readonly total = computed(() => this.carrito.subtotal());

  protected cambiar(id: number, delta: number): void {
    const item = this.carrito.items().find((i) => i.producto.id === id);
    if (!item) return;
    this.carrito.cambiarCantidad(id, item.cantidad + delta);
  }

  protected eliminar(id: number): void {
    this.carrito.eliminar(id);
  }

  protected finalizarCompra(): void {
    if (this.procesando() || this.carrito.items().length === 0) return;

    const usuario = this.autenticacion.usuario();

    if (!usuario) {
      this.error.set('Debes iniciar sesión para finalizar la compra.');
      return;
    }

    this.procesando.set(true);
    this.error.set(null);

    this.ordenes.crear({
      userId: usuario.id,
      customerName: usuario.nombre,
      items: this.carrito.items().map((item) => ({
        productId: item.producto.id,
        quantity: item.cantidad
      }))
    }).subscribe({
      next: (orden) => {
        this.ordenConfirmada.set(orden.id);
        this.carrito.vaciar();
        this.procesando.set(false);
      },
      error: (respuesta) => {
        this.error.set(mensajeDeError(respuesta));
        this.procesando.set(false);
      }
    });
  }
}
