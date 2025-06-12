import {
  ApplicationConfig,
  inject,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withFetch()),    provideApollo(() => {
      const httpLink = inject(HttpLink);

      return {
        link: httpLink.create({
          uri: 'http://13.218.34.214:8081/graphql', // URL del microservicio dockerizado local
        }),
        cache: new InMemoryCache({
          addTypename: false // Desactivar __typename para evitar conflictos
        }),
        defaultOptions: {
          watchQuery: {
            errorPolicy: 'all'
          },
          query: {
            errorPolicy: 'all'
          }
        }
      };
    }),
  ],
};
