import { Airport } from './../models/airport.interface';
// src/app/features/airport/services/airport.service.ts

import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

// Importar interfaces
import { AirportInput } from '../models/airport-input.interface';
import {
  GET_AIRPORT_BY_ID,
  GET_AIRPORTS,
} from '../../../graphql/queries/airport.queries';
import {
  CREATE_AIRPORT,
  UPDATE_AIRPORT,
  DELETE_AIRPORT,
} from '../../../graphql/mutations/airport.mutations';

@Injectable({
  providedIn: 'root',
})
export class AirportService {
  // Estado reactivo para la lista de aeropuertos
  private airportsSubject = new BehaviorSubject<Airport[]>([]);
  public airports$ = this.airportsSubject.asObservable();

  // Estado de carga
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private apollo: Apollo) {
    console.log('🚀 AirportService inicializado con Apollo');
  }

  /**
   * Obtener todos los aeropuertos
   */
  getAirports(): Observable<Airport[]> {
    console.log('📡 Llamando a allAirports con Apollo...');
    this.loadingSubject.next(true);

    return this.apollo
      .watchQuery<{ allAirports: Airport[] }>({
        query: GET_AIRPORTS,
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      })
      .valueChanges.pipe(
        tap((result) => {
          console.log('📨 Respuesta cruda de Apollo:', result);
        }),
        map((result) => {
          if (result.errors) {
            console.error('⚠️ GraphQL errors:', result.errors);
          }

          const airports = result.data?.allAirports || [];
          console.log('✅ Aeropuertos procesados:', airports);

          this.airportsSubject.next(airports);
          this.loadingSubject.next(result.loading);
          return airports;
        }),
        catchError((error) => {
          console.error('❌ Error completo en Apollo:', error);
          console.error('❌ Error stack:', error.stack);
          console.error('❌ Network error:', error.networkError);
          console.error('❌ GraphQL errors:', error.graphQLErrors);

          this.loadingSubject.next(false);
          this.airportsSubject.next([]);

          // Retornar array vacío en lugar de propagar el error
          return of([]);
        })
      );
  }

  /**
   * Obtener aeropuerto por ID
   */
  getAirportById(id: string): Observable<Airport> {
    return this.apollo
      .query<{ airport: Airport }>({
        query: GET_AIRPORT_BY_ID,
        variables: { id },
        errorPolicy: 'all',
      })
      .pipe(
        map((result) => result.data.airport),
        catchError((error) => {
          console.error('Error fetching airport by ID:', error);
          throw error;
        })
      );
  }

  /**
   * Crear nuevo aeropuerto
   */
  createAirport(input: AirportInput): Observable<Airport> {
    console.log('🆕 Creando aeropuerto:', input);
    this.loadingSubject.next(true);

    return this.apollo
      .mutate<{ createAirport: Airport }>({
        mutation: CREATE_AIRPORT,
        variables: { input },
        errorPolicy: 'all',
        refetchQueries: [{ query: GET_AIRPORTS }], // ← AGREGAR ESTO
        awaitRefetchQueries: true, // ← AGREGAR ESTO
      })
      .pipe(
        map((result) => {
          console.log('✅ Mutation result:', result);
          this.loadingSubject.next(false);

          if (result.errors) {
            console.error('⚠️ GraphQL errors en mutation:', result.errors);
          }

          const airport = result.data!.createAirport;
          console.log('✅ Aeropuerto creado exitosamente:', airport);

          // Actualizar estado local inmediatamente
          const currentAirports = this.airportsSubject.value;
          this.airportsSubject.next([...currentAirports, airport]);

          return airport;
        }),
        catchError((error) => {
          console.error('❌ Error creando aeropuerto:', error);
          console.error('❌ Network error:', error.networkError);
          console.error('❌ GraphQL errors:', error.graphQLErrors);
          this.loadingSubject.next(false);
          throw error;
        })
      );
  }

  /**
   * Actualizar aeropuerto
   */
  updateAirport(id: string, input: AirportInput): Observable<Airport> {
    this.loadingSubject.next(true);

    return this.apollo
      .mutate<{ updateAirport: Airport }>({
        mutation: UPDATE_AIRPORT,
        variables: { id, input },
        errorPolicy: 'all',
      })
      .pipe(
        map((result) => {
          this.loadingSubject.next(false);
          const updatedAirport = result.data!.updateAirport;

          // Actualizar estado local
          const currentAirports = this.airportsSubject.value;
          const updatedAirports = currentAirports.map((airport) =>
            airport.id === id ? updatedAirport : airport
          );
          this.airportsSubject.next(updatedAirports);

          return updatedAirport;
        }),
        catchError((error) => {
          console.error('Error updating airport:', error);
          this.loadingSubject.next(false);
          throw error;
        })
      );
  }

  /**
   * Eliminar aeropuerto
   */
  deleteAirport(id: string): Observable<boolean> {
    this.loadingSubject.next(true);

    return this.apollo
      .mutate<{ deleteAirport: boolean }>({
        mutation: DELETE_AIRPORT,
        variables: { id },
        errorPolicy: 'all',
        update: (cache) => {
          try {
            const existingData = cache.readQuery<{ allAirports: Airport[] }>({
              query: GET_AIRPORTS,
            });

            if (existingData) {
              cache.writeQuery({
                query: GET_AIRPORTS,
                data: {
                  allAirports: existingData.allAirports.filter(
                    (airport) => airport.id !== id
                  ),
                },
              });
            }
          } catch (e) {
            console.warn('No se pudo actualizar cache al eliminar:', e);
          }

          // Actualizar estado local
          const currentAirports = this.airportsSubject.value;
          this.airportsSubject.next(
            currentAirports.filter((airport) => airport.id !== id)
          );
        },
      })
      .pipe(
        map((result) => {
          this.loadingSubject.next(false);
          return result.data!.deleteAirport;
        }),
        catchError((error) => {
          console.error('Error deleting airport:', error);
          this.loadingSubject.next(false);
          throw error;
        })
      );
  }

  /**
   * Refrescar lista de aeropuertos
   */
  refreshAirports(): void {
    this.getAirports().subscribe();
  }
}
