import { AirportService } from './../../service/airport.service';
import { Airport } from './../../models/airport.interface';
// airport-dashboard.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Importar interfaces de nuestro backend

@Component({
  selector: 'app-airport-dashboard',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './airport-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AirportDashboardComponent implements OnInit {
  // Inyección de dependencias
  private airportService = inject(AirportService);
  private router = inject(Router);

  // Observables del servicio
  airports$ = this.airportService.airports$;
  loading$ = this.airportService.loading$;

  // Filtros
  searchTerm = '';
  sortBy = 'name';

  // Datos calculados basados en aeropuertos reales (solo campos que existen)
  allAirports: Airport[] = []; // ← NUEVO: Lista original completa
  filteredAirports: Airport[] = []; // ← Esta es la lista filtrada para mostrar
  airportsByCountry: { country: string; count: number }[] = [];
  airportsByCities: { city: string; count: number }[] = [];

  ngOnInit() {
    this.loadAirports();
  }

  private loadAirports() {
    this.airportService.getAirports().subscribe({
      next: (airports) => {
        this.allAirports = [...airports]; // ← GUARDAR lista original
        this.calculateStatistics();
        this.applyFilters(); // ← Aplicar filtros desde la lista original
      },
      error: (error) => {
        console.error('Error loading airports:', error);
      },
    });
  }

  private calculateStatistics() {
    // Calcular países (basado en la lista ORIGINAL)
    const countryMap = new Map<string, number>();
    this.allAirports.forEach((airport) => {
      const count = countryMap.get(airport.country) || 0;
      countryMap.set(airport.country, count + 1);
    });

    this.airportsByCountry = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calcular ciudades (basado en la lista ORIGINAL)
    const cityMap = new Map<string, number>();
    this.allAirports.forEach((airport) => {
      const cityKey = `${airport.city}, ${airport.country}`;
      const count = cityMap.get(cityKey) || 0;
      cityMap.set(cityKey, count + 1);
    });

    this.airportsByCities = Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Getters basados en la lista ORIGINAL (no filtrada)
  get totalAirports(): number {
    return this.allAirports.length; // ← Total real de aeropuertos
  }

  get uniqueCountries(): number {
    const countries = new Set(
      this.allAirports.map((airport) => airport.country)
    );
    return countries.size;
  }

  get uniqueCities(): number {
    const cities = new Set(this.allAirports.map((airport) => airport.city));
    return cities.size;
  }

  get longestAirportName(): string {
    if (this.allAirports.length === 0) return 'N/A';
    return this.allAirports.reduce(
      (longest, airport) =>
        airport.name.length > longest.length ? airport.name : longest,
      ''
    );
  }

  navigateToCreate() {
    this.router.navigate(['/admin/airports/create']); // ← Ruta absoluta
  }

  editAirport(id: string) {
    this.router.navigate(['/admin/airports/edit', id]); // ← Ruta absoluta
  }

  viewDetails(id: string) {
    this.router.navigate(['/admin/airports/edit', id]); // ← Ruta absoluta
  }

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
    let filtered = [...this.allAirports];

    // Filtro por búsqueda
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (airport) =>
          airport.name.toLowerCase().includes(searchLower) ||
          airport.code.toLowerCase().includes(searchLower) ||
          airport.city.toLowerCase().includes(searchLower) ||
          airport.country.toLowerCase().includes(searchLower)
      );
      console.log(
        `🔍 Filtrado por "${this.searchTerm}": ${filtered.length} resultados`
      );
    } else {
      console.log('🔍 Sin filtro de búsqueda, mostrando todos los aeropuertos');
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'code':
          return a.code.localeCompare(b.code);
        case 'city':
          return a.city.localeCompare(b.city);
        case 'country':
          return a.country.localeCompare(b.country);
        default:
          return 0;
      }
    });

    // Actualizar la lista filtrada
    this.filteredAirports = filtered;
    console.log(
      `📊 Lista final: ${this.filteredAirports.length} aeropuertos mostrados`
    );
  }

  deleteAirport(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este aeropuerto?')) {
      console.log('🗑️ Eliminando aeropuerto:', id);
      this.airportService.deleteAirport(id).subscribe({
        next: () => {
          console.log('✅ Aeropuerto eliminado exitosamente');
          this.loadAirports(); // Recargar datos desde el servidor
        },
        error: (error) => {
          console.error('❌ Error eliminando aeropuerto:', error);
          alert(
            'Error al eliminar el aeropuerto. Por favor, intenta de nuevo.'
          );
        },
      });
    }
  }

  refreshData() {
    console.log('🔄 Refrescando datos...');
    this.loadAirports();
  }
}
