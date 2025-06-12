// src/app/features/aircraft/service/aircraft.service.ts

import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

// Importar interfaces
import { Aircraft } from '../models/aircraft.interfce';

import { AircraftInput } from '../models/aircraft-input.interface';

// Importar queries y mutations
import {
  GET_AIRCRAFT_BY_ID,
  GET_AIRCRAFT_BY_USER,
} from '../../../graphql/queries/aircraft.queries';
import {
  CREATE_AIRCRAFT,
  UPDATE_AIRCRAFT,
  DELETE_AIRCRAFT,
} from '../../../graphql/mutations/aircraft.mutations';

@Injectable({
  providedIn: 'root',
})
export class AircraftService {
  // ============================================
  // CONSTANTES HARDCODEADAS (hasta implementar tokens)
  // ============================================
  private readonly HARDCODED_AIRLINE_ID = 'airline-123-abc-def'; // ID temporal de aerolínea
  private readonly HARDCODED_USER_ID = 'user-456-ghi-jkl'; // ID temporal de usuario

  // Estado reactivo para la lista de aviones
  private aircraftSubject = new BehaviorSubject<Aircraft[]>([]);
  public aircraft$ = this.aircraftSubject.asObservable();

  // Estado de carga
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private apollo: Apollo) {
    console.log('🛩️ AircraftService inicializado con Apollo');
  }

  /**
   * Obtener aviones por usuario
   * Usa el userId hardcodeado hasta implementar autenticación
   */
  getAircraftByUser(userId?: string): Observable<Aircraft[]> {
    const targetUserId = userId || this.HARDCODED_USER_ID;
    console.log('📡 Llamando a aircraftByUserId con userId:', targetUserId);
    this.loadingSubject.next(true);

    return this.apollo
      .watchQuery<{ aircraftByUserId: Aircraft[] }>({
        query: GET_AIRCRAFT_BY_USER,
        variables: { userId: targetUserId },
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      })
      .valueChanges.pipe(
        tap((result) => {
          console.log(
            '📨 Respuesta cruda de Apollo (aircraftByUserId):',
            result
          );
        }),
        map((result) => {
          if (result.errors) {
            console.error('⚠️ GraphQL errors:', result.errors);
          }

          const aircraft = result.data?.aircraftByUserId || [];
          console.log('✅ Aviones procesados:', aircraft);

          this.aircraftSubject.next(aircraft);
          this.loadingSubject.next(result.loading);
          return aircraft;
        }),
        catchError((error) => {
          console.error(
            '❌ Error completo en Apollo (aircraftByUserId):',
            error
          );
          console.error('❌ Error stack:', error.stack);
          console.error('❌ Network error:', error.networkError);
          console.error('❌ GraphQL errors:', error.graphQLErrors);

          this.loadingSubject.next(false);
          this.aircraftSubject.next([]);

          // Retornar array vacío en lugar de propagar el error
          return of([]);
        })
      );
  }

  /**
   * Obtener avión por ID
   */
  getAircraftById(id: string): Observable<Aircraft> {
    console.log('📡 Obteniendo avión por ID:', id);

    return this.apollo
      .query<{ aircraft: Aircraft }>({
        query: GET_AIRCRAFT_BY_ID,
        variables: { id },
        errorPolicy: 'all',
      })
      .pipe(
        tap((result) => {
          console.log('📨 Respuesta avión por ID:', result);
        }),
        map((result) => {
          if (result.errors) {
            console.error(
              '⚠️ GraphQL errors en getAircraftById:',
              result.errors
            );
          }
          return result.data.aircraft;
        }),
        catchError((error) => {
          console.error('❌ Error fetching aircraft by ID:', error);
          throw error;
        })
      );
  }

  /**
   * Crear nuevo avión
   * Automáticamente asigna airlineId y userId hardcodeados
   */
  createAircraft(inputData: Partial<AircraftInput>): Observable<Aircraft> {
    // Combinar datos del input con IDs hardcodeados
    const input: AircraftInput = {
      airlineId: this.HARDCODED_AIRLINE_ID,
      userId: this.HARDCODED_USER_ID,
      ...inputData,
    } as AircraftInput;

    console.log('🆕 Creando avión con datos completos:', input);
    this.loadingSubject.next(true);

    return this.apollo
      .mutate<{ createAircraft: Aircraft }>({
        mutation: CREATE_AIRCRAFT,
        variables: { input },
        errorPolicy: 'all',
        // Actualizar cache después de crear
        update: (cache, { data }) => {
          if (data?.createAircraft) {
            // Actualizar la query de aviones por usuario
            try {
              const existingData = cache.readQuery<{
                aircraftByUserId: Aircraft[];
              }>({
                query: GET_AIRCRAFT_BY_USER,
                variables: { userId: this.HARDCODED_USER_ID },
              });

              if (existingData) {
                cache.writeQuery({
                  query: GET_AIRCRAFT_BY_USER,
                  variables: { userId: this.HARDCODED_USER_ID },
                  data: {
                    aircraftByUserId: [
                      ...existingData.aircraftByUserId,
                      data.createAircraft,
                    ],
                  },
                });
              }
            } catch (e) {
              console.warn('No se pudo actualizar cache al crear:', e);
            }
          }
        },
      })
      .pipe(
        map((result) => {
          console.log('✅ Mutation result (createAircraft):', result);
          this.loadingSubject.next(false);

          if (result.errors) {
            console.error('⚠️ GraphQL errors en mutation:', result.errors);
          }

          const aircraft = result.data!.createAircraft;
          console.log('✅ Avión creado exitosamente:', aircraft);

          // Actualizar estado local inmediatamente
          const currentAircraft = this.aircraftSubject.value;
          this.aircraftSubject.next([...currentAircraft, aircraft]);

          return aircraft;
        }),
        catchError((error) => {
          console.error('❌ Error creando avión:', error);
          console.error('❌ Network error:', error.networkError);
          console.error('❌ GraphQL errors:', error.graphQLErrors);
          this.loadingSubject.next(false);
          throw error;
        })
      );
  }

  /**
   * Actualizar avión
   * Mantiene airlineId y userId originales o usa los hardcodeados
   */
  updateAircraft(
    id: string,
    inputData: Partial<AircraftInput>
  ): Observable<Aircraft> {
    // Asegurar que tenga los IDs necesarios
    const input: AircraftInput = {
      airlineId: inputData.airlineId || this.HARDCODED_AIRLINE_ID,
      userId: inputData.userId || this.HARDCODED_USER_ID,
      ...inputData,
    } as AircraftInput;

    console.log('🔄 Actualizando avión:', id, 'con datos:', input);
    this.loadingSubject.next(true);

    return this.apollo
      .mutate<{ updateAircraft: Aircraft }>({
        mutation: UPDATE_AIRCRAFT,
        variables: { id, input },
        errorPolicy: 'all',
      })
      .pipe(
        map((result) => {
          this.loadingSubject.next(false);
          const updatedAircraft = result.data!.updateAircraft;

          if (result.errors) {
            console.error(
              '⚠️ GraphQL errors en updateAircraft:',
              result.errors
            );
          }

          console.log('✅ Avión actualizado exitosamente:', updatedAircraft);

          // Actualizar estado local
          const currentAircraft = this.aircraftSubject.value;
          const updatedList = currentAircraft.map((aircraft) =>
            aircraft.id === id ? updatedAircraft : aircraft
          );
          this.aircraftSubject.next(updatedList);

          return updatedAircraft;
        }),
        catchError((error) => {
          console.error('❌ Error updating aircraft:', error);
          this.loadingSubject.next(false);
          throw error;
        })
      );
  }

  /**
   * Eliminar avión
   */
  deleteAircraft(id: string): Observable<boolean> {
    console.log('🗑️ Eliminando avión:', id);
    this.loadingSubject.next(true);

    return this.apollo
      .mutate<{ deleteAircraft: boolean }>({
        mutation: DELETE_AIRCRAFT,
        variables: { id },
        errorPolicy: 'all',
        update: (cache) => {
          try {
            // Actualizar cache de la query por usuario
            const existingData = cache.readQuery<{
              aircraftByUserId: Aircraft[];
            }>({
              query: GET_AIRCRAFT_BY_USER,
              variables: { userId: this.HARDCODED_USER_ID },
            });

            if (existingData) {
              cache.writeQuery({
                query: GET_AIRCRAFT_BY_USER,
                variables: { userId: this.HARDCODED_USER_ID },
                data: {
                  aircraftByUserId: existingData.aircraftByUserId.filter(
                    (aircraft) => aircraft.id !== id
                  ),
                },
              });
            }
          } catch (e) {
            console.warn('No se pudo actualizar cache al eliminar:', e);
          }

          // Actualizar estado local
          const currentAircraft = this.aircraftSubject.value;
          this.aircraftSubject.next(
            currentAircraft.filter((aircraft) => aircraft.id !== id)
          );
        },
      })
      .pipe(
        map((result) => {
          this.loadingSubject.next(false);
          console.log('✅ Avión eliminado exitosamente');
          return result.data!.deleteAircraft;
        }),
        catchError((error) => {
          console.error('❌ Error deleting aircraft:', error);
          this.loadingSubject.next(false);
          throw error;
        })
      );
  }

  /**
   * Refrescar lista de aviones del usuario actual
   */
  refreshAircraft(): void {
    console.log('🔄 Refrescando lista de aviones...');
    this.getAircraftByUser().subscribe();
  }

  /**
   * Obtener IDs hardcodeados (útil para otros componentes)
   */
  getHardcodedIds() {
    return {
      airlineId: this.HARDCODED_AIRLINE_ID,
      userId: this.HARDCODED_USER_ID,
    };
  }

  /**
   * Método de conveniencia para cargar aviones del usuario actual
   */
  loadUserAircraft(): Observable<Aircraft[]> {
    return this.getAircraftByUser(this.HARDCODED_USER_ID);
  }
}
