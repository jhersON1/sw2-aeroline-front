import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Si está autenticado, permitir acceso
    if (this.authService.isLoggedIn()) {
      return true;
    }
    
    // Si no está autenticado, permitir acceso pero mostrar mensaje informativo
    // En una aplicación real, aquí redirigirías al login
    console.log('💡 Acceso al dashboard sin autenticación - Datos de demostración');
    return true; // Permitir acceso para demostración
  }
}
