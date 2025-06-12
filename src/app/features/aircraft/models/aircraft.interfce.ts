// src/app/features/aircraft/models/aircraft.interface.ts

/**
 * Interfaz que representa exactamente la entidad Aircraft del backend
 * Basada en: com.microservice.flightservice.entities.Aircraft
 */
export interface Aircraft {
  /**
   * ID único del avión (UUID generado automáticamente)
   */
  id: string;

  /**
   * ID de la aerolínea propietaria del avión
   */
  airlineId: string;

  /**
   * ID del usuario que gestiona el avión  (opcional)
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
   * Matrícula única del avión
   * - Obligatorio
   * - Máximo 20 caracteres
   * - Formato: LV-ABC, N123AB, etc.
   */
  registration: string;

  /**
   * Capacidad total de asientos del avión
   * - Obligatorio
   * - Mínimo 1, máximo 1000
   */
  seatsTotal: number;

  /**
   * Configuración de asientos (opcional)
   * - Información sobre layout de asientos
   * - Máximo 200 caracteres según InputAircraft
   */
  configuration?: string;

  /**
   * Fecha de creación automática
   */
  createdAt: string; // LocalDateTime del backend

  /**
   * Relaciones (opcional para el frontend)
   * Lista de vuelos asociados al avión
   */
  flights?: Flight[];
}

/**
 * Interfaz básica para Flight (si la necesitas en Aircraft)
 */
export interface Flight {
  id: string;
  code: string;
  status: string;
  departureTime: string;
  arrivalTime: string;
  // Agregar más campos según tu entidad Flight si necesitas
}

