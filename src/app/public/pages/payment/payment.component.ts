import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FlightService, BookingData, PaymentInfo } from '../../services/flight.service';

@Component({
  selector: 'app-payment',
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
                <h1 class="text-2xl font-bold text-gray-900">Pago y Confirmación</h1>
                <p class="text-gray-600">Último paso para confirmar tu reserva</p>
              </div>
              <button (click)="goBack()" class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                Volver
              </button>
            </div>
          </div>
        </div>

        <div class="container mx-auto px-4 py-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Payment Form -->
            <div class="lg:col-span-2">
              @if (isProcessing) {
                <!-- Processing Payment -->
                <div class="bg-white rounded-lg shadow-sm p-8 text-center">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h2 class="text-xl font-semibold mb-2">Procesando pago...</h2>
                  <p class="text-gray-600">Por favor espera mientras confirmamos tu transacción</p>
                </div>
              } @else {
                <form [formGroup]="paymentForm" (ngSubmit)="processPayment()">
                  
                  <!-- Payment Method -->
                  <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 class="text-xl font-semibold mb-4">Método de Pago</h2>
                    
                    <div class="space-y-4">
                      <label class="flex items-center p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
                        <input type="radio" value="card" formControlName="paymentMethod" class="mr-3" checked>
                        <div class="flex items-center space-x-3">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <span class="font-medium">Tarjeta de Crédito/Débito</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <!-- Card Information -->
                  <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h3 class="text-lg font-medium mb-4">Información de la Tarjeta</h3>
                    
                    <!-- Demo Notice -->
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="text-sm text-yellow-800">Esta es una simulación. No se realizará ningún cargo real a tu tarjeta.</span>
                      </div>
                    </div>
                    
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Número de tarjeta</label>
                        <input type="text" formControlName="cardNumber" placeholder="1234 5678 9012 3456"
                               class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        @if (paymentForm.get('cardNumber')?.invalid && paymentForm.get('cardNumber')?.touched) {
                          <p class="mt-1 text-sm text-red-600">Número de tarjeta válido requerido</p>
                        }
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del titular</label>
                        <input type="text" formControlName="cardHolder" placeholder="JUAN PEREZ"
                               class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        @if (paymentForm.get('cardHolder')?.invalid && paymentForm.get('cardHolder')?.touched) {
                          <p class="mt-1 text-sm text-red-600">Nombre del titular requerido</p>
                        }
                      </div>
                      
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de expiración</label>
                          <input type="text" formControlName="expiryDate" placeholder="MM/YY"
                                 class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          @if (paymentForm.get('expiryDate')?.invalid && paymentForm.get('expiryDate')?.touched) {
                            <p class="mt-1 text-sm text-red-600">Fecha válida requerida</p>
                          }
                        </div>
                        
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                          <input type="text" formControlName="cvv" placeholder="123"
                                 class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          @if (paymentForm.get('cvv')?.invalid && paymentForm.get('cvv')?.touched) {
                            <p class="mt-1 text-sm text-red-600">CVV requerido</p>
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Billing Address -->
                  <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h3 class="text-lg font-medium mb-4">Dirección de Facturación</h3>
                    
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">País</label>
                        <select formControlName="country" class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="BO">Bolivia</option>
                        </select>
                      </div>
                      
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                          <input type="text" formControlName="city" 
                                 class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">Código postal</label>
                          <input type="text" formControlName="postalCode" 
                                 class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Submit Button -->
                  <button type="submit" [disabled]="paymentForm.invalid" 
                          [class]="'w-full py-4 rounded-lg font-semibold text-lg transition duration-300 ' + 
                                   (paymentForm.valid ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed')">
                    <div class="flex items-center justify-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Confirmar Pago de {{ bookingData.totalPrice | currency:'BOB':'symbol':'1.0-0' }}</span>
                    </div>
                  </button>
                </form>
              }
            </div>

            <!-- Booking Summary -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 class="text-xl font-semibold mb-4">Resumen Final</h2>
                
                <!-- Flight Info -->
                <div class="space-y-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium">{{ bookingData.flight.flightNumber }}</p>
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

                <!-- Passengers -->
                <div class="mt-6">
                  <h3 class="font-medium mb-2">Pasajeros ({{ bookingData.passengers.length }})</h3>
                  <div class="space-y-2">
                    @for (passenger of bookingData.passengers; track $index) {
                      <div class="text-sm">
                        <p class="font-medium">{{ passenger.firstName }} {{ passenger.lastName }}</p>
                        <p class="text-gray-600">{{ passenger.documentType }}: {{ passenger.documentNumber }}</p>
                      </div>
                    }
                  </div>
                </div>

                <hr class="my-6">

                <!-- Final Total -->
                <div class="space-y-2">
                  <div class="flex justify-between text-lg font-bold">
                    <span>Total a Pagar</span>
                    <span class="text-green-600">{{ bookingData.totalPrice | currency:'BOB':'symbol':'1.0-0' }}</span>
                  </div>
                </div>

                <!-- Reference -->
                <div class="mt-6 p-3 bg-gray-50 rounded-lg">
                  <p class="text-xs text-gray-600">Código de reserva</p>
                  <p class="font-mono font-bold">{{ bookingData.bookingReference }}</p>
                </div>

                <!-- Security Info -->
                <div class="mt-6 text-xs text-gray-500">
                  <div class="flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Pago seguro con encriptación SSL</span>
                  </div>
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
export class PaymentComponent implements OnInit {
  paymentForm: FormGroup;
  bookingData: BookingData | null = null;
  airlineAlias: string = '';
  isProcessing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private flightService: FlightService
  ) {
    this.paymentForm = this.fb.group({
      paymentMethod: ['card', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardHolder: ['', Validators.required],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      country: ['BO', Validators.required],
      city: ['', Validators.required],
      postalCode: ['']
    });
  }

  ngOnInit() {
    this.bookingData = this.flightService.getCurrentBooking();
    
    this.route.parent?.params.subscribe(params => {
      this.airlineAlias = params['airlineAlias'];
    });
    
    if (!this.bookingData || this.bookingData.passengers.length === 0) {
      this.goHome();
    }
  }

  async processPayment() {
    if (this.paymentForm.valid && this.bookingData) {
      this.isProcessing = true;

      try {
        const paymentInfo: PaymentInfo = {
          cardNumber: this.paymentForm.value.cardNumber,
          cardHolder: this.paymentForm.value.cardHolder,
          expiryDate: this.paymentForm.value.expiryDate,
          cvv: this.paymentForm.value.cvv
        };

        // Process payment (simulated)
        const paymentSuccess = await this.flightService.processPayment(paymentInfo);

        if (paymentSuccess) {
          // Update booking with payment info
          this.bookingData.paymentInfo = paymentInfo;
          
          // Confirm booking
          await this.flightService.confirmBooking(this.bookingData);
          
          // Navigate to confirmation
          this.router.navigate(['/', this.airlineAlias, 'confirmation']);
        } else {
          alert('Error en el procesamiento del pago. Por favor intenta nuevamente.');
          this.isProcessing = false;
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        alert('Error en el procesamiento del pago. Por favor intenta nuevamente.');
        this.isProcessing = false;
      }
    }
  }

  goBack() {
    this.router.navigate(['/', this.airlineAlias, 'booking']);
  }

  goHome() {
    this.router.navigate(['/', this.airlineAlias]);
  }
}
