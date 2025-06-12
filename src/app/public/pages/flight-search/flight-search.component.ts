import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FlightService, Airport } from '../../services/flight.service';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="relative">
      <!-- Hero Section with Search -->
      <section class="bg-gradient-to-r from-blue-600 to-indigo-800 text-white py-20">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto text-center mb-10">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">
              ¿A dónde quieres volar hoy?
            </h1>
            <p class="text-xl text-blue-100">
              Encuentra los mejores vuelos al mejor precio con {{ airlineName }}
            </p>
          </div>

          <!-- Search Form -->
          <div class="max-w-6xl mx-auto">
            <div class="bg-white rounded-lg shadow-lg p-6">
              <form [formGroup]="searchForm" (ngSubmit)="searchFlights()" class="space-y-6">
                
                <!-- Trip Type -->
                <div class="flex space-x-4">
                  <label class="flex items-center">
                    <input type="radio" value="oneWay" formControlName="tripType" class="mr-2">
                    <span class="text-gray-700">Solo ida</span>
                  </label>
                  <label class="flex items-center">
                    <input type="radio" value="roundTrip" formControlName="tripType" class="mr-2">
                    <span class="text-gray-700">Ida y vuelta</span>
                  </label>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">                  <!-- Origin -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Origen</label>
                    <select formControlName="origin" class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white cursor-pointer">
                      <option value="" disabled class="text-gray-500">
                        @if (airportsLoading) {
                          Cargando aeropuertos...
                        } @else if (airports.length === 0) {
                          No hay aeropuertos disponibles
                        } @else {
                          Seleccionar ciudad de origen
                        }
                      </option>
                      @for (airport of airports; track airport.code) {
                        <option [value]="airport.code" class="text-gray-900 py-2">
                          {{ airport.city }} - {{ airport.name }} ({{ airport.code }})
                        </option>
                      }
                    </select>
                    @if (airports.length === 0 && !airportsLoading) {
                      <p class="text-xs text-red-500 mt-1">⚠️ No se pudieron cargar los aeropuertos</p>
                    }
                  </div>

                  <!-- Destination -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Destino</label>
                    <select formControlName="destination" class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white cursor-pointer">
                      <option value="" disabled class="text-gray-500">
                        @if (airportsLoading) {
                          Cargando aeropuertos...
                        } @else if (airports.length === 0) {
                          No hay aeropuertos disponibles
                        } @else {
                          Seleccionar ciudad de destino
                        }
                      </option>
                      @for (airport of airports; track airport.code) {
                        <option [value]="airport.code" class="text-gray-900 py-2">
                          {{ airport.city }} - {{ airport.name }} ({{ airport.code }})
                        </option>
                      }
                    </select>
                    @if (airports.length === 0 && !airportsLoading) {
                      <p class="text-xs text-red-500 mt-1">⚠️ No se pudieron cargar los aeropuertos</p>
                    }
                  </div>

                  <!-- Departure Date -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de ida</label>
                    <input type="date" formControlName="departureDate" 
                           class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                  </div>

                  <!-- Return Date -->
                  @if (searchForm.get('tripType')?.value === 'roundTrip') {
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de vuelta</label>
                      <input type="date" formControlName="returnDate" 
                             class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                    </div>
                  }
                </div>                <!-- Passengers -->
                <div class="flex items-center space-x-4">
                  <label class="block text-sm font-medium text-gray-700">Pasajeros:</label>
                  <div class="flex items-center space-x-2">
                    <button type="button" (click)="decreasePassengers()" 
                            class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 text-gray-700 font-medium">
                      -
                    </button>
                    <span class="px-4 py-2 bg-gray-100 rounded-lg min-w-[50px] text-center text-gray-900">{{ passengers }}</span>
                    <button type="button" (click)="increasePassengers()" 
                            class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 text-gray-700 font-medium">
                      +
                    </button>
                  </div>
                  <span class="text-sm text-gray-500">{{ passengers === 1 ? 'pasajero' : 'pasajeros' }}</span>
                </div>

                <!-- Search Button -->
                <div class="flex justify-center">
                  <button type="submit" [disabled]="searchForm.invalid" 
                          [class]="'px-8 py-4 rounded-lg font-semibold text-lg transition duration-300 ' + 
                                   (searchForm.valid ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed')">
                    <div class="flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Buscar Vuelos</span>
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-16 bg-white">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl font-bold text-center mb-12">¿Por qué elegir {{ airlineName }}?</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-2">Mejores Precios</h3>
              <p class="text-gray-600">Tarifas competitivas sin costos ocultos</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-2">Puntualidad</h3>
              <p class="text-gray-600">96% de nuestros vuelos salen a tiempo</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-2">Servicio de Calidad</h3>
              <p class="text-gray-600">Atención personalizada en cada vuelo</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `
})
export class FlightSearchComponent implements OnInit {
  searchForm: FormGroup;
  airports: Airport[] = [];
  airportsLoading: boolean = true;
  passengers: number = 1;
  airlineAlias: string = '';
  airlineName: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private flightService: FlightService
  ) {
    this.searchForm = this.fb.group({
      tripType: ['oneWay', Validators.required],
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      departureDate: ['', Validators.required],
      returnDate: ['']
    });
  }  ngOnInit() {
    console.log('🚀 FlightSearchComponent iniciando...');
    
    // Cargar aeropuertos desde GraphQL
    this.airportsLoading = true;
    console.log('🔄 Cargando aeropuertos...');
    this.flightService.getAirports().subscribe({
      next: (airports) => {
        console.log('✅ Aeropuertos recibidos:', airports);
        this.airports = airports;
        this.airportsLoading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando aeropuertos:', error);
        // Fallback a lista vacía o mostrar mensaje de error
        this.airports = [];
        this.airportsLoading = false;
      }
    });
    
    // Get airline alias from route
    this.route.parent?.params.subscribe(params => {
      console.log('📍 Parámetros de ruta recibidos:', params);
      this.airlineAlias = params['airlineAlias'];
      this.airlineName = this.formatAirlineName(this.airlineAlias);
      console.log(`🏢 Aerolínea: ${this.airlineName} (${this.airlineAlias})`);
    });

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    this.searchForm.patchValue({
      departureDate: today
    });

    // Validate return date when trip type changes
    this.searchForm.get('tripType')?.valueChanges.subscribe(value => {
      const returnDateControl = this.searchForm.get('returnDate');
      if (value === 'roundTrip') {
        returnDateControl?.setValidators([Validators.required]);
      } else {
        returnDateControl?.clearValidators();
      }
      returnDateControl?.updateValueAndValidity();
    });
  }

  increasePassengers() {
    if (this.passengers < 9) {
      this.passengers++;
    }
  }

  decreasePassengers() {
    if (this.passengers > 1) {
      this.passengers--;
    }
  }
  searchFlights() {
    console.log('🔍 Iniciando búsqueda de vuelos...');
    console.log('📝 Formulario válido:', this.searchForm.valid);
    console.log('📝 Valores del formulario:', this.searchForm.value);
    
    if (this.searchForm.valid) {
      const formValue = this.searchForm.value;
      
      console.log('✅ Navegando a resultados con parámetros:', {
        origin: formValue.origin,
        destination: formValue.destination,
        departureDate: formValue.departureDate,
        returnDate: formValue.returnDate,
        passengers: this.passengers,
        tripType: formValue.tripType
      });
      
      // Navigate to results page with search parameters
      this.router.navigate(['/', this.airlineAlias, 'flights'], {
        queryParams: {
          origin: formValue.origin,
          destination: formValue.destination,
          departureDate: formValue.departureDate,
          returnDate: formValue.returnDate,
          passengers: this.passengers,
          tripType: formValue.tripType
        }
      });
    } else {
      console.log('❌ Formulario inválido, errores:', Object.keys(this.searchForm.controls).reduce((acc, key) => {
        const control = this.searchForm.get(key);
        if (control && control.errors) {
          acc[key] = control.errors;
        }
        return acc;
      }, {} as any));
    }
  }

  private formatAirlineName(alias: string): string {
    return alias.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') + ' Airlines';
  }
}
