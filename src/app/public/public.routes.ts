import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layout/public-layout.component';
import { FlightSearchComponent } from './pages/flight-search/flight-search.component';
import { FlightResultsComponent } from './pages/flight-results/flight-results.component';
import { BookingComponent } from './pages/booking/booking.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { ConfirmationComponent } from './pages/confirmation/confirmation.component';
import { CheckInComponent } from './pages/check-in/check-in.component';

export const publicRoutes: Routes = [
    {
        path: ':airlineAlias',
        component: PublicLayoutComponent,
        children: [
            {
                path: '',
                component: FlightSearchComponent
            },
            {
                path: 'flights',
                component: FlightResultsComponent
            },
            {
                path: 'booking',
                component: BookingComponent
            },
            {
                path: 'payment',
                component: PaymentComponent
            },
            {
                path: 'confirmation',
                component: ConfirmationComponent
            },
            {
                path: 'check-in',
                component: CheckInComponent
            }
        ]
    }
];
