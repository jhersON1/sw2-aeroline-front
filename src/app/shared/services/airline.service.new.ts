import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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

  constructor() {}

  /**
   * Obtener aerolínea por alias (para URLs públicas)
   */
  getAirlineByAlias(alias: string): Observable<Airline | null> {
    // Simular búsqueda
    const airline = this.mockAirlines.find(a => a.alias === alias.toLowerCase()) || null;
    
    // TODO: Reemplazar con GraphQL cuando Apollo esté funcionando
    return of(airline).pipe(delay(200));
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
