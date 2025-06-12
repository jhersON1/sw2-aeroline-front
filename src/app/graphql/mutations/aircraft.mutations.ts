// src/app/core/graphql/mutations/aircraft.mutations.ts

import { gql } from 'apollo-angular';

// Mutation para crear avión (según tu schema: createAircraft)
export const CREATE_AIRCRAFT = gql`
  mutation CreateAircraft($input: AircraftInput!) {
    createAircraft(input: $input) {
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

// Mutation para actualizar avión (según tu schema: updateAircraft)
export const UPDATE_AIRCRAFT = gql`
  mutation UpdateAircraft($id: ID!, $input: AircraftInput!) {
    updateAircraft(id: $id, input: $input) {
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

// Mutation para eliminar avión (según tu schema: deleteAircraft)
export const DELETE_AIRCRAFT = gql`
  mutation DeleteAircraft($id: ID!) {
    deleteAircraft(id: $id)
  }
`;

// ============================================
// Fragment reutilizable para campos de Aircraft
export const AIRCRAFT_FRAGMENT = gql`
  fragment AircraftFields on Aircraft {
    id
    airlineId
    userId
    model
    registration
    seatsTotal
    configuration
    createdAt
  }
`;
