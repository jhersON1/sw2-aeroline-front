import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminGuard } from '../shared/guards/admin.guard';

// Importar componentes de aeropuertos
import { AirportDashboardComponent } from '../features/airport/pages/airport-dashboard/airport-dashboard.component';
import { AirportCreateComponent } from '../features/airport/pages/airport-create/airport-create.component';
import { AirportEditComponent } from '../features/airport/pages/airport-edit/airport-edit.component';

// Importar componentes de aviones
import { AircraftDashboardComponent } from '../features/aircraft/pages/aircraft-dashboard/aircraft-dashboard.component';
import { AircraftCreateComponent } from '../features/aircraft/pages/aircraft-create/aircraft-create.component';
import { AircraftEditComponent } from '../features/aircraft/pages/aircraft-edit/aircraft-edit.component';

// Importar componentes de vuelos
import { FlightDashboardComponent } from '../features/flight/pages/flight-dashboard/flight-dashboard.component';
import { FlightCreateComponent } from '../features/flight/pages/flight-create/flight-create.component';
import { FlightEditComponent } from '../features/flight/pages/flight-edit/flight-edit.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      // ✅ RUTAS DE AEROPUERTOS
      {
        path: 'airports',
        component: AirportDashboardComponent,
      },
      {
        path: 'airports/create',
        component: AirportCreateComponent,
      },
      {
        path: 'airports/edit/:id',
        component: AirportEditComponent,
      },
      // ✅ NUEVAS RUTAS DE AVIONES
      {
        path: 'aircraft',
        component: AircraftDashboardComponent,
      },
      {
        path: 'aircraft/create',
        component: AircraftCreateComponent,      },
      {
        path: 'aircraft/edit/:id',
        component: AircraftEditComponent,
      },      // ✅ NUEVAS RUTAS DE VUELOS
      {
        path: 'flights',
        component: FlightDashboardComponent,
      },
      {
        path: 'flights/create',
        component: FlightCreateComponent,
      },
      {
        path: 'flights/edit/:id',
        component: FlightEditComponent,
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
