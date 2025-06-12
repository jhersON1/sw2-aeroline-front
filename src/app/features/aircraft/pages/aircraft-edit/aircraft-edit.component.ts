// src/app/features/aircraft/pages/aircraft-edit/aircraft-edit.component.ts

import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Location } from '@angular/common';

// Importar servicio e interfaces
import { AircraftService } from '../../service/aircraft.service';
import { AircraftInput } from '../../models/aircraft-input.interface';
import { AIRCRAFT_VALIDATION } from '../../models/aircraft-validation.interface';
import { Aircraft } from '../../models/aircraft.interfce';

@Component({
  selector: 'app-aircraft-edit',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './aircraft-edit.component.html',
})
export class AircraftEditComponent implements OnInit {
  // Inyección de dependencias
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private aircraftService = inject(AircraftService);
  private cdr = inject(ChangeDetectorRef); // ← AGREGAR ESTO

  // Formulario reactivo
  aircraftForm!: FormGroup;

  // Estados del componente
  isLoading = true;
  isSubmitting = false;
  loadError = '';
  successMessage = '';
  errorMessage = '';

  // Datos del avión
  currentAircraft: Aircraft | null = null;
  aircraftId: string | null = null;
  originalFormData: any = null;

  // IDs hardcodeados para mostrar en la UI
  hardcodedIds = this.aircraftService.getHardcodedIds();

  ngOnInit() {
    this.initializeForm();
    this.getAircraftIdFromRoute();
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

    console.log('📝 Formulario de edición inicializado');
  }

  private getAircraftIdFromRoute() {
    console.log('🛤️ Obteniendo ID de la ruta...');

    this.route.paramMap.subscribe((params) => {
      console.log('🛤️ Parámetros de la ruta:', params);
      console.log('🛤️ Todos los parámetros:', params.keys);

      this.aircraftId = params.get('id');
      console.log('🛤️ ID extraído de la ruta:', this.aircraftId);

      if (this.aircraftId) {
        console.log('✅ ID válido encontrado, iniciando carga...');
        this.loadAircraft();
      } else {
        console.error('❌ No se encontró ID del avión en la ruta');
        console.error('❌ URL actual:', this.router.url);
        this.loadError = 'ID del avión no válido en la URL';
        this.isLoading = false;
      }
    });
  }

  loadAircraft() {
    if (!this.aircraftId) {
      console.error('❌ No aircraft ID available');
      this.loadError = 'ID del avión no válido';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.loadError = '';

    console.log('📡 Iniciando carga de avión con ID:', this.aircraftId);
    console.log('📡 Estado inicial - isLoading:', this.isLoading);

    this.aircraftService.getAircraftById(this.aircraftId).subscribe({
      next: (aircraft) => {
        console.log('✅ Avión cargado exitosamente en componente:', aircraft);
        console.log('📝 Tipo de aircraft:', typeof aircraft);
        console.log('📝 Propiedades del aircraft:', Object.keys(aircraft));

        this.currentAircraft = aircraft;
        this.populateForm(aircraft);
        this.isLoading = false;

        // ← FORZAR DETECCIÓN DE CAMBIOS
        this.cdr.detectChanges();

        console.log('📝 Estado final - isLoading:', this.isLoading);
        console.log('📝 currentAircraft asignado:', this.currentAircraft);
      },
      error: (error) => {
        console.error('❌ Error cargando avión en componente:', error);
        console.error('❌ Tipo de error:', typeof error);
        console.error('❌ Error stack:', error.stack);

        this.isLoading = false;
        this.handleLoadError(error);

        // ← FORZAR DETECCIÓN DE CAMBIOS EN ERROR TAMBIÉN
        this.cdr.detectChanges();

        console.log('📝 Estado final error - isLoading:', this.isLoading);
        console.log('📝 loadError:', this.loadError);
      },
      complete: () => {
        console.log('🏁 Observable completado');
      },
    });

    // Agregar timeout de seguridad
    setTimeout(() => {
      if (this.isLoading) {
        console.warn('⏰ Timeout: La carga está tomando más de 10 segundos');
        console.warn('⏰ Estado actual:', {
          isLoading: this.isLoading,
          aircraftId: this.aircraftId,
          currentAircraft: this.currentAircraft,
          loadError: this.loadError,
        });
      }
    }, 10000);
  }

  private populateForm(aircraft: Aircraft) {
    const formData = {
      model: aircraft.model,
      registration: aircraft.registration,
      seatsTotal: aircraft.seatsTotal,
      configuration: aircraft.configuration || '',
    };

    this.aircraftForm.patchValue(formData);

    // Guardar datos originales para detectar cambios
    this.originalFormData = { ...formData };

    console.log('📝 Formulario poblado con datos:', formData);
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

    if (!this.hasChanges()) {
      console.warn('⚠️ No hay cambios para guardar');
      this.showErrorMessage('No se detectaron cambios para guardar');
      return;
    }

    this.submitUpdate();
  }

  private submitUpdate() {
    if (!this.aircraftId) {
      this.showErrorMessage('Error: ID del avión no válido');
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    // Preparar datos del formulario
    const formData = this.aircraftForm.value;
    console.log('📤 Enviando actualización del avión:', formData);

    // Crear input para el servicio
    const aircraftInput: Partial<AircraftInput> = {
      model: formData.model.trim(),
      registration: formData.registration.trim().toUpperCase(),
      seatsTotal: parseInt(formData.seatsTotal),
      configuration: formData.configuration?.trim() || undefined,
      // airlineId se mantiene del avión original
      airlineId: this.currentAircraft?.airlineId,
    };

    console.log('🛩️ Input procesado para actualizar avión:', aircraftInput);

    // Llamar al servicio
    this.aircraftService
      .updateAircraft(this.aircraftId, aircraftInput)
      .subscribe({
        next: (updatedAircraft) => {
          console.log('✅ Avión actualizado exitosamente:', updatedAircraft);
          this.isSubmitting = false;
          this.currentAircraft = updatedAircraft;

          // Actualizar datos originales
          this.originalFormData = { ...this.aircraftForm.value };

          this.showSuccessMessage(
            `Avión ${updatedAircraft.model} (${updatedAircraft.registration}) actualizado exitosamente`
          );

          // Redireccionar después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/admin/aircraft']);
          }, 2000);
        },
        error: (error) => {
          console.error('❌ Error actualizando avión:', error);
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
  // DETECCIÓN DE CAMBIOS
  // ============================================

  hasChanges(): boolean {
    if (!this.originalFormData) return false;

    const currentData = this.aircraftForm.value;

    return (
      currentData.model !== this.originalFormData.model ||
      currentData.registration !== this.originalFormData.registration ||
      parseInt(currentData.seatsTotal) !== this.originalFormData.seatsTotal ||
      (currentData.configuration || '') !==
        (this.originalFormData.configuration || '')
    );
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
    if (this.hasChanges()) {
      const confirmLeave = confirm(
        'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?'
      );
      if (!confirmLeave) {
        return;
      }
    }

    this.location.back();
  }

  // ============================================
  // MANEJO DE ERRORES
  // ============================================

  private handleLoadError(error: any) {
    let errorMessage = 'Error al cargar el avión';

    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      const graphQLError = error.graphQLErrors[0];
      errorMessage = graphQLError.message;

      if (
        errorMessage.includes('not found') ||
        errorMessage.includes('no encontrado')
      ) {
        errorMessage = 'El avión solicitado no existe';
      }
    } else if (error.networkError) {
      errorMessage = 'Error de conexión. Verifica tu internet';
    } else if (error.message) {
      errorMessage = error.message;
    }

    this.loadError = errorMessage;
    console.error('💥 Error de carga procesado:', errorMessage);
  }

  private handleSubmitError(error: any) {
    let errorMessage = 'Error al actualizar el avión';

    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      const graphQLError = error.graphQLErrors[0];
      errorMessage = graphQLError.message;

      if (errorMessage.includes('matrícula')) {
        errorMessage = 'Ya existe otro avión con esa matrícula';
      } else if (
        errorMessage.includes('validación') ||
        errorMessage.includes('validation')
      ) {
        errorMessage = 'Datos inválidos. Verifica los campos del formulario';
      }
    } else if (error.networkError) {
      errorMessage = 'Error de conexión. Verifica tu internet';
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('💥 Error de actualización procesado:', errorMessage);
    this.showErrorMessage(errorMessage);
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

  // ============================================
  // UTILIDADES
  // ============================================

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

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

  // ============================================
  // MÉTODOS PARA DEBUGGING
  // ============================================

  getCurrentFormState(): any {
    return {
      formValue: this.aircraftForm.value,
      originalData: this.originalFormData,
      hasChanges: this.hasChanges(),
      isValid: this.aircraftForm.valid,
      currentAircraft: this.currentAircraft,
    };
  }
}
