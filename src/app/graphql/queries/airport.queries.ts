// src/app/core/graphql/queries/airport.queries.ts

import { gql } from 'apollo-angular';

// Query para obtener todos los aeropuertos (según tu schema: allAirports)
export const GET_AIRPORTS = gql`
  query GetAllAirports {
    allAirports {
      id
      code
      name
      city
      country
    }
  }
`;

// Query para obtener un aeropuerto por ID (según tu schema: airport)
export const GET_AIRPORT_BY_ID = gql`
  query GetAirportById($id: ID!) {
    airport(id: $id) {
      id
      code
      name
      city
      country
    }
  }
`;

// Query para obtener aeropuerto por código (según tu schema: airportByCode)
export const GET_AIRPORT_BY_CODE = gql`
  query GetAirportByCode($code: String!) {
    airportByCode(code: $code) {
      id
      code
      name
      city
      country
    }
  }
`;
