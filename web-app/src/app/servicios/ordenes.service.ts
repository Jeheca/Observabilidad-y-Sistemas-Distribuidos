import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../config/api';

export interface LineaOrden {
  productId: number;
  quantity: number;
}

export interface NuevaOrden {
  userId: number;
  customerName: string;
  items: LineaOrden[];
}

export interface Orden {
  id: number;
  total: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class OrdenesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API.ordenes}/orders`;

  crear(orden: NuevaOrden): Observable<Orden> {
    return this.http.post<Orden>(this.url, orden);
  }
}
