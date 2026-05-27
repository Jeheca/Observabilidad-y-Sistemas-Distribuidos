import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoriaId, CATEGORIAS, Producto } from '../../data/productos';
import { BusquedaService } from '../../servicios/busqueda.service';
import { CarritoService } from '../../servicios/carrito.service';
import { ProductosService } from '../../servicios/productos.service';
import { PrecioPipe } from '../../utilidades/precio.pipe';

@Component({
  selector: 'app-catalogo',
  imports: [RouterLink, PrecioPipe],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss',
})
export class CatalogoPage {
  private readonly productosApi = inject(ProductosService);
  protected readonly busqueda = inject(BusquedaService);
  protected readonly carrito = inject(CarritoService);

  protected readonly categorias = CATEGORIAS;
  protected readonly categoriaActiva = signal<CategoriaId | null>(null);

  // Productos cargados desde el servicio de productos (todos o por categoría).
  private readonly productos = signal<ReadonlyArray<Producto>>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal(false);

  constructor() {
    this.cargar();
  }

  // El texto de búsqueda filtra en el cliente los productos ya cargados.
  protected readonly productosFiltrados = computed<ReadonlyArray<Producto>>(() => {
    const texto = this.busqueda.texto().trim().toLowerCase();
    if (!texto) return this.productos();
    return this.productos().filter(
      (p) =>
        p.nombre.toLowerCase().includes(texto) ||
        p.materiales.some((m) => m.toLowerCase().includes(texto)),
    );
  });

  protected seleccionarCategoria(id: CategoriaId | null): void {
    this.categoriaActiva.set(id);
    this.cargar();
  }

  protected limpiarFiltros(): void {
    this.busqueda.limpiar();
    this.categoriaActiva.set(null);
    this.cargar();
  }

  protected recargar(): void {
    this.cargar();
  }

  protected agregar(producto: Producto, evento: Event): void {
    evento.preventDefault();
    evento.stopPropagation();
    this.carrito.agregar(producto);
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(false);
    const categoria = this.categoriaActiva();
    const peticion = categoria
      ? this.productosApi.obtenerPorCategoria(categoria)
      : this.productosApi.obtenerTodos();
    peticion.subscribe({
      next: (productos) => {
        this.productos.set(productos);
        this.cargando.set(false);
      },
      error: () => {
        this.productos.set([]);
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }
}
