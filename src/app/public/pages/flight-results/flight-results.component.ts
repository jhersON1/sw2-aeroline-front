import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FlightService, Flight, Airport } from '../../services/flight.service';

@Component({
  selector: 'app-flight-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header with search summary -->
      <div class="bg-white shadow-sm py-6">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Vuelos Disponibles</h1>
              <p class="text-gray-600 mt-1">
                {{ originCity }} → {{ destinationCity }} • {{ departureDate | date:'shortDate' }} • {{ passengers }} {{ passengers === 1 ? 'pasajero' : 'pasajeros' }}
              </p>
            </div>
            <button (click)="goBack()" class="mt-4 md:mt-0 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
              Modificar búsqueda
            </button>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-8">
        @if (loading) {
          <!-- Loading State -->
          <div class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-4 text-gray-600">Buscando los mejores vuelos...</p>
          </div>
        } @else if (flights.length === 0) {
          <!-- No Results -->
          <div class="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">No hay vuelos disponibles</h2>
            <p class="text-gray-600 mb-4">No encontramos vuelos para la ruta y fecha seleccionadas.</p>
            <button (click)="goBack()" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Buscar en otras fechas
            </button>
          </div>
        } @else {
          <!-- Flight Results -->
          <div class="space-y-4">
            @for (flight of flights; track flight.id) {
              <div class="bg-white rounded-lg shadow-sm border hover:shadow-md transition duration-300">
                <div class="p-6">
                  <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                    
                    <!-- Flight Info -->
                    <div class="lg:col-span-2">
                      <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </div>
                        <div>
                          <p class="font-bold text-lg">{{ flight.flightNumber }}</p>
                          <p class="text-sm text-gray-600">{{ flight.aircraft }}</p>
                        </div>
                      </div>
                      
                      <div class="mt-4 flex items-center space-x-6">
                        <div class="text-center">
                          <p class="text-2xl font-bold">{{ flight.departureTime }}</p>
                          <p class="text-sm text-gray-600">{{ flight.origin.city }}</p>
                          <p class="text-xs text-gray-500">{{ flight.origin.code }}</p>
                        </div>
                        
                        <div class="flex-1 text-center">
                          <div class="relative">
                            <div class="border-t-2 border-dashed border-gray-300"></div>
                            <div class="absolute inset-0 flex items-center justify-center">
                              <div class="bg-white px-3">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <p class="text-sm text-gray-600 mt-2">{{ flight.duration }}</p>
                        </div>
                        
                        <div class="text-center">
                          <p class="text-2xl font-bold">{{ flight.arrivalTime }}</p>
                          <p class="text-sm text-gray-600">{{ flight.destination.city }}</p>
                          <p class="text-xs text-gray-500">{{ flight.destination.code }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- Price and Availability -->
                    <div class="text-center lg:text-right">
                      <p class="text-3xl font-bold text-green-600">{{ flight.price | currency:'BOB':'symbol':'1.0-0' }}</p>
                      <p class="text-sm text-gray-600">por persona</p>
                      <p class="text-xs text-gray-500 mt-1">{{ flight.availableSeats }} asientos disponibles</p>
                    </div>

                    <!-- Select Button -->
                    <div class="text-center">
                      <button (click)="selectFlight(flight)" 
                              class="w-full px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition duration-300">
                        Seleccionar
                      </button>
                    </div>
                  </div>

                  <!-- Flight Details (expandable) -->
                  <div class="mt-4 pt-4 border-t border-gray-100">
                    <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Equipaje de mano incluido</span>
                      </div>
                      <div class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Snack y bebida incluidos</span>
                      </div>
                      <div class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Cambios permitidos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Summary -->
          <div class="mt-8 text-center text-gray-600">
            <p>Mostrando {{ flights.length }} {{ flights.length === 1 ? 'vuelo' : 'vuelos' }} disponibles</p>
          </div>
        }
      </div>
    </div>
  `
})
export class FlightResultsComponent implements OnInit {
  flights: Flight[] = [];
  loading: boolean = true;
  
  // Search parameters
  origin: string = '';
  destination: string = '';
  departureDate: string = '';
  passengers: number = 1;
  tripType: string = '';
  
  // Display data
  originCity: string = '';
  destinationCity: string = '';
  airlineAlias: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flightService: FlightService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.origin = params['origin'];
      this.destination = params['destination'];
      this.departureDate = params['departureDate'];
      this.passengers = parseInt(params['passengers']) || 1;
      this.tripType = params['tripType'];
      
      this.loadFlights();
    });

    this.route.parent?.params.subscribe(params => {
      this.airlineAlias = params['airlineAlias'];
    });

    this.setCityNames();
  }

  private setCityNames() {
    const airports = this.flightService.getAirports();
    this.originCity = airports.find(a => a.code === this.origin)?.city || this.origin;
    this.destinationCity = airports.find(a => a.code === this.destination)?.city || this.destination;
  }

  private loadFlights() {
    this.loading = true;
    
    // Simulate API delay
    setTimeout(() => {
      this.flights = this.flightService.searchFlights(
        this.origin,
        this.destination,
        this.departureDate,
        this.passengers
      );
      this.loading = false;
    }, 1500);
  }

  selectFlight(flight: Flight) {
    // Create booking data
    const bookingData = {
      flight: flight,
      passengers: [],
      totalPrice: flight.price * this.passengers,
      bookingReference: this.flightService.generateBookingReference()
    };

    this.flightService.setCurrentBooking(bookingData);

    // Navigate to booking page
    this.router.navigate(['/', this.airlineAlias, 'booking']);
  }

  goBack() {
    this.router.navigate(['/', this.airlineAlias]);
  }
}
