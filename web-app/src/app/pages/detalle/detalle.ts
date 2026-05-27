import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Producto } from '../../data/productos';
import { CarritoService } from '../../servicios/carrito.service';
import { ProductosService } from '../../servicios/productos.service';
import { PrecioPipe } from '../../utilidades/precio.pipe';

@Component({
  selector: 'app-detalle',
  imports: [RouterLink, PrecioPipe],
  templateUrl: './detalle.html',
  styleUrl: './detalle.scss'
})
export class DetallePage {
  private readonly router = inject(Router);
  private readonly productosApi = inject(ProductosService);
  protected readonly carrito = inject(CarritoService);

  readonly id = input.required<string>();

  protected readonly producto = signal<Producto | undefined>(undefined);
  protected readonly cargando = signal(true);
  protected readonly cantidad = signal(1);

  protected readonly subtotal = computed(() => {
    const p = this.producto();
    return p ? p.precio * this.cantidad() : 0;
  });

  constructor() {
    effect(() => {
      const id = Number(this.id());
      this.cargando.set(true);
      this.cantidad.set(1);
      this.productosApi.obtenerPorId(id).subscribe({
        next: (producto) => {
          this.producto.set(producto);
          this.cargando.set(false);
        },
        error: () => {
          this.producto.set(undefined);
          this.cargando.set(false);
        }
      });
    });
  }

  protected incrementar(): void {
    this.cantidad.update((n) => n + 1);
  }

  protected decrementar(): void {
    this.cantidad.update((n) => Math.max(1, n - 1));
  }

  protected add(): void {
    const p = this.producto();
    if (!p) return;
    this.carrito.agregar(p, this.cantidad());
    this.router.navigate(['/carrito']);
  }
}
