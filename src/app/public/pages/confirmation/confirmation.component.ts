import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FlightService, BookingData } from '../../services/flight.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      @if (bookingData) {
        <div class="container mx-auto px-4 py-8">
          <!-- Success Message -->
          <div class="max-w-4xl mx-auto">
            <div class="text-center mb-8">
              <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">¡Reserva Confirmada!</h1>
              <p class="text-lg text-gray-600">Tu vuelo ha sido reservado exitosamente</p>
            </div>

            <!-- Boarding Pass / Receipt -->
            <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-8" id="boarding-pass">
              <!-- Header -->
              <div class="bg-gradient-to-r from-blue-600 to-indigo-800 text-white p-6">
                <div class="flex justify-between items-center">
                  <div>
                    <h2 class="text-2xl font-bold">{{ airlineName }}</h2>
                    <p class="text-blue-100">Comprobante de Reserva</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-blue-100">Código de Reserva</p>
                    <p class="text-2xl font-bold">{{ bookingData.bookingReference }}</p>
                  </div>
                </div>
              </div>

              <div class="p-6">
                <!-- Flight Information -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div class="md:col-span-2">
                    <h3 class="text-lg font-semibold mb-4">Información del Vuelo</h3>
                    
                    <div class="flex items-center space-x-6">
                      <div class="text-center">
                        <p class="text-3xl font-bold text-gray-900">{{ bookingData.flight.departureTime }}</p>
                        <p class="text-lg font-medium text-gray-700">{{ bookingData.flight.origin.city }}</p>
                        <p class="text-sm text-gray-500">{{ bookingData.flight.origin.code }}</p>
                        <p class="text-xs text-gray-400">{{ bookingData.flight.origin.name }}</p>
                      </div>
                      
                      <div class="flex-1 text-center">
                        <div class="relative">
                          <div class="border-t-2 border-dashed border-gray-300"></div>
                          <div class="absolute inset-0 flex items-center justify-center">
                            <div class="bg-white px-3">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <p class="text-sm text-gray-600 mt-2">{{ bookingData.flight.duration }}</p>
                        <p class="text-xs text-gray-500">{{ bookingData.flight.code }}</p>
                      </div>
                      
                      <div class="text-center">
                        <p class="text-3xl font-bold text-gray-900">{{ bookingData.flight.arrivalTime }}</p>
                        <p class="text-lg font-medium text-gray-700">{{ bookingData.flight.destination.city }}</p>
                        <p class="text-sm text-gray-500">{{ bookingData.flight.destination.code }}</p>
                        <p class="text-xs text-gray-400">{{ bookingData.flight.destination.name }}</p>
                      </div>
                    </div>

                    <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p class="text-gray-500">Vuelo</p>
                        <p class="font-medium">{{ bookingData.flight.code }}</p>
                      </div>
                      <div>
                        <p class="text-gray-500">Aeronave</p>
                        <p class="font-medium">{{ bookingData.flight.aircraft }}</p>
                      </div>
                      <div>
                        <p class="text-gray-500">Fecha</p>
                        <p class="font-medium">{{ getCurrentDate() | date:'mediumDate' }}</p>
                      </div>
                      <div>
                        <p class="text-gray-500">Estado</p>
                        <p class="font-medium text-green-600">Confirmado</p>
                      </div>
                    </div>
                  </div>

                  <!-- QR Code Placeholder -->
                  <div class="text-center">
                    <div class="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <p class="text-xs text-gray-500">Código QR</p>
                    <p class="text-xs text-gray-500">Para Check-in</p>
                  </div>
                </div>

                <!-- Passengers -->
                <div class="mb-8">
                  <h3 class="text-lg font-semibold mb-4">Pasajeros</h3>
                  <div class="space-y-3">
                    @for (passenger of bookingData.passengers; track $index; let i = $index) {
                      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p class="font-medium">{{ passenger.firstName }} {{ passenger.lastName }}</p>
                          <p class="text-sm text-gray-600">{{ passenger.documentType }}: {{ passenger.documentNumber }}</p>
                        </div>
                        <div class="text-right">
                          <p class="text-sm text-gray-500">Asiento</p>
                          <p class="font-medium">{{ generateSeatNumber(i) }}</p>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Payment Information -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 class="text-lg font-semibold mb-4">Información de Pago</h3>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span>Subtotal ({{ bookingData.passengers.length }} {{ bookingData.passengers.length === 1 ? 'pasajero' : 'pasajeros' }})</span>
                        <span>{{ (bookingData.totalPrice / 1.1) | currency:'BOB':'symbol':'1.0-0' }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Tasas e impuestos</span>
                        <span>{{ (bookingData.totalPrice * 0.1) | currency:'BOB':'symbol':'1.0-0' }}</span>
                      </div>
                      <hr class="my-2">
                      <div class="flex justify-between font-bold text-lg">
                        <span>Total Pagado</span>
                        <span class="text-green-600">{{ bookingData.totalPrice | currency:'BOB':'symbol':'1.0-0' }}</span>
                      </div>
                      @if (bookingData.paymentInfo) {
                        <div class="mt-2 pt-2 border-t text-xs text-gray-500">
                          <p>Pagado con tarjeta terminada en {{ getLastFourDigits(bookingData.paymentInfo.cardNumber) }}</p>
                        </div>
                      }
                    </div>
                  </div>

                  <div>
                    <h3 class="text-lg font-semibold mb-4">Información Importante</h3>
                    <div class="space-y-2 text-sm text-gray-600">
                      <div class="flex items-start space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mt-0.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Llegue al aeropuerto 2 horas antes del vuelo</span>
                      </div>
                      <div class="flex items-start space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mt-0.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Documente con su cédula de identidad</span>
                      </div>
                      <div class="flex items-start space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mt-0.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Equipaje de mano: máximo 8kg</span>
                      </div>
                      <div class="flex items-start space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mt-0.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Check-in online disponible 24h antes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="bg-gray-50 px-6 py-4 border-t">
                <div class="flex justify-between items-center text-sm text-gray-600">
                  <div>
                    <p>Fecha de emisión: {{ getCurrentDate() | date:'short' }}</p>
                  </div>
                  <div class="text-right">
                    <p>{{ airlineName }}</p>
                    <p>¡Gracias por volar con nosotros!</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button (click)="downloadReceipt()" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Descargar Comprobante</span>
              </button>
              
              <button (click)="goToCheckIn()" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Hacer Check-in</span>
              </button>
              
              <button (click)="goHome()" class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Volver al Inicio</span>
              </button>
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
export class ConfirmationComponent implements OnInit {
  bookingData: BookingData | null = null;
  airlineAlias: string = '';
  airlineName: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private flightService: FlightService
  ) {}

  ngOnInit() {
    this.bookingData = this.flightService.getCurrentBooking();
    
    this.route.parent?.params.subscribe(params => {
      this.airlineAlias = params['airlineAlias'];
      this.airlineName = this.formatAirlineName(this.airlineAlias);
    });
    
    if (!this.bookingData || this.bookingData.passengers.length === 0) {
      this.goHome();
    }
  }

  getCurrentDate(): Date {
    return new Date();
  }

  generateSeatNumber(index: number): string {
    // Simple seat assignment logic
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seatNumber = Math.floor(index / 6) + 1;
    const seatLetter = rows[index % 6];
    return `${seatNumber}${seatLetter}`;
  }

  getLastFourDigits(cardNumber: string): string {
    return cardNumber.slice(-4);
  }

  downloadReceipt() {
    // TODO: Backend integration - Generate and download PDF receipt
    // For now, we'll simulate the download by printing
    window.print();
  }

  goToCheckIn() {
    this.router.navigate(['/', this.airlineAlias, 'check-in'], {
      queryParams: { reference: this.bookingData?.bookingReference }
    });
  }

  goHome() {
    this.router.navigate(['/', this.airlineAlias]);
  }

  private formatAirlineName(alias: string): string {
    return alias.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') + ' Airlines';
  }
}
