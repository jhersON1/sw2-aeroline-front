import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map, timeout, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import { SEARCH_FLIGHTS_BY_AIRLINE, FLIGHTS_BY_AIRLINE, SEARCH_FLIGHTS_PUBLIC } from '../../graphql/queries/flight.queries';
import { GET_AIRPORTS } from '../../graphql/queries/airport.queries';

export interface Airport {
  id?: string;
  code: string;
  name: string;
  city: string;
  country?: string;
}

export interface Aircraft {
  id?: string;
  model: string;
  seatsTotal: number;
  registration?: string;
}

export interface Flight {
  id: string;
  code: string; // En lugar de flightNumber
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  duration?: number | string; // Puede ser número (minutos) o string (formato)
  price: number;
  aircraft: Aircraft;
  status?: string;
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
  
  // Agregar almacenamiento temporal de búsqueda
  private lastSearchParams: {
    origin: string;
    destination: string;
    departureDate: string;
    passengers: number;
    tripType: string;
  } | null = null;
  constructor(private apollo: Apollo, private http: HttpClient) {}

  // Datos temporales mientras se configura Apollo correctamente
  private mockAirports: Airport[] = [
    { id: '1', code: 'LPB', name: 'Aeropuerto Internacional El Alto', city: 'La Paz', country: 'Bolivia' },
    { id: '2', code: 'VVI', name: 'Aeropuerto Internacional Viru Viru', city: 'Santa Cruz', country: 'Bolivia' },
    { id: '3', code: 'CBB', name: 'Aeropuerto Internacional Jorge Wilstermann', city: 'Cochabamba', country: 'Bolivia' },
    { id: '4', code: 'SRE', name: 'Aeropuerto Capitán Av. Salvador Ogaya G.', city: 'Sucre', country: 'Bolivia' },
    { id: '5', code: 'TJA', name: 'Aeropuerto Capitán Oriel Lea Plaza', city: 'Tarija', country: 'Bolivia' },
  ];

  private mockFlights: Flight[] = [
    {
      id: '1',
      code: 'BOA-101',
      origin: this.mockAirports[0], // LPB
      destination: this.mockAirports[1], // VVI
      departureTime: '2025-06-15T08:00:00',
      arrivalTime: '2025-06-15T09:15:00',
      duration: 75,
      price: 450,
      aircraft: { id: '1', model: 'Boeing 737-800', seatsTotal: 160, registration: 'CP-3000' },
      status: 'PROGRAMADO'
    },
    {
      id: '2',
      code: 'BOA-102',
      origin: this.mockAirports[1], // VVI
      destination: this.mockAirports[0], // LPB
      departureTime: '2025-06-15T14:30:00',
      arrivalTime: '2025-06-15T15:45:00',
      duration: 75,
      price: 450,
      aircraft: { id: '2', model: 'Boeing 737-800', seatsTotal: 160, registration: 'CP-3001' },
      status: 'PROGRAMADO'
    },
    {
      id: '3',
      code: 'BOA-201',
      origin: this.mockAirports[0], // LPB
      destination: this.mockAirports[2], // CBB
      departureTime: '2025-06-15T10:30:00',
      arrivalTime: '2025-06-15T11:15:00',
      duration: 45,
      price: 320,
      aircraft: { id: '3', model: 'Airbus A320', seatsTotal: 180, registration: 'CP-3002' },
      status: 'PROGRAMADO'
    }
  ];  /**
   * Obtener aeropuertos usando GraphQL con fallback confiable
   */
  getAirports(): Observable<Airport[]> {
    console.log('🔄 Iniciando getAirports() - Usando datos mock directamente para mejor rendimiento');
    
    // Usar datos mock directamente para evitar problemas de UI
    // Comentar las siguientes líneas para volver a usar GraphQL cuando esté listo
    return of(this.mockAirports).pipe(
      delay(100), // Simular tiempo de carga mínimo
      map(airports => {
        console.log(`✅ Aeropuertos mock cargados (${airports.length} disponibles):`, airports);
        return airports;
      })
    );
    
    /* 
    // Versión GraphQL - descomentar cuando esté funcionando correctamente
    return this.apollo.watchQuery<{ allAirports: Airport[] }>({
      query: GET_AIRPORTS,
      fetchPolicy: 'cache-first',
      errorPolicy: 'all'
    }).valueChanges.pipe(
      timeout(3000),
      map(result => {
        console.log('📡 Respuesta de GraphQL allAirports:', result);
        
        if (result.errors) {
          console.error('⚠️ GraphQL errors en getAirports:', result.errors);
          return this.mockAirports;
        }
        
        const airports = result.data?.allAirports || [];
        if (airports.length === 0) {
          console.log('📡 GraphQL devolvió 0 aeropuertos, usando mock como fallback');
          return this.mockAirports;
        }
        
        console.log(`✅ Cargados ${airports.length} aeropuertos desde GraphQL`);
        return airports;
      }),
      catchError((error: any) => {
        console.error('❌ Error en Apollo query getAirports:', error);
        console.log('🔄 Usando aeropuertos mock como fallback por error');
        return of(this.mockAirports);
      })
    );
    */
  }  /**
   * Buscar vuelos usando GraphQL con fallback confiable
   */  searchFlights(origin: string, destination: string, departureDate: string, passengers: number): Observable<Flight[]> {
    console.log(`🔍 Búsqueda de vuelos: ${origin} → ${destination} el ${departureDate} para ${passengers} pasajeros`);
    console.log('🔄 Usando datos mock directamente para mejor rendimiento');
    
    // Guardar parámetros de búsqueda para uso posterior
    this.lastSearchParams = {
      origin,
      destination,
      departureDate,
      passengers,
      tripType: 'oneWay' // Por defecto
    };
    
    // Usar datos mock directamente para evitar problemas de UI
    // Comentar las siguientes líneas para volver a usar GraphQL cuando esté listo
    return of(this.getMockSearchFlights(origin, destination, passengers)).pipe(
      delay(100), // Simular tiempo de búsqueda muy corto
      map(flights => {
        console.log(`✅ Vuelos mock encontrados (${flights.length} resultados):`, flights);
        return flights;
      })
    );
    
    /*
    // Versión GraphQL - descomentar cuando esté funcionando correctamente
    const formattedDate = `${departureDate}T10:00:00`;
    
    return this.apollo.watchQuery<{ searchFlights: Flight[] }>({
      query: SEARCH_FLIGHTS_PUBLIC,
      variables: { 
        originCode: origin.toUpperCase(),
        destinationCode: destination.toUpperCase(),
        departureDate: formattedDate
      },
      errorPolicy: 'all',
      fetchPolicy: 'cache-first'
    }).valueChanges.pipe(
      timeout(3000),
      map((result: any) => {
        console.log('📡 Respuesta de GraphQL:', result);
        
        if (result.errors) {
          console.error('⚠️ GraphQL errors en searchFlights:', result.errors);
          return this.getMockSearchFlights(origin, destination, passengers);
        }
        
        const flights = result.data?.searchFlights || [];
        if (flights.length === 0) {
          console.log('📡 GraphQL devolvió 0 vuelos, usando mock como fallback');
          return this.getMockSearchFlights(origin, destination, passengers);
        }
        
        console.log(`✅ Encontrados ${flights.length} vuelos desde GraphQL`);
        return flights.filter((flight: any) => flight.aircraft.seatsTotal >= passengers);
      }),
      catchError((error: any) => {
        console.error('❌ Error en Apollo query:', error);
        return of(this.getMockSearchFlights(origin, destination, passengers));
      })
    );
    */
  }  /**
   * Método auxiliar para obtener vuelos mock como fallback
   */
  private getMockSearchFlights(origin: string, destination: string, passengers: number): Flight[] {
    console.log(`🔧 Generando vuelos mock para ${origin} → ${destination}, ${passengers} pasajeros`);
    
    // Buscar aeropuertos en el array mock
    const originAirport = this.mockAirports.find(a => a.code === origin.toUpperCase());
    const destinationAirport = this.mockAirports.find(a => a.code === destination.toUpperCase());
    
    if (!originAirport || !destinationAirport) {
      console.log(`⚠️ No se encontraron aeropuertos para ${origin} o ${destination}`);
      return [];
    }

    // Si el origen y destino son iguales, no hay vuelos
    if (origin.toUpperCase() === destination.toUpperCase()) {
      console.log(`⚠️ El origen y destino no pueden ser iguales`);
      return [];
    }
    
    // Calcular precio base según la ruta
    const calculateBasePrice = (from: string, to: string): number => {
      const routes: { [key: string]: number } = {
        'LPB-VVI': 450, 'VVI-LPB': 450,
        'LPB-CBB': 380, 'CBB-LPB': 380,
        'VVI-CBB': 320, 'CBB-VVI': 320,
        'LPB-SRE': 420, 'SRE-LPB': 420,
        'VVI-TJA': 380, 'TJA-VVI': 380,
        'CBB-SRE': 350, 'SRE-CBB': 350,
        'LPB-TJA': 480, 'TJA-LPB': 480,
        'VVI-SRE': 390, 'SRE-VVI': 390,
        'CBB-TJA': 370, 'TJA-CBB': 370,
        'SRE-TJA': 340, 'TJA-SRE': 340
      };
      return routes[`${from}-${to}`] || 400;
    };

    const basePrice = calculateBasePrice(origin.toUpperCase(), destination.toUpperCase());
    
    // Generar vuelos mock dinámicos para el día
    const today = new Date();
    const departureDate = today.toISOString().split('T')[0];
    
    const mockFlights: Flight[] = [
      {
        id: `mock-${origin}-${destination}-morning`,
        code: 'OB-101',
        origin: originAirport,
        destination: destinationAirport,
        departureTime: `${departureDate}T08:00:00`,
        arrivalTime: `${departureDate}T09:30:00`,
        duration: 90,
        price: basePrice,
        aircraft: { id: '1', model: 'Boeing 737-800', seatsTotal: 160, registration: 'CP-3000' },
        status: 'PROGRAMADO'
      },
      {
        id: `mock-${origin}-${destination}-afternoon`,
        code: 'OB-102',
        origin: originAirport,
        destination: destinationAirport,
        departureTime: `${departureDate}T14:30:00`,
        arrivalTime: `${departureDate}T16:00:00`,
        duration: 90,
        price: basePrice + 30,
        aircraft: { id: '2', model: 'Boeing 737-800', seatsTotal: 160, registration: 'CP-3001' },
        status: 'PROGRAMADO'
      },
      {
        id: `mock-${origin}-${destination}-evening`,
        code: 'Z8-201',
        origin: originAirport,
        destination: destinationAirport,
        departureTime: `${departureDate}T18:45:00`,
        arrivalTime: `${departureDate}T20:15:00`,
        duration: 90,
        price: basePrice - 30,
        aircraft: { id: '3', model: 'Airbus A320', seatsTotal: 180, registration: 'CP-3002' },
        status: 'PROGRAMADO'
      },
      {
        id: `mock-${origin}-${destination}-late`,
        code: 'AM-301',
        origin: originAirport,
        destination: destinationAirport,
        departureTime: `${departureDate}T20:30:00`,
        arrivalTime: `${departureDate}T22:00:00`,
        duration: 90,
        price: basePrice + 50,
        aircraft: { id: '4', model: 'Boeing 737-700', seatsTotal: 140, registration: 'CP-3003' },
        status: 'PROGRAMADO'
      }    ];
    
    // Filtrar por capacidad de asientos
    const availableFlights = mockFlights.filter(flight => 
      flight.aircraft.seatsTotal >= passengers
    );
    
    console.log(`✅ Generados ${availableFlights.length} vuelos mock disponibles para ${passengers} pasajeros`);
    return availableFlights;
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
    });  }
  /**
   * Busca vuelos por alias de aerolínea (para URLs públicas)
   */  getFlightsByAirline(airlineAlias: string): Observable<Flight[]> {
    // Mapear alias a IDs de aerolínea (temporal hasta que searchFlightsByAirline funcione)
    
    // Parsear el alias para extraer solo la parte de la aerolínea
    const parsedAlias = this.parseAirlineAlias(airlineAlias);
    
    let airlineId: string;
    
    switch(parsedAlias.toLowerCase()) {
      case 'boa':
        airlineId = '550e8400-e29b-41d4-a716-446655440001';
        break;
      case 'amaszonas':
        airlineId = '550e8400-e29b-41d4-a716-446655440002';
        break;
      default:
        console.warn(`⚠️ Aerolínea no encontrada: ${airlineAlias} (parsed: ${parsedAlias})`);
        return of([]);
    }

    return this.apollo.watchQuery<{ flightsByAirline: Flight[] }>({
      query: FLIGHTS_BY_AIRLINE,
      variables: { airlineId }
    }).valueChanges.pipe(
      map(result => {
        if (result.errors) {
          console.error('⚠️ GraphQL errors:', result.errors);
          // Fallback a datos mock en caso de error
          return this.getMockFlightsByAirline(parsedAlias);
        }
        return result.data?.flightsByAirline || [];
      })
    );
  }

  /**
   * Parsear alias de aerolínea para extraer solo la parte relevante
   */
  private parseAirlineAlias(fullAlias: string): string {
    const parts = fullAlias.split('-');
    
    if (parts.length >= 2) {
      return parts[parts.length - 1];
    }
    
    return fullAlias;
  }

  /**
   * Método auxiliar para obtener vuelos mock por aerolínea (fallback)
   */
  private getMockFlightsByAirline(airlineAlias: string): Flight[] {
    return this.mockFlights.filter(flight => {
      if (airlineAlias === 'boa') {
        return flight.code.startsWith('OB'); // Boliviana de Aviación
      } else if (airlineAlias === 'amaszonas') {
        return flight.code.startsWith('Z8'); // Amaszonas
      }
      return false;
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
  /**
   * Buscar vuelos usando HTTP directo (alternativa más robusta)
   */
  searchFlightsHttp(origin: string, destination: string, departureDate: string, passengers: number): Observable<Flight[]> {
    const formattedDate = `${departureDate}T10:00:00`;
    
    console.log(`🔍 Búsqueda HTTP: ${origin} → ${destination} el ${formattedDate}`);
    
    const graphqlQuery = {
      query: `
        query SearchFlights($originCode: String!, $destinationCode: String!, $departureDate: LocalDateTime!) {
          searchFlights(originCode: $originCode, destinationCode: $destinationCode, departureDate: $departureDate) {
            id
            code
            status
            departureTime
            arrivalTime
            price
            duration
            aircraft {
              id
              model
              seatsTotal
              registration
            }
            origin {
              id
              code
              name
              city
              country
            }
            destination {
              id
              code
              name
              city
              country
            }
          }
        }
      `,
      variables: {
        originCode: origin.toUpperCase(),
        destinationCode: destination.toUpperCase(),
        departureDate: formattedDate
      }
    };

    return this.http.post<any>('http://localhost:8081/graphql', graphqlQuery).pipe(
      timeout(5000), // Reducido a 5 segundos
      map(response => {
        console.log('📡 Respuesta HTTP:', response);
        
        if (response.errors) {
          console.error('⚠️ GraphQL errors:', response.errors);
          return this.getMockSearchFlights(origin, destination, passengers);
        }
        
        const flights = response.data?.searchFlights || [];
        console.log(`✅ Encontrados ${flights.length} vuelos`);
        
        return flights.filter((flight: any) => flight.aircraft.seatsTotal >= passengers);
      }),
      catchError((error: any) => {
        console.error('❌ Error HTTP:', error);
        return of(this.getMockSearchFlights(origin, destination, passengers));
      })
    );
  }

  // Métodos para manejar parámetros de búsqueda guardados
  getLastSearchParams() {
    return this.lastSearchParams;
  }
  
  setLastSearchParams(params: {
    origin: string;
    destination: string;
    departureDate: string;
    passengers: number;
    tripType: string;
  }) {
    this.lastSearchParams = params;
  }
  
  clearLastSearchParams() {
    this.lastSearchParams = null;
  }
}
