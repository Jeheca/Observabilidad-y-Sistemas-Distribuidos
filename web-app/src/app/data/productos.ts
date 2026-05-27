export type CategoriaId = 'salas' | 'comedores' | 'dormitorios';
export type ColorMarca = 'berenjena' | 'agua-marina' | 'mostaza';

export interface Producto {
  readonly id: number;
  readonly nombre: string;
  readonly precio: number;
  readonly stock: number;
  readonly categoria: CategoriaId;
  readonly descripcion: string;
  readonly materiales: ReadonlyArray<string>;
  readonly dimensiones: { readonly alto: number; readonly ancho: number; readonly profundidad: number };
  readonly tiempoEntrega: string;
  readonly colorMarca: ColorMarca;
}

export interface NuevoProducto {
  readonly nombre: string;
  readonly descripcion: string;
  readonly precio: number;
  readonly stock: number;
  readonly categoria: CategoriaId;
  readonly materiales: ReadonlyArray<string>;
  readonly dimensiones: { readonly alto: number; readonly ancho: number; readonly profundidad: number };
  readonly tiempoEntrega: string;
  readonly colorMarca: ColorMarca;
}

export interface Categoria {
  readonly id: CategoriaId;
  readonly nombre: string;
}

export const CATEGORIAS: ReadonlyArray<Categoria> = [
  { id: 'salas', nombre: 'Salas' },
  { id: 'comedores', nombre: 'Comedores' },
  { id: 'dormitorios', nombre: 'Dormitorios' }
];

export const COLORES_MARCA: ReadonlyArray<ColorMarca> = ['berenjena', 'agua-marina', 'mostaza'];
