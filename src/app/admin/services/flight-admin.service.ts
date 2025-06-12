import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Apollo, gql } from 'apollo-angular';
import { map, catchError } from 'rxjs/operators';

export interface FlightAdmin {
  id: string;
  code: string;
  aircraft: {
    id: string;
    model: string;
    registration: string;
    seatsTotal: number;
  };
  origin: {
    id: string;
    code: string;
    name: string;
    city: string;
  };
  destination: {
    id: string;
    code: string;
    name: string;
    city: string;
  };
  departureTime: string;
  arrivalTime: string;
  price: number;
  status: 'PROGRAMADO' | 'EN_VUELO' | 'ATERRIZADO' | 'CANCELADO' | 'RETRASADO';
  duration?: number;
}

export interface CreateFlightRequest {
  code: string;
  airlineId: string;  // Requerido
  aircraftId: string;
  originId: string;
  destinationId: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  status: string;
  userId?: string; // Opcional para compatibilidad
}

export interface UpdateFlightRequest extends CreateFlightRequest {
  id: string;
}

// GraphQL Queries
const GET_ALL_FLIGHTS = gql`
  query GetAllFlights {
    allFlights {
      id
      code
      status
      departureTime
      arrivalTime
      price
      aircraft {
        id
        model
        registration
        seatsTotal
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
`;

const GET_FLIGHT_BY_ID = gql`
  query GetFlight($id: String!) {
    flight(id: $id) {
      id
      code
      status
      departureTime
      arrivalTime
      price
      aircraft {
        id
        model
        registration
        seatsTotal
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
`;

const CREATE_FLIGHT = gql`
  mutation CreateFlight($input: FlightInput!) {
    createFlight(input: $input) {
      id
      code
      status
      departureTime
      arrivalTime
      price
      aircraft {
        id
        model
        registration
        seatsTotal
      }
      origin {
        id
        code
        name
        city
      }
      destination {
        id
        code
        name
        city
      }
    }
  }
`;

const UPDATE_FLIGHT = gql`
  mutation UpdateFlight($id: ID!, $input: FlightInput!) {
    updateFlight(id: $id, input: $input) {
      id
      code
      status
      departureTime
      arrivalTime
      price
    }
  }
`;

const DELETE_FLIGHT = gql`
  mutation DeleteFlight($id: ID!) {
    deleteFlight(id: $id)
  }
`;

@Injectable({
  providedIn: 'root'
})
export class FlightAdminService {

  constructor(
    private apollo: Apollo,
    private http: HttpClient
  ) {}

  /**
   * Obtiene todos los vuelos del usuario actual
   */
  getAllFlights(): Observable<FlightAdmin[]> {
    return this.apollo.watchQuery<{ allFlights: FlightAdmin[] }>({
      query: GET_ALL_FLIGHTS,
      fetchPolicy: 'cache-and-network'
    }).valueChanges.pipe(
      map(result => {
        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          return this.getMockFlights(); // Fallback a datos mock
        }
        return result.data?.allFlights || [];
      }),
      catchError(error => {
        console.error('Error loading flights:', error);
        return of(this.getMockFlights()); // Fallback a datos mock
      })
    );
  }

  /**
   * Obtiene un vuelo por ID
   */
  getFlightById(id: string): Observable<FlightAdmin | null> {
    return this.apollo.watchQuery<{ flight: FlightAdmin }>({
      query: GET_FLIGHT_BY_ID,
      variables: { id }
    }).valueChanges.pipe(
      map(result => {
        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          return null;
        }
        return result.data?.flight || null;
      }),
      catchError(error => {
        console.error('Error loading flight:', error);
        return of(null);
      })
    );
  }  /**
   * Crea un nuevo vuelo
   */  createFlight(flightData: CreateFlightRequest): Observable<FlightAdmin> {
    console.log('📤 Datos del vuelo a crear:', flightData);
    
    // Validaciones más estrictas
    if (!flightData.airlineId) {
      throw new Error('airlineId es requerido para crear un vuelo');
    }
    if (!flightData.aircraftId) {
      throw new Error('aircraftId es requerido para crear un vuelo');
    }
    if (!flightData.originId) {
      throw new Error('originId es requerido para crear un vuelo');
    }
    if (!flightData.destinationId) {
      throw new Error('destinationId es requerido para crear un vuelo');
    }    const input = {
      code: flightData.code,
      airlineId: flightData.airlineId,
      aircraftId: flightData.aircraftId,
      originId: flightData.originId,
      destinationId: flightData.destinationId,
      departureTime: flightData.departureTime,
      arrivalTime: flightData.arrivalTime,
      price: parseFloat(flightData.price.toString()), // Asegurar que sea número
      status: flightData.status || 'PROGRAMADO',
      userId: flightData.userId || 'admin-user-id' // Usuario admin por defecto
    };

    console.log('📤 Input validado para GraphQL:', input);
    console.log('📤 Tipos de datos:', {
      code: typeof input.code,
      airlineId: typeof input.airlineId,
      aircraftId: typeof input.aircraftId,
      originId: typeof input.originId,
      destinationId: typeof input.destinationId,
      departureTime: typeof input.departureTime,
      arrivalTime: typeof input.arrivalTime,
      price: typeof input.price,
      status: typeof input.status
    });

    return this.apollo.mutate<{ createFlight: FlightAdmin }>({
      mutation: CREATE_FLIGHT,
      variables: { input },
      errorPolicy: 'all' // Capturar tanto errores de red como de GraphQL
    }).pipe(
      map(result => {
        console.log('📡 Respuesta completa del servidor:', result);
        
        if (result.errors && result.errors.length > 0) {
          console.error('❌ Errores de GraphQL:', result.errors);
          throw new Error(`Error del servidor: ${result.errors[0].message}`);
        }
        
        if (!result.data?.createFlight) {
          console.error('❌ No se recibió data del servidor');
          throw new Error('No se recibió respuesta válida del servidor');
        }
        
        console.log('✅ Vuelo creado exitosamente:', result.data.createFlight);
        return result.data.createFlight;
      }),
      catchError(error => {
        console.error('❌ Error completo en createFlight:', error);
        console.error('❌ Tipo de error:', error.constructor.name);
        console.error('❌ Message:', error.message);
        console.error('❌ GraphQL errors:', error.graphQLErrors);
        console.error('❌ Network error:', error.networkError);
        
        // Re-lanzar con mensaje más descriptivo
        let errorMessage = 'Error desconocido al crear el vuelo';
        
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          errorMessage = `Error de GraphQL: ${error.graphQLErrors[0].message}`;
        } else if (error.networkError) {
          errorMessage = `Error de red: ${error.networkError.message}`;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      })
    );
  }
  /**
   * Actualiza un vuelo existente
   */
  updateFlight(flightData: UpdateFlightRequest): Observable<FlightAdmin> {
    const input = {
      code: flightData.code,
      airlineId: flightData.airlineId || '550e8400-e29b-41d4-a716-446655440001', // BOA por defecto para desarrollo
      aircraftId: flightData.aircraftId,
      originId: flightData.originId,
      destinationId: flightData.destinationId,
      departureTime: flightData.departureTime,
      arrivalTime: flightData.arrivalTime,
      price: flightData.price,
      status: flightData.status
    };

    return this.apollo.mutate<{ updateFlight: FlightAdmin }>({
      mutation: UPDATE_FLIGHT,
      variables: { id: flightData.id, input },
      refetchQueries: [{ query: GET_ALL_FLIGHTS }]
    }).pipe(
      map(result => {
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }
        return result.data!.updateFlight;
      })
    );
  }

  /**
   * Elimina un vuelo
   */
  deleteFlight(id: string): Observable<boolean> {
    return this.apollo.mutate<{ deleteFlight: boolean }>({
      mutation: DELETE_FLIGHT,
      variables: { id },
      refetchQueries: [{ query: GET_ALL_FLIGHTS }]
    }).pipe(
      map(result => {
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }
        return result.data!.deleteFlight;
      })
    );
  }

  /**
   * Datos mock para fallback durante desarrollo
   */
  private getMockFlights(): FlightAdmin[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return [
      {
        id: '1',
        code: 'LPBVVI-001',
        aircraft: {
          id: '1',
          model: 'Boeing 737-800',
          registration: 'CP-3000',
          seatsTotal: 160
        },
        origin: {
          id: '1',
          code: 'LPB',
          name: 'Aeropuerto Internacional El Alto',
          city: 'La Paz'
        },
        destination: {
          id: '2',
          code: 'VVI',
          name: 'Aeropuerto Internacional Viru Viru',
          city: 'Santa Cruz'
        },
        departureTime: `${today.toISOString().split('T')[0]}T08:00:00`,
        arrivalTime: `${today.toISOString().split('T')[0]}T09:30:00`,
        price: 450,
        status: 'PROGRAMADO',
        duration: 90
      },
      {
        id: '2',
        code: 'VVILPB-002',
        aircraft: {
          id: '2',
          model: 'Boeing 737-800',
          registration: 'CP-3001',
          seatsTotal: 160
        },
        origin: {
          id: '2',
          code: 'VVI',
          name: 'Aeropuerto Internacional Viru Viru',
          city: 'Santa Cruz'
        },
        destination: {
          id: '1',
          code: 'LPB',
          name: 'Aeropuerto Internacional El Alto',
          city: 'La Paz'
        },
        departureTime: `${tomorrow.toISOString().split('T')[0]}T14:30:00`,
        arrivalTime: `${tomorrow.toISOString().split('T')[0]}T16:00:00`,
        price: 450,
        status: 'PROGRAMADO',
        duration: 90
      }
    ];
  }
}
