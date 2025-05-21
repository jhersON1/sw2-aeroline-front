import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { SubscriptionComponent } from './auth/pages/subscription/subscription.component';

export const routes: Routes = [
    {
        path: '',
        component: SubscriptionComponent
    }
];
