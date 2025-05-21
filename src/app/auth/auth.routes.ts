import { Routes } from "@angular/router";
import { LayoutComponent } from "./layout/layout.component";
import { SubscriptionComponent } from "./pages/subscription/subscription.component";

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            {   
                path: 'suscribe',
                component: SubscriptionComponent
            }
        ]
    }
];
