import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FlightService, BookingData, Passenger } from '../../services/flight.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      @if (bookingData) {
        <!-- Header -->
        <div class="bg-white shadow-sm py-6">
          <div class="container mx-auto px-4">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Información de Pasajeros</h1>
                <p class="text-gray-600">Vuelo {{ bookingData.flight.code }}</p>
              </div>
              <button (click)="goBack()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                Volver a vuelos
              </button>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 py-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Main Form -->
            <div class="lg:col-span-2">
              <form [formGroup]="bookingForm" (ngSubmit)="proceedToPayment()">
                
                <!-- Contact Information -->
                <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 class="text-xl font-semibold mb-4">Información de Contacto</h2>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Email de contacto</label>
                      <input type="email" formControlName="contactEmail" 
                             class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                             placeholder="tu@email.com">
                      @if (bookingForm.get('contactEmail')?.invalid && bookingForm.get('contactEmail')?.touched) {
                        <p class="mt-1 text-sm text-red-600">Email válido requerido</p>
                      }
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono de contacto</label>
                      <input type="tel" formControlName="contactPhone" 
                             class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                             placeholder="+591 12345678">
                      @if (bookingForm.get('contactPhone')?.invalid && bookingForm.get('contactPhone')?.touched) {
                        <p class="mt-1 text-sm text-red-600">Teléfono requerido</p>
                      }
                    </div>
                  </div>
                </div>

                <!-- Passengers Information -->
                <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 class="text-xl font-semibold mb-4">Datos de Pasajeros</h2>
                  
                  <div formArrayName="passengers" class="space-y-6">
                    @for (passenger of passengersArray.controls; track $index; let i = $index) {
                      <div [formGroupName]="i" class="border border-gray-200 rounded-lg p-4">
                        <h3 class="font-medium text-gray-900 mb-4">Pasajero {{ i + 1 }}</h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nombres</label>
                            <input type="text" formControlName="firstName" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            @if (passenger.get('firstName')?.invalid && passenger.get('firstName')?.touched) {
                              <p class="mt-1 text-sm text-red-600">Nombres requeridos</p>
                            }
                          </div>
                          
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                            <input type="text" formControlName="lastName" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            @if (passenger.get('lastName')?.invalid && passenger.get('lastName')?.touched) {
                              <p class="mt-1 text-sm text-red-600">Apellidos requeridos</p>
                            }
                          </div>
                          
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de documento</label>
                            <select formControlName="documentType" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                              <option value="">Seleccionar</option>
                              <option value="CI">Cédula de Identidad</option>
                              <option value="PASSPORT">Pasaporte</option>
                              <option value="EXTRANJERIA">Carnet de Extranjería</option>
                            </select>
                            @if (passenger.get('documentType')?.invalid && passenger.get('documentType')?.touched) {
                              <p class="mt-1 text-sm text-red-600">Tipo de documento requerido</p>
                            }
                          </div>
                          
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Número de documento</label>
                            <input type="text" formControlName="documentNumber" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            @if (passenger.get('documentNumber')?.invalid && passenger.get('documentNumber')?.touched) {
                              <p class="mt-1 text-sm text-red-600">Número de documento requerido</p>
                            }
                          </div>
                          
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de nacimiento</label>
                            <input type="date" formControlName="birthDate" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            @if (passenger.get('birthDate')?.invalid && passenger.get('birthDate')?.touched) {
                              <p class="mt-1 text-sm text-red-600">Fecha de nacimiento requerida</p>
                            }
                          </div>
                          
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email personal</label>
                            <input type="email" formControlName="email" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            @if (passenger.get('email')?.invalid && passenger.get('email')?.touched) {
                              <p class="mt-1 text-sm text-red-600">Email válido requerido</p>
                            }
                          </div>
                          
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                            <input type="tel" formControlName="phone" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            @if (passenger.get('phone')?.invalid && passenger.get('phone')?.touched) {
                              <p class="mt-1 text-sm text-red-600">Teléfono requerido</p>
                            }
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Terms and Conditions -->
                <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <div class="flex items-start space-x-3">
                    <input type="checkbox" formControlName="acceptTerms" class="mt-1">
                    <div class="text-sm">
                      <label class="text-gray-700">
                        Acepto los <a href="#" class="text-blue-600 hover:underline">términos y condiciones</a> 
                        y las <a href="#" class="text-blue-600 hover:underline">políticas de equipaje</a>
                      </label>
                      @if (bookingForm.get('acceptTerms')?.invalid && bookingForm.get('acceptTerms')?.touched) {
                        <p class="mt-1 text-red-600">Debe aceptar los términos y condiciones</p>
                      }
                    </div>
                  </div>
                </div>

                <!-- Submit Button -->
                <button type="submit" [disabled]="bookingForm.invalid" 
                        [class]="'w-full py-4 rounded-lg font-semibold text-lg transition duration-300 ' + 
                                 (bookingForm.valid ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed')">
                  Continuar al Pago
                </button>
              </form>
            </div>

            <!-- Booking Summary -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 class="text-xl font-semibold mb-4">Resumen de Reserva</h2>
                
                <!-- Flight Details -->
                <div class="space-y-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium">{{ bookingData.flight.code }}</p>
                      <p class="text-sm text-gray-600">{{ bookingData.flight.aircraft }}</p>
                    </div>
                  </div>
                  
                  <div class="border-l-2 border-gray-200 pl-4 ml-5">
                    <div class="space-y-3">
                      <div>
                        <p class="font-medium">{{ bookingData.flight.departureTime }}</p>
                        <p class="text-sm text-gray-600">{{ bookingData.flight.origin.city }} ({{ bookingData.flight.origin.code }})</p>
                      </div>
                      <div class="text-xs text-gray-500">{{ bookingData.flight.duration }}</div>
                      <div>
                        <p class="font-medium">{{ bookingData.flight.arrivalTime }}</p>
                        <p class="text-sm text-gray-600">{{ bookingData.flight.destination.city }} ({{ bookingData.flight.destination.code }})</p>
                      </div>
                    </div>
                  </div>
                </div>

                <hr class="my-6">

                <!-- Pricing -->
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>{{ getTotalPassengers() }} {{ getTotalPassengers() === 1 ? 'pasajero' : 'pasajeros' }}</span>
                    <span>{{ bookingData.flight.price | currency:'BOB':'symbol':'1.0-0' }} c/u</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Subtotal</span>
                    <span>{{ bookingData.totalPrice | currency:'BOB':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Tasas e impuestos</span>
                    <span>{{ getTaxes() | currency:'BOB':'symbol':'1.0-0' }}</span>
                  </div>
                  <hr class="my-2">
                  <div class="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{{ getFinalTotal() | currency:'BOB':'symbol':'1.0-0' }}</span>
                  </div>
                </div>

                <!-- Reference -->
                <div class="mt-6 p-3 bg-gray-50 rounded-lg">
                  <p class="text-xs text-gray-600">Código de reserva</p>
                  <p class="font-mono font-bold">{{ bookingData.bookingReference }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <!-- No booking data -->
        <div class="min-h-screen flex items-center justify-center">
          <div class="text-center">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">No se encontró información de reserva</h2>
            <p class="text-gray-600 mb-4">Por favor, regresa a la búsqueda de vuelos</p>
            <button (click)="goHome()" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Buscar Vuelos
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class BookingComponent implements OnInit {
  bookingForm: FormGroup;
  bookingData: BookingData | null = null;
  airlineAlias: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private flightService: FlightService
  ) {
    this.bookingForm = this.fb.group({
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', Validators.required],
      passengers: this.fb.array([]),
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    this.bookingData = this.flightService.getCurrentBooking();
    
    this.route.parent?.params.subscribe(params => {
      this.airlineAlias = params['airlineAlias'];
    });

    if (this.bookingData) {
      this.initializePassengerForms();
    }
  }

  get passengersArray(): FormArray {
    return this.bookingForm.get('passengers') as FormArray;
  }

  private initializePassengerForms() {
    if (!this.bookingData) return;

    const passengersCount = this.getTotalPassengers();
    
    for (let i = 0; i < passengersCount; i++) {
      const passengerForm = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        documentType: ['', Validators.required],
        documentNumber: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        birthDate: ['', Validators.required]
      });
      
      this.passengersArray.push(passengerForm);
    }
  }

  getTotalPassengers(): number {
    // This should come from the search parameters, for now we calculate from totalPrice
    return this.bookingData ? Math.round(this.bookingData.totalPrice / this.bookingData.flight.price) : 1;
  }

  getTaxes(): number {
    return this.bookingData ? Math.round(this.bookingData.totalPrice * 0.1) : 0;
  }

  getFinalTotal(): number {
    return this.bookingData ? this.bookingData.totalPrice + this.getTaxes() : 0;
  }

  proceedToPayment() {
    if (this.bookingForm.valid && this.bookingData) {
      // Update booking data with passenger information
      const passengers: Passenger[] = this.passengersArray.value;
      
      this.bookingData.passengers = passengers;
      this.bookingData.totalPrice = this.getFinalTotal();
      
      this.flightService.setCurrentBooking(this.bookingData);

      // Navigate to payment
      this.router.navigate(['/', this.airlineAlias, 'payment']);
    }
  }

  goBack() {
    this.router.navigate(['/', this.airlineAlias, 'flights'], {
      queryParams: this.route.snapshot.queryParams
    });
  }

  goHome() {
    this.router.navigate(['/', this.airlineAlias]);
  }
}
