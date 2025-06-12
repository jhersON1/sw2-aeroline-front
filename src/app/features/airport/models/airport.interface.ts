// src/app/features/airport/models/airport.interface.ts
export interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  // Relaciones (opcional para el frontend)
  departingFlights?: Flight[];
  arrivingFlights?: Flight[];
}

// Interfaz básica para Flight (si la necesitas)
export interface Flight {
  id: string;
  // Agregar campos según tu entidad Flight
}

// src/app/features/airport/models/airport-input.interface.ts
export interface AirportInput {
  code: string;
  name: string;
  city: string;
  country: string;
}

// Para formularios con validaciones
export interface AirportFormData {
  code: string;
  name: string;
  city: string;
  country: string;
}

// Para respuestas del servidor
export interface AirportResponse {
  success: boolean;
  message: string;
  data?: Airport;
}

// Para listas de aeropuertos
export interface AirportsListResponse {
  success: boolean;
  message: string;
  data?: Airport[];
  total?: number;
}
