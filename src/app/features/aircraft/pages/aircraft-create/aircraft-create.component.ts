// src/app/features/aircraft/pages/aircraft-create/aircraft-create.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

// Importar servicio e interfaces
import { AircraftService } from '../../service/aircraft.service';
import { AircraftInput } from '../../models/aircraft-input.interface';
import { AIRCRAFT_VALIDATION } from '../../models/aircraft-validation.interface';

@Component({
  selector: 'app-aircraft-create',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './aircraft-create.component.html',
})
export class AircraftCreateComponent implements OnInit {
  // Inyección de dependencias
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private aircraftService = inject(AircraftService);

  // Formulario reactivo
  aircraftForm!: FormGroup;

  // Estados del componente
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  // IDs hardcodeados para mostrar en la UI
  hardcodedIds = this.aircraftService.getHardcodedIds();

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.aircraftForm = this.fb.group({
      model: [
        '',
        [
          Validators.required,
          Validators.maxLength(AIRCRAFT_VALIDATION.MODEL.MAX_LENGTH),
        ],
      ],
      registration: [
        '',
        [
          Validators.required,
          Validators.maxLength(AIRCRAFT_VALIDATION.REGISTRATION.MAX_LENGTH),
          Validators.pattern(AIRCRAFT_VALIDATION.REGISTRATION.PATTERN),
        ],
      ],
      seatsTotal: [
        '',
        [
          Validators.required,
          Validators.min(AIRCRAFT_VALIDATION.SEATS_TOTAL.MIN_VALUE),
          Validators.max(AIRCRAFT_VALIDATION.SEATS_TOTAL.MAX_VALUE),
        ],
      ],
      configuration: [
        '',
        [Validators.maxLength(AIRCRAFT_VALIDATION.CONFIGURATION.MAX_LENGTH)],
      ],
    });

    console.log('📝 Formulario inicializado:', this.aircraftForm);
  }

  // ============================================
  // MANEJO DEL FORMULARIO
  // ============================================

  onSubmit() {
    if (this.aircraftForm.invalid) {
      console.warn('⚠️ Formulario inválido, marcando campos como touched');
      this.markFormGroupTouched();
      return;
    }

    this.submitAircraft();
  }

  private submitAircraft() {
    this.isSubmitting = true;
    this.clearMessages();

    // Preparar datos del formulario
    const formData = this.aircraftForm.value;
    console.log('📤 Enviando datos del avión:', formData);

    // Crear input para el servicio (sin airlineId/userId ya que el servicio los agrega)
    const aircraftInput: Partial<AircraftInput> = {
      model: formData.model.trim(),
      registration: formData.registration.trim().toUpperCase(),
      seatsTotal: parseInt(formData.seatsTotal),
      configuration: formData.configuration?.trim() || undefined,
    };

    console.log('🛩️ Input procesado para crear avión:', aircraftInput);

    // Llamar al servicio
    this.aircraftService.createAircraft(aircraftInput).subscribe({
      next: (createdAircraft) => {
        console.log('✅ Avión creado exitosamente:', createdAircraft);
        this.isSubmitting = false;
        this.showSuccessMessage(
          `Avión ${createdAircraft.model} (${createdAircraft.registration}) registrado exitosamente`
        );

        // Redireccionar después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/admin/aircraft']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Error creando avión:', error);
        this.isSubmitting = false;
        this.handleSubmitError(error);
      },
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.aircraftForm.controls).forEach((key) => {
      const control = this.aircraftForm.get(key);
      control?.markAsTouched();
    });
  }

  // ============================================
  // MANEJO DE EVENTOS
  // ============================================

  onRegistrationInput(event: any) {
    // Convertir automáticamente a mayúsculas
    const value = event.target.value.toUpperCase();
    this.aircraftForm.patchValue({ registration: value });
  }

  // ============================================
  // NAVEGACIÓN
  // ============================================

  goBack() {
    this.router.navigate(['/admin/aircraft']);
  }

  // ============================================
  // MANEJO DE MENSAJES
  // ============================================

  private showSuccessMessage(message: string) {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  private showErrorMessage(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  private clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private handleSubmitError(error: any) {
    let errorMessage = 'Error al registrar el avión';

    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      // Error de GraphQL
      const graphQLError = error.graphQLErrors[0];
      errorMessage = graphQLError.message;

      // Manejar errores específicos del backend
      if (errorMessage.includes('matrícula')) {
        errorMessage = 'Ya existe un avión con esa matrícula';
      } else if (
        errorMessage.includes('validación') ||
        errorMessage.includes('validation')
      ) {
        errorMessage = 'Datos inválidos. Verifica los campos del formulario';
      }
    } else if (error.networkError) {
      // Error de red
      errorMessage = 'Error de conexión. Verifica tu internet';
    } else if (error.message) {
      // Otro tipo de error
      errorMessage = error.message;
    }

    console.error('💥 Error procesado:', errorMessage);
    this.showErrorMessage(errorMessage);
  }

  // ============================================
  // UTILIDADES
  // ============================================

  getFieldError(fieldName: string): string | null {
    const field = this.aircraftForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      const errors = field.errors;
      if (errors) {
        if (errors['required']) {
          return this.getRequiredErrorMessage(fieldName);
        }
        if (errors['maxlength']) {
          return this.getMaxLengthErrorMessage(
            fieldName,
            errors['maxlength'].requiredLength
          );
        }
        if (errors['min']) {
          return `El valor mínimo es ${errors['min'].min}`;
        }
        if (errors['max']) {
          return `El valor máximo es ${errors['max'].max}`;
        }
        if (errors['pattern']) {
          return this.getPatternErrorMessage(fieldName);
        }
      }
    }
    return null;
  }

  private getRequiredErrorMessage(fieldName: string): string {
    switch (fieldName) {
      case 'model':
        return AIRCRAFT_VALIDATION.MODEL.ERROR_MESSAGES.REQUIRED;
      case 'registration':
        return AIRCRAFT_VALIDATION.REGISTRATION.ERROR_MESSAGES.REQUIRED;
      case 'seatsTotal':
        return AIRCRAFT_VALIDATION.SEATS_TOTAL.ERROR_MESSAGES.REQUIRED;
      default:
        return 'Este campo es obligatorio';
    }
  }

  private getMaxLengthErrorMessage(
    fieldName: string,
    maxLength: number
  ): string {
    switch (fieldName) {
      case 'model':
        return AIRCRAFT_VALIDATION.MODEL.ERROR_MESSAGES.MAX_LENGTH;
      case 'registration':
        return AIRCRAFT_VALIDATION.REGISTRATION.ERROR_MESSAGES.MAX_LENGTH;
      case 'configuration':
        return AIRCRAFT_VALIDATION.CONFIGURATION.ERROR_MESSAGES.MAX_LENGTH;
      default:
        return `No puede exceder ${maxLength} caracteres`;
    }
  }

  private getPatternErrorMessage(fieldName: string): string {
    switch (fieldName) {
      case 'registration':
        return AIRCRAFT_VALIDATION.REGISTRATION.ERROR_MESSAGES.INVALID_PATTERN;
      default:
        return 'Formato inválido';
    }
  }

  // ============================================
  // GETTERS PARA EL TEMPLATE
  // ============================================

  get modelControl() {
    return this.aircraftForm.get('model');
  }

  get registrationControl() {
    return this.aircraftForm.get('registration');
  }

  get seatsTotalControl() {
    return this.aircraftForm.get('seatsTotal');
  }

  get configurationControl() {
    return this.aircraftForm.get('configuration');
  }

  // ============================================
  // VALIDACIONES EN TIEMPO REAL
  // ============================================

  isFieldInvalid(fieldName: string): boolean {
    const field = this.aircraftForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.aircraftForm.get(fieldName);
    return !!(field && field.valid && field.touched);
  }

  getFormValidationSummary(): {
    valid: number;
    total: number;
    percentage: number;
  } {
    const controls = Object.keys(this.aircraftForm.controls);
    const validControls = controls.filter((key) => {
      const control = this.aircraftForm.get(key);
      return control?.valid;
    });

    return {
      valid: validControls.length,
      total: controls.length,
      percentage: (validControls.length / controls.length) * 100,
    };
  }
}
