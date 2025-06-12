// src/app/graphql/queries/flight.queries.ts

import { gql } from 'apollo-angular';

// Query para buscar vuelos públicos (la más importante)
export const SEARCH_FLIGHTS_PUBLIC = gql`
  query SearchFlights($originCode: String!, $destinationCode: String!, $departureDate: LocalDateTime!) {
    searchFlights(originCode: $originCode, destinationCode: $destinationCode, departureDate: $departureDate) {
      id
      code
      status
      departureTime
      arrivalTime
      price
      duration
      aircraft {
        id
        model
        seatsTotal
        registration
      }
      origin {
        id
        code
        name
        city
        country
      }
      destination {
        id
        code
        name
        city
        country
      }
    }
  }
`;

// Query para obtener vuelos disponibles (para usuarios públicos)
export const GET_AVAILABLE_FLIGHTS = gql`
  query GetAvailableFlights {
    availableFlights {
      id
      code
      status
      departureTime
      arrivalTime
      price
      duration
      aircraft {
        model
        seatsTotal
      }
      origin {
        code
        name
        city
      }
      destination {
        code
        name
        city
      }
    }
  }
`;

// Query para obtener vuelos por aerolínea (admin)
export const GET_FLIGHTS_BY_AIRLINE = gql`
  query GetFlightsByAirline($airlineId: String!) {
    flightsByAirline(airlineId: $airlineId) {
      id
      code
      status
      departureTime
      arrivalTime
      price
      aircraft {
        model
        registration
      }
      origin {
        code
        name
        city
      }
      destination {
        code
        name
        city
      }
    }
  }
`;

// Query para obtener vuelos por usuario (admin)
export const GET_FLIGHTS_BY_USER = gql`
  query GetFlightsByUserId($userId: String) {
    flightsByUserId(userId: $userId) {
      id
      code
      status
      departureTime
      arrivalTime
      price
      aircraft {
        model
        registration
      }
      origin {
        code
        name
        city
      }
      destination {
        code
        name
        city
      }
    }
  }
`;

// Query para obtener un vuelo por ID
export const GET_FLIGHT_BY_ID = gql`
  query GetFlightById($id: ID!) {
    flight(id: $id) {
      id
      code
      status
      departureTime
      arrivalTime
      price
      duration
      aircraft {
        id
        model
        seatsTotal
        registration
      }
      origin {
        id
        code
        name
        city
        country
      }
      destination {
        id
        code
        name
        city
        country
      }
    }
  }
`;

// Query para buscar vuelos por ID de aerolínea (workaround temporal)
export const FLIGHTS_BY_AIRLINE = gql`
  query FlightsByAirline($airlineId: String!) {
    flightsByAirline(airlineId: $airlineId) {
      id
      code
      status
      departureTime
      arrivalTime
      price
      aircraft {
        id
        model
        seatsTotal
        registration
      }
      origin {
        id
        code
        name
        city
        country
      }
      destination {
        id
        code
        name
        city
        country
      }
    }
  }
`;

// Query para buscar vuelos por alias de aerolínea (para URLs públicas) - NO FUNCIONA AÚN
export const SEARCH_FLIGHTS_BY_AIRLINE = gql`
  query SearchFlightsByAirline($airlineAlias: String!) {
    searchFlightsByAirline(airlineAlias: $airlineAlias) {
      id
      code
      status
      departureTime
      arrivalTime
      price
      duration
      aircraft {
        id
        model
        seatsTotal
        registration
      }
      origin {
        id
        code
        name
        city
        country
      }
      destination {
        id
        code
        name
        city
        country
      }
    }
  }
`;
