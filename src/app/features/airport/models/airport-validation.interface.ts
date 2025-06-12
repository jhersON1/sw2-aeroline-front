// src/app/features/airport/models/airport-validation.interface.ts

// Constantes de validación basadas en tu backend
export const AIRPORT_VALIDATION = {
  CODE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 3,
    PATTERN: /^[A-Z]{3}$/,
    ERROR_MESSAGES: {
      REQUIRED: 'El código IATA del aeropuerto es obligatorio',
      INVALID_LENGTH: 'El código IATA debe tener exactamente 3 caracteres',
      INVALID_PATTERN:
        'El código IATA debe contener solo 3 letras mayúsculas (ej: EZE, MAD, JFK)',
    },
  },
  NAME: {
    MAX_LENGTH: 200,
    ERROR_MESSAGES: {
      REQUIRED: 'El nombre del aeropuerto es obligatorio',
      MAX_LENGTH: 'El nombre no puede exceder 200 caracteres',
    },
  },
  CITY: {
    MAX_LENGTH: 100,
    ERROR_MESSAGES: {
      REQUIRED: 'La ciudad del aeropuerto es obligatoria',
      MAX_LENGTH: 'La ciudad no puede exceder 100 caracteres',
    },
  },
  COUNTRY: {
    MAX_LENGTH: 100,
    ERROR_MESSAGES: {
      REQUIRED: 'El país del aeropuerto es obligatorio',
      MAX_LENGTH: 'El país no puede exceder 100 caracteres',
    },
  },
} as const;

// Tipos para errores de validación
export interface ValidationError {
  field: keyof AirportInput;
  message: string;
}

export interface FormValidationState {
  isValid: boolean;
  errors: ValidationError[];
}

// Importar AirportInput
import { AirportInput } from './airport-input.interface';
