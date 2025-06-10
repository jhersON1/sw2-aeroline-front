import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService, SubscriptionRequest } from '../../../shared/services/auth.service';

interface AirlineForm {
  airline_name: string;
  alias: string;
  country: string;
  contact_email: string;
  phone_number: string;
}

interface AdminForm {
  admin_name: string;
  admin_email: string;
  admin_password: string;
  admin_phone?: string;
}

interface PaymentForm {
  card_number: string;
  cardholder_name: string;
  expiry_date: string;
  cvv: string;
  plan: 'basic' | 'premium' | 'enterprise';
}

@Component({
  selector: 'app-subscription',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public authService = inject(AuthService); // Público para usar en template

  currentStep = signal<number>(1);
  isSubmitting = signal<boolean>(false);
  submissionSuccess = signal<boolean>(false);
  errorMessage = signal<string>('');

  airlineFormValid = signal<boolean>(false);
  adminFormValid = signal<boolean>(false);
  paymentFormValid = signal<boolean>(false);

  airlineForm: FormGroup = this.fb.group({
    airline_name: ['', [Validators.required]],
    alias: ['', [Validators.required]],
    country: ['', [Validators.required]],
    contact_email: ['', [Validators.required, Validators.email]],
    phone_number: ['', [Validators.required]]
  });

  adminForm: FormGroup = this.fb.group({
    admin_name: ['', [Validators.required]],
    admin_email: ['', [Validators.required, Validators.email]],
    admin_password: ['', [Validators.required, Validators.minLength(8)]],
    admin_phone: ['']
  });

  paymentForm: FormGroup = this.fb.group({
    card_number: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    cardholder_name: ['', [Validators.required]],
    expiry_date: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    plan: ['premium', [Validators.required]]
  });

  plans = [
    {
      id: 'premium',
      name: 'Plan Premium Aerolínea',
      price: 199,
      features: [
        'Gestión avanzada de aerolínea',
        'Vuelos ilimitados',
        'Soporte técnico 24/7',
        'Panel de administración completo',
        'Reportes y estadísticas'
      ]
    }
  ];

  currentFormValid = computed(() => {
    if (this.currentStep() === 1) return this.airlineFormValid();
    if (this.currentStep() === 2) return this.adminFormValid();
    return this.paymentFormValid();
  });


  nextStep() {
    if (this.currentStep() < 3) {
      this.currentStep.update(step => step + 1);
      window.scrollTo(0, 0);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
      window.scrollTo(0, 0);
    }
  }
  // Llamada real al backend
  submitSubscription() {
    if (this.airlineForm.valid && this.adminForm.valid && this.paymentForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set('');

      const subscriptionData: SubscriptionRequest = {
        airline: this.airlineForm.value,
        admin: this.adminForm.value,
        payment: this.paymentForm.value
      };

      console.log('📤 Enviando datos de suscripción:', subscriptionData);

      this.authService.registerSubscription(subscriptionData).subscribe({
        next: (response) => {
          console.log('✅ Suscripción exitosa:', response);
          
          // Guardar sesión
          this.authService.saveSession(response);
          
          this.isSubmitting.set(false);
          this.submissionSuccess.set(true);

          // Redirigir al home después de 3 segundos
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000);
        },
        error: (error) => {
          console.error('❌ Error en suscripción:', error);
          this.isSubmitting.set(false);
          
          // Manejar diferentes tipos de errores
          if (error.error?.message) {
            this.errorMessage.set(`Error: ${error.error.message}`);
          } else if (error.message) {
            this.errorMessage.set(`Error: ${error.message}`);
          } else {
            this.errorMessage.set('Error al procesar la suscripción. Por favor intenta de nuevo.');
          }
        }
      });
    }
  }

  constructor() {
    const airlineStatusSignal = toSignal(this.airlineForm.statusChanges, { initialValue: this.airlineForm.status });
    const adminStatusSignal = toSignal(this.adminForm.statusChanges, { initialValue: this.adminForm.status });
    const paymentStatusSignal = toSignal(this.paymentForm.statusChanges, { initialValue: this.paymentForm.status });

    effect(() => {
      this.airlineFormValid.set(airlineStatusSignal() === 'VALID');
    });

    effect(() => {
      this.adminFormValid.set(adminStatusSignal() === 'VALID');
    });

    effect(() => {
      this.paymentFormValid.set(paymentStatusSignal() === 'VALID');
    });

    // Effect para logging
    effect(() => {
      console.log(`Paso actual: ${this.currentStep()}`);
      console.log(`Formulario actual válido: ${this.currentFormValid()}`);
    });
  }
}
