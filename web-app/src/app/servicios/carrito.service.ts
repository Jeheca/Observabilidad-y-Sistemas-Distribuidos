import { Injectable, computed, signal } from '@angular/core';
import { Producto } from '../data/productos';

export interface ItemCarrito {
  readonly producto: Producto;
  readonly cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly $items = signal<ReadonlyArray<ItemCarrito>>([]);

  readonly items = this.$items.asReadonly();

  readonly cantidadTotal = computed(() =>
    this.$items().reduce((acc, item) => acc + item.cantidad, 0)
  );

  readonly subtotal = computed(() =>
    this.$items().reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0)
  );

  agregar(producto: Producto, cantidad = 1): void {
    this.$items.update((items) => {
      const existente = items.find((i) => i.producto.id === producto.id);
      if (existente) return items.map((i) => i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i);
      return [...items, { producto, cantidad }];
    });
  }

  cambiarCantidad(productoId: number, cantidad: number): void {
    if (cantidad < 1) {
      this.eliminar(productoId);
      return;
    }

    this.$items.update((items) => items.map((i) => (i.producto.id === productoId ? { ...i, cantidad } : i)));
  }

  eliminar(productoId: number): void {
    this.$items.update((items) => items.filter((i) => i.producto.id !== productoId));
  }

  vaciar(): void {
    this.$items.set([]);
  }
}
