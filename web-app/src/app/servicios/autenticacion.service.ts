import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, switchMap, tap, OperatorFunction } from 'rxjs';
import { API } from '../config/api';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

interface ApiUsuario {
  id: number;
  name: string;
  email: string;
}

interface ApiLoginResponse {
  user: ApiUsuario;
  token: string;
}

const CLAVE_SESION = 'taracea.sesion';

@Injectable({ providedIn: 'root' })
export class AutenticacionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API.auth}/auth`;
  readonly usuario = signal<Usuario | null>(readSession());

  login(email: string, password: string): Observable<Usuario> {
    const mapOperator = map((respuesta: ApiLoginResponse) => toUser(respuesta.user))
    const tapOperator: OperatorFunction<Usuario, Usuario> = tap((usuario: Usuario) => this.saveSession(usuario))
    return this.http.post<ApiLoginResponse>(`${this.url}/login`, { email, password }).pipe(mapOperator, tapOperator);
  }

  registrar(nombre: string, email: string, password: string): Observable<Usuario> {
    return this.http
      .post<ApiUsuario>(`${this.url}/register`, { name: nombre, email, password })
      .pipe(switchMap(() => this.login(email, password)));
  }

  logout(): void {
    this.usuario.set(null);
    guardarEnDisco(null);
  }

  private saveSession(usuario: Usuario): void {
    this.usuario.set(usuario);
    guardarEnDisco(usuario);
  }
}

function toUser(api: ApiUsuario): Usuario {
  return { id: api.id, nombre: api.name, email: api.email };
}

function readSession(): Usuario | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const crudo = localStorage.getItem(CLAVE_SESION);
    if (!crudo) return null;
    return JSON.parse(crudo) as Usuario;
  } catch {
    return null;
  }
}

function guardarEnDisco(usuario: Usuario | null): void {
  if (typeof localStorage === 'undefined') return;
  if (usuario) {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
  } else {
    localStorage.removeItem(CLAVE_SESION);
  }
}
