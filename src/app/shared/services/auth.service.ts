import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para tipado
export interface AirlineData {
  airline_name: string;
  alias: string;
  country: string;
  contact_email: string;
  phone_number: string;
}

export interface AdminData {
  admin_name: string;
  admin_email: string;
  admin_password: string;
  admin_phone?: string;
}

export interface PaymentData {
  card_number: string;
  cardholder_name: string;
  expiry_date: string;
  cvv: string;
  plan: string;
}

export interface SubscriptionRequest {
  airline: AirlineData;
  admin: AdminData;
  payment: PaymentData;
}

export interface SubscriptionResponse {
  user: {
    id: string;
    admin_name: string;
    admin_email: string;
    role: string;
    airline: {
      id: string;
      airline_name: string;
      alias: string;
      country: string;
    };
  };
  airline: {
    id: string;
    airline_name: string;
    alias: string;
    country: string;
    contact_email: string;
  };
  subscription: {
    id: string;
    plan: string;
    status: string;
  };
  token: string;
}

export interface LoginRequest {
  admin_email: string;
  admin_password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://34.107.191.119/api/auth';

  constructor(private http: HttpClient) {}

  /**
   * Registra una nueva suscripción de aerolínea
   */
  registerSubscription(data: SubscriptionRequest): Observable<SubscriptionResponse> {
    return this.http.post<SubscriptionResponse>(`${this.apiUrl}/register-subscription`, data);
  }

  /**
   * Login de administrador de aerolínea
   */
  loginAirline(data: LoginRequest): Observable<SubscriptionResponse> {
    return this.http.post<SubscriptionResponse>(`${this.apiUrl}/login-airline`, data);
  }

  /**
   * Guarda los datos de sesión en localStorage
   */
  saveSession(response: SubscriptionResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('airline', JSON.stringify(response.airline));
  }

  /**
   * Obtiene el token guardado
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Obtiene los datos del usuario
   */
  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Obtiene los datos de la aerolínea
   */
  getAirline(): any {
    const airline = localStorage.getItem('airline');
    return airline ? JSON.parse(airline) : null;
  }

  /**
   * Limpia la sesión
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('airline');
  }

  /**
   * Verifica si hay una sesión activa
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
