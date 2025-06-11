import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { KPIService, KPIRequest, KPIResponse, DateRange } from '../../services/kpi.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dashboard de KPIs</h1>
          <p class="text-gray-600 mt-1">Monitoreo en tiempo real de indicadores clave de rendimiento</p>
        </div>
        
        <div class="mt-4 sm:mt-0 flex items-center space-x-3">
          <button (click)="refreshData()" 
                  [disabled]="isLoading"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" [class]="'h-4 w-4 mr-2 ' + (isLoading ? 'animate-spin' : '')" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ isLoading ? 'Actualizando...' : 'Actualizar' }}
          </button>
          
          <button (click)="exportData()" 
                  [disabled]="!currentKPIs"
                  class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Filtros</h2>
        <form [formGroup]="filterForm" class="space-y-4">
          
          <!-- Quick Date Filters -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rangos predefinidos</label>
            <div class="flex flex-wrap gap-2">
              @for (range of dateRanges; track range.label) {
                <button type="button" 
                        (click)="selectDateRange(range)"
                        [class]="'px-3 py-2 text-xs font-medium rounded-md border transition duration-200 ' + 
                                 (isSelectedRange(range) ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')">
                  {{ range.label }}
                </button>
              }
            </div>
          </div>          <!-- Custom Date Range -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha inicio</label>
              <input type="date" 
                     formControlName="start_date"
                     [class]="'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ' +
                             (filterForm.get('start_date')?.value ? 
                               'border-blue-300 text-gray-900 bg-blue-50 font-medium' : 
                               'border-gray-300 text-gray-500 bg-white')">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Fecha fin</label>
              <input type="date" 
                     formControlName="end_date"
                     [class]="'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ' +
                             (filterForm.get('end_date')?.value ? 
                               'border-blue-300 text-gray-900 bg-blue-50 font-medium' : 
                               'border-gray-300 text-gray-500 bg-white')">
            </div>
          </div>

          <!-- Advanced Filters (Future functionality) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Número de cola (opcional)</label>
              <input type="text" 
                     formControlName="tail_num"
                     placeholder="Ej: N146PQ"
                     [class]="'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ' +
                             (filterForm.get('tail_num')?.value ? 
                               'border-green-300 text-gray-900 bg-green-50 font-medium placeholder-green-400' : 
                               'border-gray-300 text-gray-700 bg-white placeholder-gray-400')">
              <p class="text-xs text-gray-500 mt-1">Funcionalidad en desarrollo</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Origen (opcional)</label>
              <input type="text" 
                     formControlName="origin"
                     placeholder="Ej: 8NY"
                     [class]="'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ' +
                             (filterForm.get('origin')?.value ? 
                               'border-green-300 text-gray-900 bg-green-50 font-medium placeholder-green-400' : 
                               'border-gray-300 text-gray-700 bg-white placeholder-gray-400')">
              <p class="text-xs text-gray-500 mt-1">Funcionalidad en desarrollo</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Destino (opcional)</label>
              <input type="text" 
                     formControlName="dest"
                     placeholder="Ej: 5AK"
                     [class]="'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ' +
                             (filterForm.get('dest')?.value ? 
                               'border-green-300 text-gray-900 bg-green-50 font-medium placeholder-green-400' : 
                               'border-gray-300 text-gray-700 bg-white placeholder-gray-400')">
              <p class="text-xs text-gray-500 mt-1">Funcionalidad en desarrollo</p>
            </div>
          </div>
        </form>
      </div>      <!-- Error Display -->
      @if (errorMessage) {
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error al cargar los datos</h3>
              <p class="text-sm text-red-700 mt-1">{{ errorMessage }}</p>
              <button (click)="clearError()" class="mt-2 text-sm text-red-600 hover:text-red-500 underline">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Loading State -->
      @if (isLoading) {
        <div class="bg-white rounded-lg shadow p-8">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-4 text-gray-600">Cargando KPIs...</p>
          </div>
        </div>
      }      <!-- KPI Cards -->
      @if (currentKPIs && !isLoading) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Cancellation Rate -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-sm font-medium text-gray-900">Tasa de Cancelación</h3>
                  <p class="text-xs text-gray-500">Total de vuelos cancelados</p>
                </div>
              </div>
              @if (previousKPIs) {
                <div class="text-right">
                  <div [class]="'flex items-center text-sm ' + getTrendClass(currentKPIs.cancellation_rate, previousKPIs.cancellation_rate, true)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" [class]="getTrendClass(currentKPIs.cancellation_rate, previousKPIs.cancellation_rate, true)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getTrendIcon(currentKPIs.cancellation_rate, previousKPIs.cancellation_rate, true)" />
                    </svg>
                    <span>{{ getPercentageChange(currentKPIs.cancellation_rate, previousKPIs.cancellation_rate) | number:'1.1-1' }}%</span>
                  </div>
                </div>
              }
            </div>
            <div class="mt-4">
              <div class="text-3xl font-bold text-gray-900">{{ currentKPIs.cancellation_rate | number:'1.2-2' }}%</div>
              <div class="mt-2 flex items-center text-sm text-gray-600">
                <span>Del período seleccionado</span>
              </div>
            </div>
            
            <!-- Mini Chart Placeholder -->
            <div class="mt-4 h-16 bg-gradient-to-r from-red-50 to-red-100 rounded flex items-end justify-center">
              <div class="text-xs text-red-600 mb-2">Gráfico histórico</div>
            </div>
          </div>

          <!-- Average Departure Delay -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-sm font-medium text-gray-900">Demora Promedio</h3>
                  <p class="text-xs text-gray-500">Vuelos cancelados</p>
                </div>
              </div>
              @if (previousKPIs) {
                <div class="text-right">
                  <div [class]="'flex items-center text-sm ' + getTrendClass(currentKPIs.avg_dep_delay_cancelled, previousKPIs.avg_dep_delay_cancelled, true)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getTrendIcon(currentKPIs.avg_dep_delay_cancelled, previousKPIs.avg_dep_delay_cancelled, true)" />
                    </svg>
                    <span>{{ getPercentageChange(currentKPIs.avg_dep_delay_cancelled, previousKPIs.avg_dep_delay_cancelled) | number:'1.1-1' }}%</span>
                  </div>
                </div>
              }
            </div>
            <div class="mt-4">
              <div class="text-3xl font-bold text-gray-900">{{ currentKPIs.avg_dep_delay_cancelled | number:'1.1-1' }}</div>
              <div class="text-sm text-gray-600">minutos</div>
            </div>
            
            <!-- Mini Chart Placeholder -->
            <div class="mt-4 h-16 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded flex items-end justify-center">
              <div class="text-xs text-yellow-600 mb-2">Gráfico histórico</div>
            </div>
          </div>

          <!-- Weather Cancellation Rate -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-sm font-medium text-gray-900">Cancelación por Clima</h3>
                  <p class="text-xs text-gray-500">Del total de cancelaciones</p>
                </div>
              </div>
              @if (previousKPIs) {
                <div class="text-right">
                  <div [class]="'flex items-center text-sm ' + getTrendClass(currentKPIs.weather_cancellation_rate, previousKPIs.weather_cancellation_rate, true)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getTrendIcon(currentKPIs.weather_cancellation_rate, previousKPIs.weather_cancellation_rate, true)" />
                    </svg>
                    <span>{{ getPercentageChange(currentKPIs.weather_cancellation_rate, previousKPIs.weather_cancellation_rate) | number:'1.1-1' }}%</span>
                  </div>
                </div>
              }
            </div>
            <div class="mt-4">
              <div class="text-3xl font-bold text-gray-900">{{ currentKPIs.weather_cancellation_rate }}%</div>
              <div class="mt-2 flex items-center text-sm text-gray-600">
                <span>De las cancelaciones totales</span>
              </div>
            </div>
            
            <!-- Mini Chart Placeholder -->
            <div class="mt-4 h-16 bg-gradient-to-r from-blue-50 to-blue-100 rounded flex items-end justify-center">
              <div class="text-xs text-blue-600 mb-2">Gráfico histórico</div>
            </div>
          </div>
        </div>

        <!-- Additional KPIs Section -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          
          <!-- Non-Weather Cancellation Rate -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-sm font-medium text-gray-900">Cancelación Operacional</h3>
                  <p class="text-xs text-gray-500">No relacionadas con clima</p>
                </div>
              </div>
            </div>
            <div class="mt-4">
              <div class="text-3xl font-bold text-gray-900">{{ getNonWeatherCancellationRate() | number:'1.1-1' }}%</div>
              <div class="mt-2 flex items-center text-sm text-gray-600">
                <span>De las cancelaciones totales</span>
              </div>
            </div>
            
            <!-- Mini Chart Placeholder -->
            <div class="mt-4 h-16 bg-gradient-to-r from-purple-50 to-purple-100 rounded flex items-end justify-center">
              <div class="text-xs text-purple-600 mb-2">Gráfico histórico</div>
            </div>
          </div>

          <!-- Delay Efficiency Score -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-sm font-medium text-gray-900">Índice de Eficiencia</h3>
                  <p class="text-xs text-gray-500">Basado en demoras</p>
                </div>
              </div>
            </div>
            <div class="mt-4">
              <div class="text-3xl font-bold text-gray-900">{{ getEfficiencyScore() | number:'1.0-0' }}/100</div>
              <div class="mt-2 flex items-center text-sm text-gray-600">
                <span [class]="getEfficiencyScoreClass()">{{ getEfficiencyLabel() }}</span>
              </div>
            </div>
            
            <!-- Mini Chart Placeholder -->
            <div class="mt-4 h-16 bg-gradient-to-r from-green-50 to-green-100 rounded flex items-end justify-center">
              <div class="text-xs text-green-600 mb-2">Gráfico histórico</div>
            </div>
          </div>

          <!-- Weather Impact Index -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="text-sm font-medium text-gray-900">Impacto Climático</h3>
                  <p class="text-xs text-gray-500">Índice combinado</p>
                </div>
              </div>
            </div>
            <div class="mt-4">
              <div class="text-3xl font-bold text-gray-900">{{ getWeatherImpactIndex() | number:'1.0-0' }}/100</div>
              <div class="mt-2 flex items-center text-sm text-gray-600">
                <span [class]="getWeatherImpactClass()">{{ getWeatherImpactLabel() }}</span>
              </div>
            </div>
            
            <!-- Mini Chart Placeholder -->
            <div class="mt-4 h-16 bg-gradient-to-r from-orange-50 to-orange-100 rounded flex items-end justify-center">
              <div class="text-xs text-orange-600 mb-2">Gráfico histórico</div>
            </div>
          </div>        </div>

        <!-- Visual Chart Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-6">Análisis Visual de KPIs</h3>
          
          <!-- Comparative Bar Chart -->
          <div class="space-y-6">
            <div>
              <h4 class="text-md font-medium text-gray-800 mb-4">Comparativa de Indicadores Principales</h4>
              <div class="space-y-4">
                
                <!-- Cancellation Rate Bar -->
                <div class="flex items-center space-x-4">
                  <div class="w-32 text-sm font-medium text-gray-700">Cancelación</div>
                  <div class="flex-1 bg-gray-200 rounded-full h-4 relative">
                    <div class="bg-red-500 h-4 rounded-full transition-all duration-1000 relative"
                         [style.width.%]="Math.min(currentKPIs.cancellation_rate * 10, 100)">
                      <span class="absolute right-2 top-0 text-xs font-medium text-white leading-4">
                        {{ currentKPIs.cancellation_rate | number:'1.1-1' }}%
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Weather Cancellation Bar -->
                <div class="flex items-center space-x-4">
                  <div class="w-32 text-sm font-medium text-gray-700">Clima</div>
                  <div class="flex-1 bg-gray-200 rounded-full h-4 relative">
                    <div class="bg-blue-500 h-4 rounded-full transition-all duration-1000 relative"
                         [style.width.%]="currentKPIs.weather_cancellation_rate">
                      <span class="absolute right-2 top-0 text-xs font-medium text-white leading-4">
                        {{ currentKPIs.weather_cancellation_rate }}%
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Non-Weather Cancellation Bar -->
                <div class="flex items-center space-x-4">
                  <div class="w-32 text-sm font-medium text-gray-700">Operacional</div>
                  <div class="flex-1 bg-gray-200 rounded-full h-4 relative">
                    <div class="bg-purple-500 h-4 rounded-full transition-all duration-1000 relative"
                         [style.width.%]="getNonWeatherCancellationRate()">
                      <span class="absolute right-2 top-0 text-xs font-medium text-white leading-4">
                        {{ getNonWeatherCancellationRate() | number:'1.1-1' }}%
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Efficiency Score Bar -->
                <div class="flex items-center space-x-4">
                  <div class="w-32 text-sm font-medium text-gray-700">Eficiencia</div>
                  <div class="flex-1 bg-gray-200 rounded-full h-4 relative">
                    <div [class]="'h-4 rounded-full transition-all duration-1000 relative ' + getEfficiencyBarColor()"
                         [style.width.%]="getEfficiencyScore()">
                      <span class="absolute right-2 top-0 text-xs font-medium text-white leading-4">
                        {{ getEfficiencyScore() }}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Delay Timeline Chart -->
            <div class="border-t pt-6">
              <h4 class="text-md font-medium text-gray-800 mb-4">Análisis de Demoras</h4>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-medium text-gray-600">Demora Promedio de Vuelos Cancelados</span>
                  <span class="text-lg font-bold text-yellow-600">{{ currentKPIs.avg_dep_delay_cancelled | number:'1.1-1' }} min</span>
                </div>
                
                <!-- Delay visualization bars -->
                <div class="space-y-2">
                  <!-- Delay ranges visualization -->
                  <div class="flex items-center space-x-2 text-xs">
                    <div class="w-16 text-gray-600">0-30 min</div>
                    <div class="flex-1 bg-green-200 h-2 rounded" 
                         [style.width.%]="getDelayRangePercentage('low')"></div>
                    <span class="w-12 text-gray-600">{{ getDelayRangePercentage('low') | number:'1.0-0' }}%</span>
                  </div>
                  
                  <div class="flex items-center space-x-2 text-xs">
                    <div class="w-16 text-gray-600">30-60 min</div>
                    <div class="flex-1 bg-yellow-300 h-2 rounded"
                         [style.width.%]="getDelayRangePercentage('medium')"></div>
                    <span class="w-12 text-gray-600">{{ getDelayRangePercentage('medium') | number:'1.0-0' }}%</span>
                  </div>
                  
                  <div class="flex items-center space-x-2 text-xs">
                    <div class="w-16 text-gray-600">60+ min</div>
                    <div class="flex-1 bg-red-400 h-2 rounded"
                         [style.width.%]="getDelayRangePercentage('high')"></div>
                    <span class="w-12 text-gray-600">{{ getDelayRangePercentage('high') | number:'1.0-0' }}%</span>
                  </div>
                </div>
                
                <div class="mt-3 text-xs text-gray-500">
                  * Distribución estimada basada en demora promedio de {{ currentKPIs.avg_dep_delay_cancelled | number:'1.1-1' }} minutos
                </div>
              </div>
            </div>

            <!-- Performance Radar -->
            <div class="border-t pt-6">
              <h4 class="text-md font-medium text-gray-800 mb-4">Radar de Rendimiento</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 rounded-lg p-4 text-center">
                  <div class="text-2xl font-bold" [class]="getEfficiencyScoreClass()">
                    {{ getEfficiencyScore() }}
                  </div>
                  <div class="text-sm text-gray-600 mt-1">Eficiencia Global</div>
                  <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div [class]="'h-2 rounded-full transition-all duration-1000 ' + getEfficiencyBarColor()"
                         [style.width.%]="getEfficiencyScore()"></div>
                  </div>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-4 text-center">
                  <div class="text-2xl font-bold" [class]="getWeatherImpactClass()">
                    {{ getWeatherImpactIndex() }}
                  </div>
                  <div class="text-sm text-gray-600 mt-1">Impacto Climático</div>
                  <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div [class]="'h-2 rounded-full transition-all duration-1000 ' + getWeatherImpactBarColor()"
                         [style.width.%]="getWeatherImpactIndex()"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Detailed Analytics Section -->
      @if (currentKPIs && !isLoading) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Summary Table -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Resumen de KPIs</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="text-sm font-medium text-gray-600">Tasa de Cancelación Global</span>
                <span class="text-sm font-bold text-red-600">{{ currentKPIs.cancellation_rate }}%</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="text-sm font-medium text-gray-600">Demora Promedio (Cancelados)</span>
                <span class="text-sm font-bold text-yellow-600">{{ currentKPIs.avg_dep_delay_cancelled | number:'1.1-1' }} min</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="text-sm font-medium text-gray-600">Cancelaciones por Clima</span>
                <span class="text-sm font-bold text-blue-600">{{ currentKPIs.weather_cancellation_rate }}%</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="text-sm font-medium text-gray-600">Cancelaciones Operacionales</span>
                <span class="text-sm font-bold text-purple-600">{{ getNonWeatherCancellationRate() | number:'1.1-1' }}%</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="text-sm font-medium text-gray-600">Índice de Eficiencia</span>
                <span class="text-sm font-bold" [class]="getEfficiencyScoreClass()">{{ getEfficiencyScore() }}/100</span>
              </div>
              <div class="flex justify-between items-center py-3">
                <span class="text-sm font-medium text-gray-600">Impacto Climático</span>
                <span class="text-sm font-bold" [class]="getWeatherImpactClass()">{{ getWeatherImpactIndex() }}/100</span>
              </div>
            </div>
          </div>

          <!-- Insights & Recommendations -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Insights y Recomendaciones</h3>
            <div class="space-y-3">
              
              @if (currentKPIs.cancellation_rate > 5) {
                <div class="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-red-800">Alta tasa de cancelación</p>
                    <p class="text-xs text-red-600 mt-1">La tasa de cancelación supera el 5%. Considere revisar procesos operacionales.</p>
                  </div>
                </div>
              } @else {
                <div class="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-green-800">Tasa de cancelación óptima</p>
                    <p class="text-xs text-green-600 mt-1">La tasa de cancelación está dentro de rangos aceptables.</p>
                  </div>
                </div>
              }

              @if (currentKPIs.weather_cancellation_rate > 50) {
                <div class="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-blue-800">Impacto climático significativo</p>
                    <p class="text-xs text-blue-600 mt-1">Más del 50% de cancelaciones son por clima. Considere mejorar predicciones meteorológicas.</p>
                  </div>
                </div>
              }              @if (currentKPIs.avg_dep_delay_cancelled > 60) {
                <div class="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-yellow-800">Demoras prolongadas</p>
                    <p class="text-xs text-yellow-600 mt-1">Los vuelos cancelados tuvieron demoras promedio altas. Revisar procesos de decisión.</p>
                  </div>
                </div>
              }

              @if (getEfficiencyScore() < 60) {
                <div class="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-orange-800">Eficiencia operacional baja</p>
                    <p class="text-xs text-orange-600 mt-1">El índice de eficiencia está por debajo del 60%. Revisar procesos operacionales.</p>
                  </div>
                </div>
              } @else if (getEfficiencyScore() >= 80) {
                <div class="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-green-800">Excelente eficiencia operacional</p>
                    <p class="text-xs text-green-600 mt-1">El índice de eficiencia es excelente. Mantener los procesos actuales.</p>
                  </div>
                </div>
              }

              @if (getNonWeatherCancellationRate() > 70) {
                <div class="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-purple-800">Alto porcentaje de cancelaciones operacionales</p>
                    <p class="text-xs text-purple-600 mt-1">Más del 70% de cancelaciones no son por clima. Revisar procesos internos.</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Last Updated Info -->
      @if (lastUpdated) {
        <div class="text-center text-sm text-gray-500">
          <p>Última actualización: {{ lastUpdated | date:'medium' }}</p>
        </div>
      }

      <!-- Connection Status -->
      <div class="mt-4 p-4 rounded-lg" [ngClass]="{'bg-green-50 border-green-200': isConnected, 'bg-red-50 border-red-200': !isConnected}">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full mr-2" [ngClass]="{'bg-green-500': isConnected, 'bg-red-500': !isConnected}"></div>
            <span class="text-sm font-medium" [ngClass]="{'text-green-800': isConnected, 'text-red-800': !isConnected}">
              {{ isConnected ? 'Conectado a la API' : 'Sin conexión con la API' }}
            </span>
          </div>
          
          <!-- Retry Button -->
          @if (!isConnected) {
            <button (click)="checkAPIConnection()" class="text-sm text-blue-600 hover:text-blue-500">
              Reintentar
            </button>
          }
        </div>
          <!-- Connection Status Message -->
        <div class="mt-2 text-sm" [ngClass]="{'text-green-700': isConnected, 'text-red-700': !isConnected}">
          @if (connectionStatus === 'checking') {
            <span>Verificando estado de conexión...</span>
          } @else if (connectionStatus === 'error') {
            <span>Error al conectar con la API. Por favor, verifique su conexión.</span>
          } @else {
            <span>Conexión establecida.</span>
          }
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  filterForm: FormGroup;
  dateRanges: DateRange[] = [];
  
  currentKPIs: KPIResponse | null = null;
  previousKPIs: KPIResponse | null = null;
  
  isLoading: boolean = false;
  errorMessage: string | null = null;
  lastUpdated: Date | null = null;
  isConnected: boolean = false;
  connectionStatus: 'checking' | 'connected' | 'error' = 'checking';
  constructor(
    private fb: FormBuilder,
    private kpiService: KPIService,
    private cdr: ChangeDetectorRef
  ) {
    this.filterForm = this.fb.group({
      start_date: [''],
      end_date: [''],
      tail_num: [''],
      origin: [''],
      dest: ['']
    });
  }  ngOnInit() {
    console.log('🎬 [Dashboard] Inicializando componente...');
    this.dateRanges = this.kpiService.getDateRanges();
    
    // Seleccionar "Todo Junio 2022" por defecto
    const defaultRange = this.dateRanges.find(range => range.label === 'Todo Junio 2022');
    if (defaultRange) {
      console.log('📅 [Dashboard] Seleccionando rango por defecto:', defaultRange.label);
      this.filterForm.patchValue({
        start_date: defaultRange.start,
        end_date: defaultRange.end
      });
    }
    
    this.setupFormSubscription();
    this.setupLoadingSubscription();
    this.setupErrorSubscription();
    this.checkAPIConnection();
    
    // Carga inicial con el rango por defecto
    console.log('📊 [Dashboard] Carga inicial con rango por defecto...');
    this.loadKPIs();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private setupFormSubscription() {
    // Solo reaccionar a cambios cuando el usuario interactúe manualmente
    // No auto-cargar en cada cambio del formulario
    console.log('🔧 [Dashboard] Configurando subscripción del formulario (sin auto-carga)');
  }
  private setupLoadingSubscription() {
    console.log('🔧 [Dashboard] Configurando subscripción de loading...');
    this.kpiService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        console.log('⏳ [Dashboard] Estado de loading cambió a:', loading);
        this.isLoading = loading;
        this.cdr.detectChanges();
      });
  }

  private setupErrorSubscription() {
    console.log('🔧 [Dashboard] Configurando subscripción de errores...');
    this.kpiService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        console.log('❌ [Dashboard] Error recibido:', error);
        this.errorMessage = error;
        this.cdr.detectChanges();
      });
  }
  selectDateRange(range: DateRange) {
    console.log('📅 [Dashboard] Usuario seleccionó rango:', range.label);
    this.filterForm.patchValue({
      start_date: range.start,
      end_date: range.end
    });
    this.loadKPIs();
  }

  isSelectedRange(range: DateRange): boolean {
    const formValue = this.filterForm.value;
    return formValue.start_date === range.start && formValue.end_date === range.end;
  }
  loadKPIs() {
    console.log('📊 [Dashboard] Iniciando carga de KPIs...');
    const filters: KPIRequest = this.filterForm.value;
    console.log('📊 [Dashboard] Filtros del formulario:', filters);
    
    this.kpiService.getKPIs(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({        next: (kpis) => {
          console.log('✅ [Dashboard] KPIs recibidos exitosamente:', kpis);
          console.log('✅ [Dashboard] Antes - currentKPIs:', this.currentKPIs);
          this.currentKPIs = kpis;
          this.lastUpdated = new Date();
          console.log('✅ [Dashboard] Después - currentKPIs:', this.currentKPIs);
          console.log('✅ [Dashboard] lastUpdated:', this.lastUpdated);
          
          // Forzar detección de cambios
          this.cdr.detectChanges();
          console.log('🔄 [Dashboard] Change detection triggered');
          
          console.log('📊 [Dashboard] Iniciando carga de datos de comparación...');
          this.loadComparisonData(filters);
        },
        error: (error) => {
          console.error('❌ [Dashboard] Error loading KPIs:', error);
          console.error('❌ [Dashboard] Error type:', typeof error);
          console.error('❌ [Dashboard] Error details:', error);
        }
      });
  }

  private loadComparisonData(filters: KPIRequest) {
    this.kpiService.getComparisonData(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comparison) => {
          this.previousKPIs = comparison.previous;
        },
        error: (error) => {
          console.error('Error loading comparison data:', error);
          // Don't show error for comparison data, just log it
        }
      });
  }

  refreshData() {
    this.loadKPIs();
  }  exportData() {
    if (!this.currentKPIs) return;

    const data = [
      ['KPI', 'Valor', 'Período'],
      ['Tasa de Cancelación', `${this.currentKPIs.cancellation_rate}%`, this.getSelectedDateRangeLabel()],
      ['Demora Promedio (Cancelados)', `${this.currentKPIs.avg_dep_delay_cancelled.toFixed(2)} min`, this.getSelectedDateRangeLabel()],
      ['Cancelaciones por Clima', `${this.currentKPIs.weather_cancellation_rate}%`, this.getSelectedDateRangeLabel()],
      ['Cancelaciones Operacionales', `${this.getNonWeatherCancellationRate().toFixed(1)}%`, this.getSelectedDateRangeLabel()],
      ['Índice de Eficiencia', `${this.getEfficiencyScore()}/100`, this.getSelectedDateRangeLabel()],
      ['Impacto Climático', `${this.getWeatherImpactIndex()}/100`, this.getSelectedDateRangeLabel()]
    ];

    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `kpis_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  getSelectedDateRangeLabel(): string {
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;
    
    if (startDate && endDate) {
      const selectedRange = this.dateRanges.find(range => 
        range.start === startDate && range.end === endDate
      );
      return selectedRange?.label || `${startDate} a ${endDate}`;
    }
    
    return 'Rango personalizado';
  }

  clearError() {
    this.kpiService.clearError();
  }

  getPercentageChange(current: number, previous: number): number {
    return this.kpiService.calculatePercentageChange(current, previous);
  }

  getTrendClass(current: number, previous: number, reverseGood: boolean = false): string {
    const change = this.getPercentageChange(current, previous);
    const isGood = reverseGood ? change < 0 : change > 0;
    
    if (Math.abs(change) < 1) return 'text-gray-500';
    return isGood ? 'text-green-600' : 'text-red-600';
  }

  getTrendIcon(current: number, previous: number, reverseGood: boolean = false): string {
    const change = this.getPercentageChange(current, previous);
    
    if (Math.abs(change) < 1) return 'M5 12h14';
    
    const isUp = change > 0;
    return isUp ? 'M7 14l3-3 3 3' : 'M7 10l3 3 3-3';
  }  /**
   * Check API connection status
   */
  checkAPIConnection(): void {
    console.log('🔌 [Dashboard] Verificando conexión con la API...');
    this.connectionStatus = 'checking';
    this.kpiService.getKPIs()
      .subscribe({        next: (response) => {
          console.log('✅ [Dashboard] Test de conexión exitoso:', response);
          this.connectionStatus = 'connected';
          this.isConnected = true;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ [Dashboard] Test de conexión falló:', error);
          this.connectionStatus = 'error';
          this.isConnected = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Calculate non-weather cancellation rate
   */
  getNonWeatherCancellationRate(): number {
    if (!this.currentKPIs) return 0;
    return 100 - this.currentKPIs.weather_cancellation_rate;
  }

  /**
   * Calculate efficiency score based on delays and cancellations
   */
  getEfficiencyScore(): number {
    if (!this.currentKPIs) return 0;
    
    // Base score starts at 100
    let score = 100;
    
    // Reduce score based on cancellation rate (each 1% cancellation = -10 points)
    score -= (this.currentKPIs.cancellation_rate * 10);
    
    // Reduce score based on average delay (each 10 minutes = -5 points)
    score -= (this.currentKPIs.avg_dep_delay_cancelled / 10) * 5;
    
    // Ensure score doesn't go below 0
    return Math.max(0, Math.round(score));
  }

  /**
   * Get efficiency score CSS class
   */
  getEfficiencyScoreClass(): string {
    const score = this.getEfficiencyScore();
    if (score >= 80) return 'text-green-600 font-medium';
    if (score >= 60) return 'text-yellow-600 font-medium';
    if (score >= 40) return 'text-orange-600 font-medium';
    return 'text-red-600 font-medium';
  }

  /**
   * Get efficiency score label
   */
  getEfficiencyLabel(): string {
    const score = this.getEfficiencyScore();
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    if (score >= 40) return 'Regular';
    return 'Crítico';
  }

  /**
   * Calculate weather impact index
   */
  getWeatherImpactIndex(): number {
    if (!this.currentKPIs) return 0;
    
    // Combine cancellation rate and weather percentage
    const weatherImpact = (this.currentKPIs.cancellation_rate * this.currentKPIs.weather_cancellation_rate) / 100;
    
    // Scale to 0-100 (higher is worse)
    return Math.min(100, Math.round(weatherImpact * 20));
  }

  /**
   * Get weather impact CSS class
   */
  getWeatherImpactClass(): string {
    const impact = this.getWeatherImpactIndex();
    if (impact <= 20) return 'text-green-600 font-medium';
    if (impact <= 40) return 'text-yellow-600 font-medium';
    if (impact <= 60) return 'text-orange-600 font-medium';
    return 'text-red-600 font-medium';
  }
  /**
   * Get weather impact label
   */
  getWeatherImpactLabel(): string {
    const impact = this.getWeatherImpactIndex();
    if (impact <= 20) return 'Bajo';
    if (impact <= 40) return 'Moderado';
    if (impact <= 60) return 'Alto';
    return 'Crítico';
  }

  /**
   * Get efficiency bar color for charts
   */
  getEfficiencyBarColor(): string {
    const score = this.getEfficiencyScore();
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }

  /**
   * Get weather impact bar color for charts
   */
  getWeatherImpactBarColor(): string {
    const impact = this.getWeatherImpactIndex();
    if (impact <= 20) return 'bg-green-500';
    if (impact <= 40) return 'bg-yellow-500';
    if (impact <= 60) return 'bg-orange-500';
    return 'bg-red-500';
  }

  /**
   * Get delay range percentage for visualization
   */
  getDelayRangePercentage(range: 'low' | 'medium' | 'high'): number {
    if (!this.currentKPIs) return 0;
    
    const avgDelay = this.currentKPIs.avg_dep_delay_cancelled;
    
    // Estimate distribution based on average delay
    if (avgDelay <= 30) {
      // Low average delay scenario
      return range === 'low' ? 70 : range === 'medium' ? 25 : 5;
    } else if (avgDelay <= 60) {
      // Medium average delay scenario
      return range === 'low' ? 40 : range === 'medium' ? 45 : 15;
    } else {
      // High average delay scenario
      return range === 'low' ? 20 : range === 'medium' ? 35 : 45;
    }
  }

  /**
   * Math reference for template
   */
  Math = Math;
}
