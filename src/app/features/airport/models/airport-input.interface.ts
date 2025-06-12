// src/app/features/airport/models/airport-input.interface.ts

/**
 * Interfaz que representa exactamente el InputAirport del backend
 * Basada en: com.microservice.flightservice.graphql.InputAirport
 */
export interface AirportInput {
  /**
   * Código IATA del aeropuerto
   * - Obligatorio
   * - Exactamente 3 caracteres
   * - Solo letras mayúsculas (A-Z)
   * - Ejemplo: "EZE", "MAD", "JFK"
   */
  code: string;

  /**
   * Nombre del aeropuerto
   * - Obligatorio
   * - Máximo 200 caracteres
   */
  name: string;

  /**
   * Ciudad donde se encuentra el aeropuerto
   * - Obligatorio
   * - Máximo 100 caracteres
   */
  city: string;

  /**
   * País donde se encuentra el aeropuerto
   * - Obligatorio
   * - Máximo 100 caracteres
   */
  country: string;
}
