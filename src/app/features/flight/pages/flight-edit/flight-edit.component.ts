import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FlightAdminService, UpdateFlightRequest, FlightAdmin } from '../../../../admin/services/flight-admin.service';
import { Apollo, gql } from 'apollo-angular';

interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
}

interface Aircraft {
  id: string;
  model: string;
  registration: string;
  seatsTotal: number;
}

const GET_AIRPORTS = gql`
  query GetAirports {
    allAirports {
      id
      code
      name
      city
      country
    }
  }
`;

const GET_AIRCRAFT = gql`
  query GetAircraft {
    allAircraft {
      id
      model
      registration
      seatsTotal
    }
  }
`;

@Component({
  selector: 'app-flight-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Editar Vuelo</h1>
          <p class="text-gray-600 mt-1">Modifica la información del vuelo {{ flightCode }}</p>
        </div>
        <button type="button" (click)="goBack()" 
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
      </div>

      @if (loading) {
        <div class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Cargando datos del vuelo...</p>
        </div>
      } @else if (flightForm) {
        <!-- Form -->
        <div class="bg-white rounded-lg shadow p-6">
          <form [formGroup]="flightForm" (ngSubmit)="onSubmit()" class="space-y-6">
            
            <!-- Información Básica -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <!-- Código de Vuelo -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Código de Vuelo *
                  </label>
                  <input type="text" 
                         formControlName="code"
                         placeholder="Ej: BOA-101"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                         [class.border-red-500]="flightForm.get('code')?.invalid && flightForm.get('code')?.touched">
                  @if (flightForm.get('code')?.invalid && flightForm.get('code')?.touched) {
                    <p class="mt-1 text-sm text-red-600">El código de vuelo es obligatorio</p>
                  }
                </div>

                <!-- Estado -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <select formControlName="status"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="PROGRAMADO">Programado</option>
                    <option value="EN_VUELO">En Vuelo</option>
                    <option value="ATERRIZADO">Aterrizado</option>
                    <option value="RETRASADO">Retrasado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Ruta -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Ruta</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <!-- Origen -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Aeropuerto de Origen *
                  </label>
                  <select formControlName="originId"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          [class.border-red-500]="flightForm.get('originId')?.invalid && flightForm.get('originId')?.touched">
                    <option value="">Seleccionar aeropuerto</option>
                    @for (airport of airports; track airport.id) {
                      <option [value]="airport.id">{{ airport.city }} ({{ airport.code }}) - {{ airport.name }}</option>
                    }
                  </select>
                  @if (flightForm.get('originId')?.invalid && flightForm.get('originId')?.touched) {
                    <p class="mt-1 text-sm text-red-600">Selecciona un aeropuerto de origen</p>
                  }
                </div>

                <!-- Destino -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Aeropuerto de Destino *
                  </label>
                  <select formControlName="destinationId"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          [class.border-red-500]="flightForm.get('destinationId')?.invalid && flightForm.get('destinationId')?.touched">
                    <option value="">Seleccionar aeropuerto</option>
                    @for (airport of airports; track airport.id) {
                      <option [value]="airport.id">{{ airport.city }} ({{ airport.code }}) - {{ airport.name }}</option>
                    }
                  </select>
                  @if (flightForm.get('destinationId')?.invalid && flightForm.get('destinationId')?.touched) {
                    <p class="mt-1 text-sm text-red-600">Selecciona un aeropuerto de destino</p>
                  }
                </div>
              </div>
            </div>

            <!-- Aeronave -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Aeronave</h3>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Aeronave Asignada *
                </label>
                <select formControlName="aircraftId"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        [class.border-red-500]="flightForm.get('aircraftId')?.invalid && flightForm.get('aircraftId')?.touched">
                  <option value="">Seleccionar aeronave</option>
                  @for (aircraft of aircrafts; track aircraft.id) {
                    <option [value]="aircraft.id">{{ aircraft.model }} - {{ aircraft.registration }} ({{ aircraft.seatsTotal }} asientos)</option>
                  }
                </select>
                @if (flightForm.get('aircraftId')?.invalid && flightForm.get('aircraftId')?.touched) {
                  <p class="mt-1 text-sm text-red-600">Selecciona una aeronave</p>
                }
              </div>
            </div>

            <!-- Horarios -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Horarios</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <!-- Salida -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y Hora de Salida *
                  </label>
                  <input type="datetime-local" 
                         formControlName="departureTime"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                         [class.border-red-500]="flightForm.get('departureTime')?.invalid && flightForm.get('departureTime')?.touched">
                  @if (flightForm.get('departureTime')?.invalid && flightForm.get('departureTime')?.touched) {
                    <p class="mt-1 text-sm text-red-600">La fecha y hora de salida es obligatoria</p>
                  }
                </div>

                <!-- Llegada -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y Hora de Llegada *
                  </label>
                  <input type="datetime-local" 
                         formControlName="arrivalTime"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                         [class.border-red-500]="flightForm.get('arrivalTime')?.invalid && flightForm.get('arrivalTime')?.touched">
                  @if (flightForm.get('arrivalTime')?.invalid && flightForm.get('arrivalTime')?.touched) {
                    <p class="mt-1 text-sm text-red-600">La fecha y hora de llegada es obligatoria</p>
                  }
                </div>
              </div>
            </div>

            <!-- Precio -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Precio</h3>
              <div class="max-w-md">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Precio por Pasajero (BOB) *
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-2 text-gray-500">Bs.</span>
                  <input type="number" 
                         formControlName="price"
                         placeholder="450"
                         min="0"
                         step="0.01"
                         class="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                         [class.border-red-500]="flightForm.get('price')?.invalid && flightForm.get('price')?.touched">
                </div>
                @if (flightForm.get('price')?.invalid && flightForm.get('price')?.touched) {
                  <p class="mt-1 text-sm text-red-600">El precio es obligatorio y debe ser mayor a 0</p>
                }
              </div>
            </div>

            <!-- Botones -->
            <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button type="button" 
                      (click)="goBack()"
                      class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" 
                      [disabled]="!flightForm.valid || saving"
                      class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                @if (saving) {
                  <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                } @else {
                  Guardar Cambios
                }
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `
})
export class FlightEditComponent implements OnInit {
  flightForm!: FormGroup;
  airports: Airport[] = [];
  aircrafts: Aircraft[] = [];
  loading = true;
  saving = false;
  flightId!: string;
  flightCode = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private flightAdminService: FlightAdminService,
    private apollo: Apollo
  ) {}

  ngOnInit() {
    this.flightId = this.route.snapshot.params['id'];
    this.loadAirports();
    this.loadAircrafts();
    this.loadFlight();
  }

  loadFlight() {
    this.flightAdminService.getFlightById(this.flightId).subscribe({
      next: (flight) => {
        if (flight) {
          this.flightCode = flight.code;
          this.initForm(flight);
        } else {
          console.error('Flight not found');
          this.router.navigate(['/admin/flights']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading flight:', error);
        this.loading = false;
      }
    });
  }
  initForm(flight?: FlightAdmin) {
    this.flightForm = this.fb.group({
      code: [flight?.code || '', [Validators.required, Validators.minLength(3)]],
      airlineId: ['550e8400-e29b-41d4-a716-446655440001'], // BOA por defecto
      aircraftId: [flight?.aircraft.id || '', Validators.required],
      originId: [flight?.origin.id || '', Validators.required],
      destinationId: [flight?.destination.id || '', Validators.required],
      departureTime: [this.formatDateTimeLocal(flight?.departureTime) || '', Validators.required],
      arrivalTime: [this.formatDateTimeLocal(flight?.arrivalTime) || '', Validators.required],
      price: [flight?.price || '', [Validators.required, Validators.min(0.01)]],
      status: [flight?.status || 'PROGRAMADO', Validators.required]
    });
  }

  loadAirports() {
    this.apollo.watchQuery<{ allAirports: Airport[] }>({
      query: GET_AIRPORTS
    }).valueChanges.subscribe({
      next: (result) => {
        this.airports = result.data?.allAirports || [];
      },
      error: (error) => {
        console.error('Error loading airports:', error);
        // Datos mock para desarrollo
        this.airports = [
          { id: '1', code: 'LPB', name: 'Aeropuerto Internacional El Alto', city: 'La Paz', country: 'Bolivia' },
          { id: '2', code: 'VVI', name: 'Aeropuerto Internacional Viru Viru', city: 'Santa Cruz', country: 'Bolivia' },
          { id: '3', code: 'CBB', name: 'Aeropuerto Internacional Jorge Wilstermann', city: 'Cochabamba', country: 'Bolivia' },
          { id: '4', code: 'SRE', name: 'Aeropuerto Capitán Av. Salvador Ogaya G.', city: 'Sucre', country: 'Bolivia' }
        ];
      }
    });
  }

  loadAircrafts() {
    this.apollo.watchQuery<{ allAircraft: Aircraft[] }>({
      query: GET_AIRCRAFT
    }).valueChanges.subscribe({
      next: (result) => {
        this.aircrafts = result.data?.allAircraft || [];
      },
      error: (error) => {
        console.error('Error loading aircrafts:', error);
        // Datos mock para desarrollo
        this.aircrafts = [
          { id: '1', model: 'Boeing 737-800', registration: 'CP-3000', seatsTotal: 160 },
          { id: '2', model: 'Boeing 737-800', registration: 'CP-3001', seatsTotal: 160 },
          { id: '3', model: 'Airbus A320', registration: 'CP-3002', seatsTotal: 180 }
        ];
      }
    });
  }

  onSubmit() {
    if (this.flightForm.valid) {
      this.saving = true;
        const flightData: UpdateFlightRequest = {
        id: this.flightId,
        code: this.flightForm.value.code,
        airlineId: this.flightForm.value.airlineId,
        aircraftId: this.flightForm.value.aircraftId,
        originId: this.flightForm.value.originId,
        destinationId: this.flightForm.value.destinationId,
        departureTime: this.flightForm.value.departureTime,
        arrivalTime: this.flightForm.value.arrivalTime,
        price: parseFloat(this.flightForm.value.price),
        status: this.flightForm.value.status
      };

      this.flightAdminService.updateFlight(flightData).subscribe({
        next: (flight) => {
          console.log('Vuelo actualizado exitosamente:', flight);
          this.router.navigate(['/admin/flights']);
        },
        error: (error) => {
          console.error('Error updating flight:', error);
          this.saving = false;
          // TODO: Mostrar mensaje de error al usuario
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/flights']);
  }

  private formatDateTimeLocal(dateTimeString?: string): string {
    if (!dateTimeString) return '';
    
    const date = new Date(dateTimeString);
    return date.toISOString().slice(0, 16); // formato YYYY-MM-DDTHH:MM
  }
}
