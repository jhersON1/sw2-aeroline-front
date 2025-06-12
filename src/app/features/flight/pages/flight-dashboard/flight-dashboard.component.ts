import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FlightAdminService, FlightAdmin } from '../../../../admin/services/flight-admin.service';

@Component({
  selector: 'app-flight-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Gestión de Vuelos</h1>
          <p class="text-gray-600 mt-1">Administra todos los vuelos de tu aerolínea</p>
        </div>
        <div class="mt-4 sm:mt-0">
          <a routerLink="create" 
             class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Crear Vuelo
          </a>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos los estados</option>
              <option value="PROGRAMADO">Programado</option>
              <option value="EN_VUELO">En Vuelo</option>
              <option value="ATERRIZADO">Aterrizado</option>
              <option value="CANCELADO">Cancelado</option>
              <option value="RETRASADO">Retrasado</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
            <input type="date" [(ngModel)]="filterDateFrom" (ngModelChange)="applyFilters()"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
            <input type="date" [(ngModel)]="filterDateTo" (ngModelChange)="applyFilters()"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="flex items-end">
            <button (click)="clearFilters()" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (loading) {
        <div class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Cargando vuelos...</p>
        </div>
      }

      <!-- Flights Table -->
      @if (!loading && filteredFlights.length > 0) {
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vuelo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aeronave</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horarios</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (flight of filteredFlights; track flight.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ flight.code }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        {{ flight.origin.code }} → {{ flight.destination.code }}
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ flight.origin.city }} → {{ flight.destination.city }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ flight.aircraft.model }}</div>
                      <div class="text-xs text-gray-500">{{ flight.aircraft.registration }} • {{ flight.aircraft.seatsTotal }} asientos</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        {{ formatTime(flight.departureTime) }} - {{ formatTime(flight.arrivalTime) }}
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ formatDate(flight.departureTime) }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-green-600">
                        {{ flight.price | currency:'BOB':'symbol':'1.0-0' }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [class]="getStatusClass(flight.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ getStatusText(flight.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <a [routerLink]="['edit', flight.id]" 
                         class="text-blue-600 hover:text-blue-900">Editar</a>
                      <button (click)="duplicateFlight(flight)" 
                              class="text-green-600 hover:text-green-900">Duplicar</button>
                      <button (click)="deleteFlight(flight)" 
                              class="text-red-600 hover:text-red-900">Eliminar</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (!loading && filteredFlights.length === 0) {
        <div class="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">No hay vuelos</h2>
          <p class="text-gray-600 mb-4">Comienza creando tu primer vuelo.</p>
          <a routerLink="create" 
             class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Crear Primer Vuelo
          </a>
        </div>
      }
    </div>
  `
})
export class FlightDashboardComponent implements OnInit {
  flights: FlightAdmin[] = [];
  filteredFlights: FlightAdmin[] = [];
  loading = true;

  // Filtros
  filterStatus = '';
  filterDateFrom = '';
  filterDateTo = '';

  constructor(private flightAdminService: FlightAdminService) {}

  ngOnInit() {
    this.loadFlights();
  }

  loadFlights() {
    this.loading = true;
    this.flightAdminService.getAllFlights().subscribe({
      next: (flights) => {
        this.flights = flights;
        this.filteredFlights = flights;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading flights:', error);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.flights];

    if (this.filterStatus) {
      filtered = filtered.filter(f => f.status === this.filterStatus);
    }

    if (this.filterDateFrom) {
      filtered = filtered.filter(f => 
        new Date(f.departureTime) >= new Date(this.filterDateFrom)
      );
    }

    if (this.filterDateTo) {
      filtered = filtered.filter(f => 
        new Date(f.departureTime) <= new Date(this.filterDateTo + 'T23:59:59')
      );
    }

    this.filteredFlights = filtered;
  }

  clearFilters() {
    this.filterStatus = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.filteredFlights = [...this.flights];
  }

  duplicateFlight(flight: FlightAdmin) {
    // TODO: Implementar duplicación
    console.log('Duplicating flight:', flight);
  }

  deleteFlight(flight: FlightAdmin) {
    if (confirm(`¿Estás seguro de eliminar el vuelo ${flight.code}?`)) {
      this.flightAdminService.deleteFlight(flight.id).subscribe({
        next: () => {
          this.loadFlights();
        },
        error: (error) => {
          console.error('Error deleting flight:', error);
        }
      });
    }
  }

  formatTime(dateTimeString: string): string {
    return new Date(dateTimeString).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  formatDate(dateTimeString: string): string {
    return new Date(dateTimeString).toLocaleDateString('es-ES');
  }

  getStatusClass(status: string): string {
    const classes = {
      'PROGRAMADO': 'bg-blue-100 text-blue-800',
      'EN_VUELO': 'bg-green-100 text-green-800',
      'ATERRIZADO': 'bg-gray-100 text-gray-800',
      'CANCELADO': 'bg-red-100 text-red-800',
      'RETRASADO': 'bg-yellow-100 text-yellow-800'
    };
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  getStatusText(status: string): string {
    const texts = {
      'PROGRAMADO': 'Programado',
      'EN_VUELO': 'En Vuelo',
      'ATERRIZADO': 'Aterrizado',
      'CANCELADO': 'Cancelado',
      'RETRASADO': 'Retrasado'
    };
    return texts[status as keyof typeof texts] || status;
  }
}
