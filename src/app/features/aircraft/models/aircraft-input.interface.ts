// ============================================
// src/app/features/aircraft/models/aircraft-input.interface.ts

/**
 * Interfaz que representa exactamente el InputAircraft del backend
 * Basada en: com.microservice.flightservice.graphql.InputAircraft
 */
export interface AircraftInput {
  /**
   * ID de la aerolínea
   * - Obligatorio
   * - No puede estar vacío
   */
  airlineId: string;

  /**
   * ID del usuario (opcional)
   * - Puede ser null
   */
  userId?: string;

  /**
   * Modelo del avión
   * - Obligatorio
   * - Máximo 100 caracteres
   * - Ejemplo: "Boeing 737-800", "Airbus A320"
   */
  model: string;

  /**
   * Matrícula/registro del avión
   * - Obligatorio
   * - Máximo 20 caracteres
   * - Formato validado: ^[A-Z]{1,2}-[A-Z0-9]{3,6}$
   * - Se convierte automáticamente a mayúsculas
   */
  registration: string;

  /**
   * Total de asientos
   * - Obligatorio
   * - Mínimo 1 asiento
   * - Máximo 1000 asientos (según servicio)
   */
  seatsTotal: number;

  /**
   * Configuración de asientos (opcional)
   * - Máximo 200 caracteres
   */
  configuration?: string;
}
