import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutenticacionService } from '../../servicios/autenticacion.service';
import { mensajeDeError } from '../../utilidades/errores';

type Modo = 'login' | 'registro';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AutenticacionService);
  private readonly router = inject(Router);

  protected readonly modo = signal<Modo>('login');
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  protected cambiarModo(modo: Modo): void {
    if (this.modo() === modo) return;
    this.modo.set(modo);
    this.error.set(null);
  }

  protected enviar(): void {
    if (this.enviando()) return;
    const { nombre, email, password } = this.formulario.getRawValue();
    const esRegistro = this.modo() === 'registro';

    if (!email || !password || (esRegistro && !nombre.trim())) {
      this.formulario.markAllAsTouched();
      this.error.set('Completa todos los campos.');
      return;
    }

    this.enviando.set(true);
    this.error.set(null);
    const peticion = esRegistro ? this.auth.registrar(nombre.trim(), email, password) : this.auth.login(email, password);
    peticion.subscribe({
      next: () => this.router.navigate(['/']),
      error: (respuesta) => {
        this.error.set(mensajeDeError(respuesta));
        this.enviando.set(false);
      }
    });
  }
}
