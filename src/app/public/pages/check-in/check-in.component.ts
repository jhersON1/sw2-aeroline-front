import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FlightService, BookingData } from '../../services/flight.service';

@Component({  selector: 'app-check-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm py-6">
        <div class="container mx-auto px-4">
          <div class="text-center">
            <h1 class="text-3xl font-bold text-gray-900">Check-in Online</h1>
            <p class="text-gray-600 mt-2">Realiza tu check-in de forma rápida y sencilla</p>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-8">
        @if (!bookingFound && !searchPerformed) {
          <!-- Search Form -->
          <div class="max-w-md mx-auto">
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-semibold mb-4">Buscar Reserva</h2>
              
              <form [formGroup]="searchForm" (ngSubmit)="searchBooking()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Código de Reserva</label>
                  <input type="text" formControlName="bookingReference" 
                         placeholder="Ej: BOL123ABC"
                         class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase">
                  @if (searchForm.get('bookingReference')?.invalid && searchForm.get('bookingReference')?.touched) {
                    <p class="mt-1 text-sm text-red-600">Código de reserva requerido</p>
                  }
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Número de Documento</label>
                  <input type="text" formControlName="documentNumber" 
                         placeholder="Número de CI o Pasaporte"
                         class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  @if (searchForm.get('documentNumber')?.invalid && searchForm.get('documentNumber')?.touched) {
                    <p class="mt-1 text-sm text-red-600">Número de documento requerido</p>
                  }
                </div>

                <button type="submit" [disabled]="searchForm.invalid || isSearching" 
                        [class]="'w-full py-3 rounded-lg font-semibold transition duration-300 ' + 
                                 (searchForm.valid && !isSearching ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed')">
                  @if (isSearching) {
                    <div class="flex items-center justify-center space-x-2">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Buscando...</span>
                    </div>
                  } @else {
                    Buscar Reserva
                  }
                </button>
              </form>
            </div>
          </div>
        } @else if (!bookingFound && searchPerformed) {
          <!-- Not Found -->
          <div class="max-w-md mx-auto text-center">
            <div class="bg-white rounded-lg shadow-sm p-8">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h2 class="text-xl font-semibold text-gray-900 mb-2">Reserva no encontrada</h2>
              <p class="text-gray-600 mb-4">Verifica que el código de reserva y número de documento sean correctos</p>
              <button (click)="resetSearch()" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Intentar de nuevo
              </button>
            </div>
          </div>
        } @else if (bookingData && !checkInCompleted) {
          <!-- Booking Found - Check-in Process -->
          <div class="max-w-4xl mx-auto">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <!-- Main Check-in Form -->
              <div class="lg:col-span-2">
                <div class="bg-white rounded-lg shadow-sm p-6">
                  <h2 class="text-xl font-semibold mb-6">Confirmar Check-in</h2>
                  
                  <!-- Flight Info -->
                  <div class="bg-blue-50 rounded-lg p-4 mb-6">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                      <div>
                        <p class="font-bold text-lg">{{ bookingData.flight.code }}</p>
                        <p class="text-gray-600">{{ bookingData.flight.origin.city }} → {{ bookingData.flight.destination.city }}</p>
                        <p class="text-sm text-gray-500">{{ getCurrentDate() | date:'mediumDate' }} • {{ bookingData.flight.departureTime }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Passengers List -->
                  <div class="space-y-4">
                    <h3 class="font-medium">Pasajeros para Check-in</h3>
                    @for (passenger of bookingData.passengers; track $index; let i = $index) {
                      <div class="border border-gray-200 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                          <div>
                            <p class="font-medium">{{ passenger.firstName }} {{ passenger.lastName }}</p>
                            <p class="text-sm text-gray-600">{{ passenger.documentType }}: {{ passenger.documentNumber }}</p>
                            <p class="text-sm text-gray-500">Asiento: {{ generateSeatNumber(i) }}</p>
                          </div>
                          <div class="text-right">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              Listo para Check-in
                            </span>
                          </div>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Check-in Confirmation -->
                  <div class="mt-8 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <div class="flex items-start space-x-3">
                      <input type="checkbox" [(ngModel)]="acceptCheckInTerms" class="mt-1">
                      <div class="text-sm text-gray-700">
                        <p class="font-medium mb-2">Confirmo que:</p>
                        <ul class="space-y-1 text-xs">
                          <li>• He revisado la información de todos los pasajeros</li>
                          <li>• Cumplo con las restricciones de equipaje de mano</li>
                          <li>• Llegaré al aeropuerto con al menos 2 horas de anticipación</li>
                          <li>• Tengo todos los documentos de identidad necesarios</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <!-- Check-in Button -->
                  <button (click)="performCheckIn()" [disabled]="!acceptCheckInTerms || isProcessingCheckIn" 
                          [class]="'w-full mt-6 py-4 rounded-lg font-semibold text-lg transition duration-300 ' + 
                                   (acceptCheckInTerms && !isProcessingCheckIn ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed')">
                    @if (isProcessingCheckIn) {
                      <div class="flex items-center justify-center space-x-2">
                        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Procesando Check-in...</span>
                      </div>
                    } @else {
                      Confirmar Check-in
                    }
                  </button>
                </div>
              </div>

              <!-- Booking Summary -->
              <div class="lg:col-span-1">
                <div class="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                  <h3 class="text-lg font-semibold mb-4">Resumen de Vuelo</h3>
                  
                  <div class="space-y-4 text-sm">
                    <div>
                      <p class="text-gray-500">Código de Reserva</p>
                      <p class="font-mono font-bold">{{ bookingData.bookingReference }}</p>
                    </div>
                    
                    <div>
                      <p class="text-gray-500">Vuelo</p>
                      <p class="font-medium">{{ bookingData.flight.code }}</p>
                    </div>
                    
                    <div>
                      <p class="text-gray-500">Ruta</p>
                      <p class="font-medium">{{ bookingData.flight.origin.code }} → {{ bookingData.flight.destination.code }}</p>
                    </div>
                    
                    <div>
                      <p class="text-gray-500">Horario</p>
                      <p class="font-medium">{{ bookingData.flight.departureTime }} - {{ bookingData.flight.arrivalTime }}</p>
                    </div>
                    
                    <div>
                      <p class="text-gray-500">Pasajeros</p>
                      <p class="font-medium">{{ bookingData.passengers.length }}</p>
                    </div>
                    
                    <div>
                      <p class="text-gray-500">Aeronave</p>
                      <p class="font-medium">{{ bookingData.flight.aircraft }}</p>
                    </div>
                  </div>

                  <div class="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div class="flex items-start space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div class="text-xs text-yellow-800">
                        <p class="font-medium">Importante:</p>
                        <p>El check-in online cierra 1 hora antes del vuelo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        } @else if (checkInCompleted) {
          <!-- Check-in Completed -->
          <div class="max-w-2xl mx-auto text-center">
            <div class="bg-white rounded-lg shadow-sm p-8">
              <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 class="text-2xl font-bold text-gray-900 mb-2">¡Check-in Realizado!</h2>
              <p class="text-gray-600 mb-6">Tu check-in ha sido procesado exitosamente</p>
              
              <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p class="text-sm text-green-800">
                  <strong>Próximos pasos:</strong><br>
                  • Llega al aeropuerto 2 horas antes<br>
                  • Dirígete directamente a la zona de embarque<br>
                  • Ten tu documento de identidad listo
                </p>
              </div>

              <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button (click)="downloadBoardingPass()" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Descargar Pase de Abordar</span>
                </button>
                
                <button (click)="goHome()" class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  Volver al Inicio
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class CheckInComponent implements OnInit {
  searchForm: FormGroup;
  bookingData: BookingData | null = null;
  airlineAlias: string = '';
  
  // Component state
  isSearching: boolean = false;
  searchPerformed: boolean = false;
  bookingFound: boolean = false;
  checkInCompleted: boolean = false;
  isProcessingCheckIn: boolean = false;
  acceptCheckInTerms: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private flightService: FlightService
  ) {
    this.searchForm = this.fb.group({
      bookingReference: ['', [Validators.required, Validators.minLength(6)]],
      documentNumber: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.route.parent?.params.subscribe(params => {
      this.airlineAlias = params['airlineAlias'];
    });

    // Check if we have a reference from query params (coming from confirmation)
    this.route.queryParams.subscribe(params => {
      if (params['reference']) {
        this.searchForm.patchValue({
          bookingReference: params['reference']
        });
      }
    });

    // Check if we already have booking data
    const currentBooking = this.flightService.getCurrentBooking();
    if (currentBooking) {
      this.bookingData = currentBooking;
      this.bookingFound = true;
    }
  }

  async searchBooking() {
    if (this.searchForm.valid) {
      this.isSearching = true;
      this.searchPerformed = false;

      try {
        // TODO: Backend integration - Search booking by reference and document
        // For now, we'll check against current booking or simulate search
        const reference = this.searchForm.value.bookingReference.toUpperCase();
        const documentNumber = this.searchForm.value.documentNumber;

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const booking = await this.flightService.getBookingByReference(reference);
        
        if (booking && this.validateDocument(booking, documentNumber)) {
          this.bookingData = booking;
          this.bookingFound = true;
        } else {
          this.bookingFound = false;
        }
        
        this.searchPerformed = true;
      } catch (error) {
        console.error('Error searching booking:', error);
        this.bookingFound = false;
        this.searchPerformed = true;
      } finally {
        this.isSearching = false;
      }
    }
  }

  private validateDocument(booking: BookingData, documentNumber: string): boolean {
    // Check if any passenger has the provided document number
    return booking.passengers.some(passenger => 
      passenger.documentNumber === documentNumber
    );
  }

  async performCheckIn() {
    if (this.acceptCheckInTerms && this.bookingData) {
      this.isProcessingCheckIn = true;

      try {
        // Simulate check-in processing
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // TODO: Backend integration - Perform actual check-in
        // Example: await this.flightService.performCheckIn(this.bookingData.bookingReference);
        
        this.checkInCompleted = true;
      } catch (error) {
        console.error('Error performing check-in:', error);
        alert('Error al realizar el check-in. Por favor intenta nuevamente.');
      } finally {
        this.isProcessingCheckIn = false;
      }
    }
  }

  generateSeatNumber(index: number): string {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seatNumber = Math.floor(index / 6) + 1;
    const seatLetter = rows[index % 6];
    return `${seatNumber}${seatLetter}`;
  }

  getCurrentDate(): Date {
    return new Date();
  }

  downloadBoardingPass() {
    // TODO: Backend integration - Generate and download boarding pass
    window.print();
  }

  resetSearch() {
    this.searchPerformed = false;
    this.bookingFound = false;
    this.bookingData = null;
    this.searchForm.reset();
  }

  goHome() {
    this.router.navigate(['/', this.airlineAlias]);
  }
}
