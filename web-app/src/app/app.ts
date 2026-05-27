import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CarritoService } from './servicios/carrito.service';
import { BusquedaService } from './servicios/busqueda.service';
import { AutenticacionService } from './servicios/autenticacion.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);
  protected readonly carrito = inject(CarritoService);
  protected readonly busqueda = inject(BusquedaService);
  protected readonly autenticacion = inject(AutenticacionService);

  protected onBusquedaInput(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.busqueda.texto.set(valor);
  }

  protected logout(): void {
    this.autenticacion.logout();
    this.router.navigate(['/login']);
  }
}
