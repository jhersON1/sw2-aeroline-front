import { AIRPORT_VALIDATION } from './../../models/airport-validation.interface';
import { AirportService } from './../../service/airport.service';
// src/app/features/airport/pages/airport-create/airport-create.component.ts

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

// Importar interfaces y servicio
import { AirportInput } from '../../models/airport-input.interface';

@Component({
  selector: 'app-airport-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './airport-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AirportCreateComponent implements OnInit {
  airportForm!: FormGroup;

  // Usar signals para reactividad
  isSubmitting = signal(false);
  showSuccessMessage = signal(false);
  errorMessage = signal('');

  // Constantes de validación
  readonly validation = AIRPORT_VALIDATION;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private airportService: AirportService // ← AGREGAR
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.airportForm = this.fb.group({
      code: [
        '',
        [
          Validators.required,
          Validators.minLength(this.validation.CODE.MIN_LENGTH),
          Validators.maxLength(this.validation.CODE.MAX_LENGTH),
          Validators.pattern(this.validation.CODE.PATTERN),
        ],
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(this.validation.NAME.MAX_LENGTH),
        ],
      ],
      city: [
        '',
        [
          Validators.required,
          Validators.maxLength(this.validation.CITY.MAX_LENGTH),
        ],
      ],
      country: [
        '',
        [
          Validators.required,
          Validators.maxLength(this.validation.COUNTRY.MAX_LENGTH),
        ],
      ],
    });
  }

  // Getters para acceso fácil a los controles del formulario
  get code() {
    return this.airportForm.get('code');
  }
  get name() {
    return this.airportForm.get('name');
  }
  get city() {
    return this.airportForm.get('city');
  }
  get country() {
    return this.airportForm.get('country');
  }

  // Métodos para obtener errores específicos
  getCodeError(): string {
    if (this.code?.hasError('required')) {
      return this.validation.CODE.ERROR_MESSAGES.REQUIRED;
    }
    if (this.code?.hasError('minlength') || this.code?.hasError('maxlength')) {
      return this.validation.CODE.ERROR_MESSAGES.INVALID_LENGTH;
    }
    if (this.code?.hasError('pattern')) {
      return this.validation.CODE.ERROR_MESSAGES.INVALID_PATTERN;
    }
    return '';
  }

  getNameError(): string {
    if (this.name?.hasError('required')) {
      return this.validation.NAME.ERROR_MESSAGES.REQUIRED;
    }
    if (this.name?.hasError('maxlength')) {
      return this.validation.NAME.ERROR_MESSAGES.MAX_LENGTH;
    }
    return '';
  }

  getCityError(): string {
    if (this.city?.hasError('required')) {
      return this.validation.CITY.ERROR_MESSAGES.REQUIRED;
    }
    if (this.city?.hasError('maxlength')) {
      return this.validation.CITY.ERROR_MESSAGES.MAX_LENGTH;
    }
    return '';
  }

  getCountryError(): string {
    if (this.country?.hasError('required')) {
      return this.validation.COUNTRY.ERROR_MESSAGES.REQUIRED;
    }
    if (this.country?.hasError('maxlength')) {
      return this.validation.COUNTRY.ERROR_MESSAGES.MAX_LENGTH;
    }
    return '';
  }

  // Transformar código a mayúsculas en tiempo real
  onCodeInput(event: any) {
    const value = event.target.value.toUpperCase();
    this.code?.setValue(value);
  }

  onSubmit() {
    if (this.airportForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set('');

      const airportData: AirportInput = {
        code: this.code?.value,
        name: this.name?.value,
        city: this.city?.value,
        country: this.country?.value,
      };

      console.log('🚀 Enviando datos del aeropuerto:', airportData);

      // USAR EL SERVICIO APOLLO
      this.airportService.createAirport(airportData).subscribe({
        next: (createdAirport) => {
          console.log('✅ Aeropuerto creado exitosamente:', createdAirport);
          this.isSubmitting.set(false);
          this.showSuccessMessage.set(true);

          // Navegar de vuelta al dashboard después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/admin/airports']);
          }, 2000);
        },
        error: (error) => {
          console.error('❌ Error creando aeropuerto:', error);
          this.isSubmitting.set(false);
          this.errorMessage.set(
            'Error al crear el aeropuerto. Por favor, intenta de nuevo.'
          );
        },
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      this.airportForm.markAllAsTouched();
      this.errorMessage.set('Por favor, corrige los errores en el formulario.');
    }
  }

  onCancel() {
    this.router.navigate(['/admin/airports']);
  }

  // Método para limpiar el formulario
  onReset() {
    this.airportForm.reset();
    this.errorMessage.set('');
    this.showSuccessMessage.set(false);
  }
}
