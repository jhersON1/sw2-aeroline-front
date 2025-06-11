import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Logo & Title -->
            <div class="flex items-center space-x-4">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 class="text-xl font-semibold text-gray-900">Dashboard Administrativo</h1>
                <p class="text-sm text-gray-500">Panel de control y KPIs</p>
              </div>
            </div>

            <!-- Navigation -->
            <nav class="hidden md:flex space-x-8">
              <a routerLink="/admin/dashboard" 
                 class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                 routerLinkActive="text-blue-600 bg-blue-50">
                Dashboard
              </a>
              <a href="#" class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Vuelos
              </a>
              <a href="#" class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Reservas
              </a>
              <a href="#" class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Reportes
              </a>
            </nav>

            <!-- User Menu -->
            <div class="flex items-center space-x-4">
              <div class="relative">
                <button class="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4 19h6v-7a1 1 0 011-1h4a1 1 0 011 1v7h6M4 19V9a1 1 0 011-1h14a1 1 0 011 1v10" />
                  </svg>
                </button>
              </div>
              
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">A</span>
                </div>
                <div class="hidden md:block">
                  <p class="text-sm font-medium text-gray-900">Administrador</p>
                  <p class="text-xs text-gray-500">adminaerolinea.com</p>
                </div>
              </div>

              <button class="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-white border-t mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex justify-between items-center text-sm text-gray-500">
            <div>
              <p>&copy; 2025 AeroSaaS. Dashboard Administrativo v1.0</p>
            </div>
            <div class="flex space-x-6">
              <a href="#" class="hover:text-gray-700">Soporte</a>
              <a href="#" class="hover:text-gray-700">Documentación</a>
              <a href="#" class="hover:text-gray-700">API</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class AdminLayoutComponent {
  constructor() {}
}
