import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface KPIRequest {
  start_date?: string;
  end_date?: string;
  tail_num?: string;
  origin?: string;
  dest?: string;
}

export interface KPIResponse {
  cancellation_rate: number;
  avg_dep_delay_cancelled: number;
  weather_cancellation_rate: number;
}

export interface DateRange {
  start: string;
  end: string;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class KPIService {
  private readonly API_BASE_URL = 'https://sw2-servicekpi-dygvh5ftage2ecdd.brazilsouth-01.azurewebsites.net';
  private readonly KPI_ENDPOINT = '/kpis';

  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}
  /**
   * Fetch KPIs from the API
   * @param filters Optional filters for the KPI request
   * @returns Observable with KPI data
   */
  getKPIs(filters: KPIRequest = {}): Observable<KPIResponse> {
    console.log('🔄 [KPI Service] Iniciando llamada a la API');
    console.log('🔄 [KPI Service] URL:', `${this.API_BASE_URL}${this.KPI_ENDPOINT}`);
    console.log('🔄 [KPI Service] Filtros recibidos:', filters);

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const body = this.buildRequestBody(filters);
    console.log('📤 [KPI Service] Body a enviar:', body);

    // Para endpoint público, no necesitamos headers especiales
    const requestOptions = {
      // Sin headers personalizados para endpoint público
    };

    console.log('🌐 [KPI Service] Realizando POST request...');

    return this.http.post<KPIResponse>(`${this.API_BASE_URL}${this.KPI_ENDPOINT}`, body, requestOptions)
      .pipe(
        map(response => {
          console.log('✅ [KPI Service] Respuesta exitosa recibida:', response);
          return this.processKPIResponse(response);
        }),
        catchError(error => {
          console.error('❌ [KPI Service] Error en la llamada:', error);
          console.error('❌ [KPI Service] Error status:', error.status);
          console.error('❌ [KPI Service] Error message:', error.message);
          console.error('❌ [KPI Service] Error completo:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Get predefined date ranges for quick filters
   */
  getDateRanges(): DateRange[] {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return [
      {
        start: '2022-06-01',
        end: '2022-06-30',
        label: 'Todo Junio 2022'
      },
      {
        start: '2022-06-01',
        end: '2022-06-07',
        label: 'Primera Semana'
      },
      {
        start: '2022-06-08',
        end: '2022-06-14',
        label: 'Segunda Semana'
      },
      {
        start: '2022-06-15',
        end: '2022-06-21',
        label: 'Tercera Semana'
      },
      {
        start: '2022-06-22',
        end: '2022-06-30',
        label: 'Cuarta Semana'
      }
    ];
  }

  /**
   * Calculate percentage change between two values
   */
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Get comparison data for trend analysis
   */
  getComparisonData(currentFilters: KPIRequest): Observable<{ current: KPIResponse; previous: KPIResponse }> {
    const previousFilters = this.getPreviousWeekFilters(currentFilters);

    return new Observable(observer => {
      Promise.all([
        this.getKPIs(currentFilters).toPromise(),
        this.getKPIs(previousFilters).toPromise()
      ]).then(([current, previous]) => {
        observer.next({
          current: current!,
          previous: previous!
        });
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }
  private buildRequestBody(filters: KPIRequest): KPIRequest {
    console.log('🏗️ [KPI Service] Construyendo body del request...');
    console.log('🏗️ [KPI Service] Filtros de entrada:', filters);

    const body: KPIRequest = {};

    // Only include non-empty values
    if (filters.start_date && filters.start_date.trim()) {
      body.start_date = filters.start_date;
      console.log('📅 [KPI Service] Agregando start_date:', body.start_date);
    }
    if (filters.end_date && filters.end_date.trim()) {
      body.end_date = filters.end_date;
      console.log('📅 [KPI Service] Agregando end_date:', body.end_date);
    }
    if (filters.tail_num && filters.tail_num.trim()) {
      body.tail_num = filters.tail_num;
      console.log('✈️ [KPI Service] Agregando tail_num:', body.tail_num);
    }
    if (filters.origin && filters.origin.trim()) {
      body.origin = filters.origin;
      console.log('🛫 [KPI Service] Agregando origin:', body.origin);
    }
    if (filters.dest && filters.dest.trim()) {
      body.dest = filters.dest;
      console.log('🛬 [KPI Service] Agregando dest:', body.dest);
    }    console.log('✅ [KPI Service] Body final construido:', body);
    return body;
  }

  private processKPIResponse(response: KPIResponse): KPIResponse {
    console.log('🔄 [KPI Service] Procesando respuesta de la API...');
    console.log('📊 [KPI Service] Datos recibidos:', response);

    this.loadingSubject.next(false);

    // Ensure all values are properly formatted
    const processedResponse = {
      cancellation_rate: Math.round(response.cancellation_rate * 100) / 100,
      avg_dep_delay_cancelled: Math.round(response.avg_dep_delay_cancelled * 100) / 100,
      weather_cancellation_rate: Math.round(response.weather_cancellation_rate * 100) / 100
    };

    console.log('✅ [KPI Service] Datos procesados:', processedResponse);
    return processedResponse;
  }
  private handleError(error: any): Observable<never> {
    console.error('💥 [KPI Service] Entrando en handleError...');
    console.error('💥 [KPI Service] Tipo de error:', typeof error);
    console.error('💥 [KPI Service] Error completo:', error);
    console.error('💥 [KPI Service] Error status:', error.status);
    console.error('💥 [KPI Service] Error statusText:', error.statusText);
    console.error('💥 [KPI Service] Error url:', error.url);

    this.loadingSubject.next(false);

    let errorMessage = 'Error al cargar los KPIs';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('🔴 [KPI Service] Error del lado del cliente');
      errorMessage = `Error de red: ${error.error.message}`;
    } else {
      // Server-side error
      console.error('🔴 [KPI Service] Error del lado del servidor');
      console.error('🔴 [KPI Service] HTTP Error Code:', error.status);

      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar al servidor. Verifique su conexión a internet y que la URL del API sea correcta.';
          console.error('🔴 [KPI Service] Error 0 - Posibles causas: CORS, red, servidor caído');
          break;
        case 400:
          errorMessage = 'Parámetros inválidos en la solicitud.';
          console.error('🔴 [KPI Service] Error 400 - Bad Request');
          break;
        case 404:
          errorMessage = 'Servicio no encontrado. Verifique la URL del endpoint.';
          console.error('🔴 [KPI Service] Error 404 - Endpoint no encontrado');
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          console.error('🔴 [KPI Service] Error 500 - Error interno del servidor');
          break;
        default:
          errorMessage = `Error del servidor: ${error.status} - ${error.statusText}`;
          console.error('🔴 [KPI Service] Error no manejado:', error.status);
      }
    }

    console.error('💥 [KPI Service] Mensaje de error final:', errorMessage);
    this.errorSubject.next(errorMessage);
    return throwError(errorMessage);
  }

  private getPreviousWeekFilters(filters: KPIRequest): KPIRequest {
    if (!filters.start_date || !filters.end_date) {
      // Return previous week of June 2022 if no dates provided
      return {
        start_date: '2022-06-01',
        end_date: '2022-06-07',
        ...filters
      };
    }

    const startDate = new Date(filters.start_date);
    const endDate = new Date(filters.end_date);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - daysDiff - 1);

    const prevEndDate = new Date(endDate);
    prevEndDate.setDate(prevEndDate.getDate() - daysDiff - 1);

    return {
      ...filters,
      start_date: prevStartDate.toISOString().split('T')[0],
      end_date: prevEndDate.toISOString().split('T')[0]
    };
  }

  /**
   * Clear current error state
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Export KPI data as JSON (for future CSV/PDF export functionality)
   * TODO: Implement actual file download when needed
   */
  exportKPIData(data: KPIResponse, filters: KPIRequest): void {
    const exportData = {
      timestamp: new Date().toISOString(),
      filters: filters,
      kpis: data
    };

    console.log('Export data:', exportData);
    // TODO: Implement actual export functionality
    // - CSV export using a library like papaparse
    // - PDF export using jsPDF
    // - Excel export using xlsx library
  }
}
