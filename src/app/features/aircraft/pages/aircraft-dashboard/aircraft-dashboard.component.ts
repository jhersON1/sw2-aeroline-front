// src/app/features/aircraft/pages/aircraft-dashboard/aircraft-dashboard.component.ts

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Importar interfaces y servicio
import { AircraftService } from '../../service/aircraft.service';
import { Aircraft } from '../../models/aircraft.interfce';

@Component({
  selector: 'app-aircraft-dashboard',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './aircraft-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AircraftDashboardComponent implements OnInit {
  // Inyección de dependencias
  private aircraftService = inject(AircraftService);
  private router = inject(Router);

  // Observables del servicio
  aircraft$ = this.aircraftService.aircraft$;
  loading$ = this.aircraftService.loading$;

  // Filtros
  searchTerm = '';
  sortBy = 'model';

  // Datos calculados basados en aviones reales
  allAircraft: Aircraft[] = []; // Lista original completa
  filteredAircraft: Aircraft[] = []; // Lista filtrada para mostrar

  ngOnInit() {
    this.loadAircraft();
  }

  private loadAircraft() {
    console.log('🛩️ Cargando aviones del usuario...');
    this.aircraftService.loadUserAircraft().subscribe({
      next: (aircraft) => {
        console.log('✅ Aviones cargados:', aircraft);
        this.allAircraft = [...aircraft]; // Guardar lista original
        this.applyFilters(); // Aplicar filtros desde la lista original
      },
      error: (error) => {
        console.error('❌ Error loading aircraft:', error);
      },
    });
  }

  // ============================================
  // GETTERS PARA ESTADÍSTICAS (basados en lista ORIGINAL)
  // ============================================

  get totalAircraft(): number {
    return this.allAircraft.length;
  }

  get totalSeats(): number {
    return this.allAircraft.reduce(
      (total, aircraft) => total + aircraft.seatsTotal,
      0
    );
  }

  get uniqueModels(): number {
    const models = new Set(this.allAircraft.map((aircraft) => aircraft.model));
    return models.size;
  }

  get averageSeats(): number {
    if (this.allAircraft.length === 0) return 0;
    return Math.round(this.totalSeats / this.allAircraft.length);
  }

  // ============================================
  // NAVEGACIÓN
  // ============================================

  navigateToCreate() {
    this.router.navigate(['/admin/aircraft/create']);
  }

  editAircraft(id: string) {
    this.router.navigate(['/admin/aircraft/edit', id]);
  }

  viewDetails(id: string) {
    this.router.navigate(['/admin/aircraft/edit', id]);
  }

  // ============================================
  // FILTROS Y BÚSQUEDA
  // ============================================

  onSearch() {
    console.log('🔍 Buscando:', this.searchTerm);
    this.applyFilters();
  }

  onSort() {
    console.log('📊 Ordenando por:', this.sortBy);
    this.applyFilters();
  }

  private applyFilters() {
    // SIEMPRE partir de la lista original completa
    let filtered = [...this.allAircraft];

    // Filtro por búsqueda
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (aircraft) =>
          aircraft.model.toLowerCase().includes(searchLower) ||
          aircraft.registration.toLowerCase().includes(searchLower) ||
          (aircraft.configuration &&
            aircraft.configuration.toLowerCase().includes(searchLower))
      );
      console.log(
        `🔍 Filtrado por "${this.searchTerm}": ${filtered.length} resultados`
      );
    } else {
      console.log('🔍 Sin filtro de búsqueda, mostrando todos los aviones');
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'model':
          return a.model.localeCompare(b.model);
        case 'registration':
          return a.registration.localeCompare(b.registration);
        case 'seatsTotal':
          return b.seatsTotal - a.seatsTotal; // Descendente
        case 'createdAt':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ); // Más recientes primero
        default:
          return 0;
      }
    });

    // Actualizar la lista filtrada
    this.filteredAircraft = filtered;
    console.log(
      `📊 Lista final: ${this.filteredAircraft.length} aviones mostrados`
    );
  }

  // ============================================
  // ACCIONES CRUD
  // ============================================

  deleteAircraft(id: string) {
    const aircraft = this.allAircraft.find((a) => a.id === id);
    const confirmMessage = aircraft
      ? `¿Estás seguro de que deseas eliminar el avión ${aircraft.model} (${aircraft.registration})?`
      : '¿Estás seguro de que deseas eliminar este avión?';

    if (confirm(confirmMessage)) {
      console.log('🗑️ Eliminando avión:', id);
      this.aircraftService.deleteAircraft(id).subscribe({
        next: (success) => {
          if (success) {
            console.log('✅ Avión eliminado exitosamente');
            this.loadAircraft(); // Recargar datos desde el servidor
          } else {
            console.warn('⚠️ La eliminación no fue confirmada por el servidor');
            alert('No se pudo eliminar el avión. Inténtalo de nuevo.');
          }
        },
        error: (error) => {
          console.error('❌ Error eliminando avión:', error);

          // Mostrar mensaje de error más específico
          let errorMessage = 'Error al eliminar el avión.';

          if (error.graphQLErrors?.length > 0) {
            errorMessage = error.graphQLErrors[0].message;
          } else if (error.networkError) {
            errorMessage = 'Error de conexión. Verifica tu internet.';
          }

          alert(errorMessage + ' Por favor, intenta de nuevo.');
        },
      });
    }
  }

  refreshData() {
    console.log('🔄 Refrescando datos...');
    this.aircraftService.refreshAircraft();
    this.loadAircraft();
  }

  // ============================================
  // UTILIDADES
  // ============================================

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  formatDateTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  getBrandFromModel(model: string): string {
    const modelLower = model.toLowerCase();
    if (modelLower.includes('boeing')) return 'Boeing';
    if (modelLower.includes('airbus')) return 'Airbus';
    if (modelLower.includes('embraer')) return 'Embraer';
    if (modelLower.includes('bombardier')) return 'Bombardier';
    return 'Otro';
  }

  getSeatsCategoryColor(seats: number): string {
    if (seats <= 100) return 'text-green-600'; // Pequeño
    if (seats <= 200) return 'text-blue-600'; // Mediano
    if (seats <= 350) return 'text-orange-600'; // Grande
    return 'text-red-600'; // Muy grande
  }

  getSeatsCategoryLabel(seats: number): string {
    if (seats <= 100) return 'Pequeño';
    if (seats <= 200) return 'Mediano';
    if (seats <= 350) return 'Grande';
    return 'Muy Grande';
  }

  // ============================================
  // MÉTODOS ADICIONALES PARA ESTADÍSTICAS
  // ============================================

  getModelDistribution(): {
    model: string;
    count: number;
    percentage: number;
  }[] {
    if (this.allAircraft.length === 0) return [];

    const modelMap = new Map<string, number>();
    this.allAircraft.forEach((aircraft) => {
      const count = modelMap.get(aircraft.model) || 0;
      modelMap.set(aircraft.model, count + 1);
    });

    return Array.from(modelMap.entries())
      .map(([model, count]) => ({
        model,
        count,
        percentage: (count / this.allAircraft.length) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 modelos
  }

  getCapacityDistribution(): {
    small: number;
    medium: number;
    large: number;
    extraLarge: number;
  } {
    const distribution = { small: 0, medium: 0, large: 0, extraLarge: 0 };

    this.allAircraft.forEach((aircraft) => {
      const seats = aircraft.seatsTotal;
      if (seats <= 100) distribution.small++;
      else if (seats <= 200) distribution.medium++;
      else if (seats <= 350) distribution.large++;
      else distribution.extraLarge++;
    });

    return distribution;
  }
}
