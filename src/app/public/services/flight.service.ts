import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Airport {
  code: string;
  name: string;
  city: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  availableSeats: number;
  aircraft: string;
}

export interface BookingData {
  flight: Flight;
  passengers: Passenger[];
  totalPrice: number;
  bookingReference: string;
  paymentInfo?: PaymentInfo;
}

export interface Passenger {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  birthDate: string;
}

export interface PaymentInfo {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private currentBookingSubject = new BehaviorSubject<BookingData | null>(null);
  public currentBooking$ = this.currentBookingSubject.asObservable();

  // TODO: Backend integration - Replace with API calls
  private airports: Airport[] = [
    { code: 'LPB', name: 'Aeropuerto Internacional El Alto', city: 'La Paz' },
    { code: 'VVI', name: 'Aeropuerto Internacional Viru Viru', city: 'Santa Cruz' },
    { code: 'CBB', name: 'Aeropuerto Internacional Jorge Wilstermann', city: 'Cochabamba' },
    { code: 'SRE', name: 'Aeropuerto Capitán Av. Salvador Ogaya G.', city: 'Sucre' },
    { code: 'TDD', name: 'Aeropuerto Teniente Av. Jorge Henrich Arauz', city: 'Trinidad' },
    { code: 'POI', name: 'Aeropuerto Capitán Nicolás Rojas', city: 'Potosí' },
    { code: 'TJA', name: 'Aeropuerto Capitán Oriel Lea Plaza', city: 'Tarija' },
    { code: 'ORU', name: 'Aeropuerto Juan Mendoza', city: 'Oruro' },
    { code: 'RIB', name: 'Aeropuerto Capitán Av. Selin Zeitun Lopez', city: 'Riberalta' },
    { code: 'GYA', name: 'Aeropuerto Capitán Av. Germán Quiroga G.', city: 'Guayaramerín' }
  ];

  // TODO: Backend integration - Replace with API calls to get flights by airline
  private mockFlights: Flight[] = [
    {
      id: '1',
      flightNumber: 'OB-101',
      origin: this.airports[0], // La Paz
      destination: this.airports[1], // Santa Cruz
      departureTime: '08:00',
      arrivalTime: '09:15',
      duration: '1h 15m',
      price: 450,
      availableSeats: 120,
      aircraft: 'Boeing 737-800'
    },
    {
      id: '2',
      flightNumber: 'OB-102',
      origin: this.airports[1], // Santa Cruz
      destination: this.airports[0], // La Paz
      departureTime: '14:30',
      arrivalTime: '15:45',
      duration: '1h 15m',
      price: 450,
      availableSeats: 95,
      aircraft: 'Boeing 737-800'
    },
    {
      id: '3',
      flightNumber: 'OB-201',
      origin: this.airports[0], // La Paz
      destination: this.airports[2], // Cochabamba
      departureTime: '10:30',
      arrivalTime: '11:15',
      duration: '45m',
      price: 320,
      availableSeats: 80,
      aircraft: 'Airbus A320'
    },
    {
      id: '4',
      flightNumber: 'OB-301',
      origin: this.airports[2], // Cochabamba
      destination: this.airports[1], // Santa Cruz
      departureTime: '16:00',
      arrivalTime: '17:00',
      duration: '1h',
      price: 380,
      availableSeats: 110,
      aircraft: 'Boeing 737-700'
    },
    {
      id: '5',
      flightNumber: 'OB-401',
      origin: this.airports[1], // Santa Cruz
      destination: this.airports[6], // Tarija
      departureTime: '09:45',
      arrivalTime: '11:30',
      duration: '1h 45m',
      price: 520,
      availableSeats: 60,
      aircraft: 'Embraer E190'
    }
  ];

  getAirports(): Airport[] {
    return this.airports;
  }

  searchFlights(origin: string, destination: string, departureDate: string, passengers: number): Flight[] {
    // TODO: Backend integration - Replace with API call
    // Example: return this.http.post('/api/flights/search', { origin, destination, departureDate, passengers });

    return this.mockFlights.filter(flight =>
      flight.origin.code === origin &&
      flight.destination.code === destination &&
      flight.availableSeats >= passengers
    );
  }

  setCurrentBooking(booking: BookingData): void {
    this.currentBookingSubject.next(booking);
  }

  getCurrentBooking(): BookingData | null {
    return this.currentBookingSubject.value;
  }

  generateBookingReference(): string {
    // Simple reference generator - TODO: Backend should handle this
    return 'BOL' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  processPayment(paymentInfo: PaymentInfo): Promise<boolean> {
    // TODO: Backend integration - Replace with real payment processing
    // Example: return this.http.post('/api/payment/process', paymentInfo);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true); // Simulate successful payment
      }, 2000);
    });
  }

  confirmBooking(booking: BookingData): Promise<BookingData> {
    // TODO: Backend integration - Replace with API call to save booking
    // Example: return this.http.post('/api/bookings/confirm', booking);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(booking);
      }, 1000);
    });
  }

  getBookingByReference(reference: string): Promise<BookingData | null> {
    // TODO: Backend integration - Replace with API call
    // Example: return this.http.get(`/api/bookings/${reference}`);

    return new Promise((resolve) => {
      setTimeout(() => {
        const currentBooking = this.getCurrentBooking();
        if (currentBooking && currentBooking.bookingReference === reference) {
          resolve(currentBooking);
        } else {
          resolve(null);
        }
      }, 1000);
    });
  }
}
