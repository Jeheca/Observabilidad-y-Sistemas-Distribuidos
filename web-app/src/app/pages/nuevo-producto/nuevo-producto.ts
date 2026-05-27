import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaId, CATEGORIAS, COLORES_MARCA, ColorMarca, NuevoProducto } from '../../data/productos';
import { ProductosService } from '../../servicios/productos.service';
import { mensajeDeError } from '../../utilidades/errores';

@Component({
  selector: 'app-nuevo-producto',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './nuevo-producto.html',
  styleUrl: './nuevo-producto.scss'
})
export class NuevoProductoPage {
  private readonly fb = inject(FormBuilder);
  private readonly productosApi = inject(ProductosService);
  private readonly router = inject(Router);

  protected readonly categorias = CATEGORIAS;
  protected readonly coloresMarca = COLORES_MARCA;

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(1)]],
    stock: [1, [Validators.required, Validators.min(0)]],
    categoria: ['salas' as CategoriaId, Validators.required],
    alto: [0, [Validators.required, Validators.min(1)]],
    ancho: [0, [Validators.required, Validators.min(1)]],
    profundidad: [0, [Validators.required, Validators.min(1)]],
    tiempoEntrega: ['', Validators.required],
    colorMarca: ['berenjena' as ColorMarca, Validators.required],
    materiales: this.fb.nonNullable.array([this.crearMaterialControl()])
  });

  protected get materialesArray(): FormArray<FormControl<string>> {
    return this.formulario.controls.materiales;
  }

  protected agregarMaterial(): void {
    this.materialesArray.push(this.crearMaterialControl());
  }

  protected quitarMaterial(indice: number): void {
    if (this.materialesArray.length > 1) {
      this.materialesArray.removeAt(indice);
    }
  }

  protected campoInvalido(nombre: string): boolean {
    const control = this.formulario.get(nombre);
    return !!control && control.invalid && control.touched;
  }

  protected enviar(): void {
    if (this.enviando()) return;

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.error.set('Revisa los campos marcados antes de continuar.');
      return;
    }

    const valores = this.formulario.getRawValue();
    const materiales = valores.materiales.map((m) => m.trim()).filter((m) => m.length > 0);

    if (materiales.length === 0) {
      this.error.set('Agrega al menos un material.');
      return;
    }

    const nuevo: NuevoProducto = {
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim(),
      precio: valores.precio,
      stock: valores.stock,
      categoria: valores.categoria,
      tiempoEntrega: valores.tiempoEntrega.trim(),
      colorMarca: valores.colorMarca,
      dimensiones: { alto: valores.alto, ancho: valores.ancho, profundidad: valores.profundidad },
      materiales
    };

    this.enviando.set(true);
    this.error.set(null);
    this.productosApi.crear(nuevo).subscribe({
      next: (producto) => this.router.navigate(['/producto', producto.id]),
      error: (respuesta) => {
        this.error.set(mensajeDeError(respuesta));
        this.enviando.set(false);
      }
    });
  }

  private crearMaterialControl(): FormControl<string> {
    return this.fb.nonNullable.control('', Validators.required);
  }
}
