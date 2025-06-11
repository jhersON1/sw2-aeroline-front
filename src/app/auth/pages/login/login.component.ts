import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public authService = inject(AuthService);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  loginForm: FormGroup = this.fb.group({
    admin_email: ['', [Validators.required, Validators.email]],
    admin_password: ['', [Validators.required]]
  });

  login() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const loginData: LoginRequest = this.loginForm.value;

      console.log('🔐 Intentando login con:', { admin_email: loginData.admin_email });

      this.authService.loginAirline(loginData).subscribe({
        next: (response) => {
          console.log('✅ Login exitoso:', response);
            // Guardar sesión
          this.authService.saveSession(response);
          
          this.isLoading.set(false);
          
          // Redirigir al dashboard administrativo
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error) => {
          console.error('❌ Error en login:', error);
          this.isLoading.set(false);
          
          // Manejar errores
          if (error.error?.message) {
            this.errorMessage.set(error.error.message);
          } else if (error.message) {
            this.errorMessage.set(error.message);
          } else {
            this.errorMessage.set('Error al iniciar sesión. Verifica tus credenciales.');
          }
        }
      });
    }
  }
}
