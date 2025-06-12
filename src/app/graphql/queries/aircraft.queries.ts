// src/app/core/graphql/queries/aircraft.queries.ts

import { gql } from 'apollo-angular';

// Query para obtener un avión por ID
export const GET_AIRCRAFT_BY_ID = gql`
  query GetAircraftById($id: ID!) {
    aircraft(id: $id) {
      id
      airlineId
      userId
      model
      registration
      seatsTotal
      configuration
      createdAt
    }
  }
`;

// Query para obtener aviones por usuario
export const GET_AIRCRAFT_BY_USER = gql`
  query GetAircraftByUser($userId: String!) {
    aircraftByUserId(userId: $userId) {
      id
      airlineId
      userId
      model
      registration
      seatsTotal
      configuration
      createdAt
    }
  }
`;
