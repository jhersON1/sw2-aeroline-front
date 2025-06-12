// src/app/graphql/queries/airline.queries.ts

import { gql } from 'apollo-angular';

// Query para obtener aerolínea por alias (para URLs públicas)
export const GET_AIRLINE_BY_ALIAS = gql`
  query GetAirlineByAlias($alias: String!) {
    airlineByAlias(alias: $alias) {
      id
      name
      alias
      country
      contactEmail
      phoneNumber
      active
    }
  }
`;

// Query para obtener todas las aerolíneas
export const GET_ALL_AIRLINES = gql`
  query GetAllAirlines {
    allAirlines {
      id
      name
      alias
      country
      contactEmail
      phoneNumber
      active
    }
  }
`;

// Query para obtener aerolíneas por usuario (para admin)
export const GET_AIRLINES_BY_USER = gql`
  query GetAirlinesByUserId($userId: String) {
    airlinesByUserId(userId: $userId) {
      id
      name
      alias
      country
      contactEmail
      phoneNumber
      active
    }
  }
`;

// Query para obtener una aerolínea por ID
export const GET_AIRLINE_BY_ID = gql`
  query GetAirlineById($id: ID!) {
    airline(id: $id) {
      id
      name
      alias
      country
      contactEmail
      phoneNumber
      active
    }
  }
`;
