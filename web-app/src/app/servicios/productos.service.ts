import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API } from '../config/api';
import { CategoriaId, ColorMarca, NuevoProducto, Producto } from '../data/productos';


interface ApiMaterial {
  productId: number;
  materialId: number;
  description: string;
}

interface ApiProducto {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  height: number;
  width: number;
  depth: number;
  deliveryTime: string;
  brandColor: string;
  materials: ApiMaterial[];
}

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API.productos}/products`;

  obtenerTodos(): Observable<Producto[]> {
    return this.http.get<ApiProducto[]>(this.url).pipe(map((lista) => lista.map(toProduct)));
  }

  obtenerPorCategoria(categoria: CategoriaId): Observable<Producto[]> {
    return this.http
      .get<ApiProducto[]>(this.url, { params: { category: categoria } })
      .pipe(map((lista) => lista.map(toProduct)));
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.http.get<ApiProducto>(`${this.url}/${id}`).pipe(map(toProduct));
  }

  crear(nuevo: NuevoProducto): Observable<Producto> {
    const cuerpo = {
      name: nuevo.nombre,
      description: nuevo.descripcion,
      price: nuevo.precio,
      stock: nuevo.stock,
      category: nuevo.categoria,
      height: nuevo.dimensiones.alto,
      width: nuevo.dimensiones.ancho,
      depth: nuevo.dimensiones.profundidad,
      deliveryTime: nuevo.tiempoEntrega,
      brandColor: nuevo.colorMarca,
      materials: nuevo.materiales
    };
    return this.http.post<ApiProducto>(this.url, cuerpo).pipe(map(toProduct));
  }
}

function toProduct(api: ApiProducto): Producto {
  return {
    id: api.id,
    nombre: api.name,
    precio: api.price,
    stock: api.stock,
    categoria: api.category as CategoriaId,
    descripcion: api.description,
    materiales: (api.materials ?? []).map((material) => material.description),
    dimensiones: { alto: api.height, ancho: api.width, profundidad: api.depth },
    tiempoEntrega: api.deliveryTime,
    colorMarca: api.brandColor as ColorMarca
  };
}
