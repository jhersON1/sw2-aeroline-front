import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AirlineService } from '../../shared/services/airline.service';

@Component({  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b">
        <div class="container mx-auto px-4 py-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900">{{ airlineName }}</h1>
                <p class="text-sm text-gray-500">Tu viaje comienza aquí</p>
              </div>
            </div>
            <nav class="hidden md:flex space-x-6">
              <a [routerLink]="['/', airlineAlias]" class="text-gray-600 hover:text-blue-600">Inicio</a>
              <a [routerLink]="['/', airlineAlias, 'check-in']" class="text-gray-600 hover:text-blue-600">Check-in</a>
              <a href="#" class="text-gray-600 hover:text-blue-600">Mi Reserva</a>
              <a href="#" class="text-gray-600 hover:text-blue-600">Contacto</a>
            </nav>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main>
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-gray-800 text-white py-8 mt-16">
        <div class="container mx-auto px-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 class="text-lg font-bold mb-4">{{ airlineName }}</h3>
              <p class="text-gray-300">Conectando destinos, creando experiencias inolvidables.</p>
            </div>
            <div>
              <h4 class="font-bold mb-4">Enlaces Útiles</h4>
              <ul class="space-y-2">
                <li><a href="#" class="text-gray-300 hover:text-white">Políticas de Equipaje</a></li>
                <li><a href="#" class="text-gray-300 hover:text-white">Términos y Condiciones</a></li>
                <li><a href="#" class="text-gray-300 hover:text-white">Cancelaciones</a></li>
              </ul>
            </div>
            <div>
              <h4 class="font-bold mb-4">Contacto</h4>
              <ul class="space-y-2">
                <li class="text-gray-300">📞 800-12345</li>
                <li class="text-gray-300">✉️ info{{ '@' }}{{ airlineAlias }}.com</li>
                <li class="text-gray-300">🕒 24/7 Atención al Cliente</li>
              </ul>
            </div>
          </div>
          <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2025 {{ airlineName }}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class PublicLayoutComponent implements OnInit {
  airlineAlias: string = '';
  airlineName: string = '';
  constructor(private route: ActivatedRoute, private airlineService: AirlineService) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.airlineAlias = params['airlineAlias'];
      
      // Obtener información real de la aerolínea desde GraphQL
      this.airlineService.getAirlineByAlias(this.airlineAlias).subscribe({
        next: (airline) => {
          if (airline) {
            this.airlineName = airline.name;
          } else {
            // Fallback si no se encuentra la aerolínea
            this.airlineName = this.formatAirlineName(this.airlineAlias);
          }
        },
        error: (error) => {
          console.error('Error obteniendo aerolínea:', error);
          // Fallback en caso de error
          this.airlineName = this.formatAirlineName(this.airlineAlias);
        }
      });
    });
  }

  private formatAirlineName(alias: string): string {
    // Simple formatting - TODO: Replace with real airline data from backend
    return alias.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') + ' Airlines';
  }
}
