// src/app/features/aircraft/models/aircraft-validation.interface.ts

import { AircraftInput } from './aircraft-input.interface';
import { Aircraft } from './aircraft.interfce';

// Constantes de validación basadas en tu backend
export const AIRCRAFT_VALIDATION = {
  AIRLINE_ID: {
    ERROR_MESSAGES: {
      REQUIRED: 'El ID de la aerolínea es obligatorio',
    },
  },
  MODEL: {
    MAX_LENGTH: 100,
    ERROR_MESSAGES: {
      REQUIRED: 'El modelo del avión es obligatorio',
      MAX_LENGTH: 'El modelo no puede exceder 100 caracteres',
    },
  },
  REGISTRATION: {
    MAX_LENGTH: 20,
    PATTERN: /^[A-Z]{1,2}-[A-Z0-9]{3,6}$/,
    ERROR_MESSAGES: {
      REQUIRED: 'El registro del avión es obligatorio',
      MAX_LENGTH: 'El registro no puede exceder 20 caracteres',
      INVALID_PATTERN:
        'Formato de matrícula inválido. Debe ser como LV-ABC o N123AB',
    },
  },
  SEATS_TOTAL: {
    MIN_VALUE: 1,
    MAX_VALUE: 1000,
    ERROR_MESSAGES: {
      REQUIRED: 'El total de asientos es obligatorio',
      MIN_VALUE: 'El avión debe tener al menos 1 asiento',
      MAX_VALUE: 'El número de asientos no puede exceder 1000',
    },
  },
  CONFIGURATION: {
    MAX_LENGTH: 200,
    ERROR_MESSAGES: {
      MAX_LENGTH: 'La configuración no puede exceder 200 caracteres',
    },
  },
} as const;

// Tipos para errores de validación
export interface ValidationError {
  field: keyof AircraftInput;
  message: string;
}

export interface FormValidationState {
  isValid: boolean;
  errors: ValidationError[];
}

// Para formularios con validaciones
export interface AircraftFormData {
  airlineId: string;
  userId?: string;
  model: string;
  registration: string;
  seatsTotal: number;
  configuration?: string;
}

// Para respuestas del servidor
export interface AircraftResponse {
  success: boolean;
  message: string;
  data?: Aircraft;
}

// Para listas de aviones
export interface AircraftListResponse {
  success: boolean;
  message: string;
  data?: Aircraft[];
  total?: number;
}
