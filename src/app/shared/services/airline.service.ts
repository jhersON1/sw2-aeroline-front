import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { GET_AIRLINE_BY_ALIAS } from '../../graphql/queries/airline.queries';

export interface Airline {
  id: string;
  name: string;
  alias: string;
  country?: string;
  contactEmail?: string;
  phoneNumber?: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AirlineService {

  // Datos mock temporales para pruebas
  private mockAirlines: Airline[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Boliviana de Aviación',
      alias: 'boa',
      country: 'Bolivia',
      contactEmail: 'info@boa.bo',
      phoneNumber: '+591-2-2111000',
      active: true
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Amaszonas',
      alias: 'amaszonas',
      country: 'Bolivia',
      contactEmail: 'contacto@amaszonas.com',
      phoneNumber: '+591-2-2443636',
      active: true
    }
  ];

  constructor(private apollo: Apollo) {}  /**
   * Obtener aerolínea por alias (para URLs públicas)
   */
  getAirlineByAlias(alias: string): Observable<Airline | null> {
    // TODO: Usar GraphQL real cuando airlineByAlias esté disponible
    // Por ahora usar datos mock/hardcodeados que coinciden con la base de datos
    
    // Parsear el alias para extraer solo la parte de la aerolínea
    // Ej: "skyair-boa" → "boa", "skyair-amaszonas" → "amaszonas"
    const parsedAlias = this.parseAirlineAlias(alias);
    
    const airline = this.mockAirlines.find(a => a.alias === parsedAlias.toLowerCase()) || null;
    
    return of(airline).pipe(delay(200));
  }

  /**
   * Parsear alias de aerolínea para extraer solo la parte relevante
   */
  private parseAirlineAlias(fullAlias: string): string {
    // Si el alias tiene formato "skyair-boa", extraer "boa"
    // Si el alias tiene formato "boa", mantener "boa"
    const parts = fullAlias.split('-');
    
    if (parts.length >= 2) {
      // Tomar la última parte después del último guión
      return parts[parts.length - 1];
    }
    
    // Si no hay guión, usar el alias completo
    return fullAlias;
  }

  /**
   * Obtener aerolíneas por usuario (para admin)
   */
  getAirlinesByUser(userId: string): Observable<Airline[]> {
    // Por ahora retorna todas las aerolíneas mock
    // TODO: Filtrar por userId real cuando esté conectado con GraphQL
    
    return of(this.mockAirlines).pipe(delay(200));
  }
}
