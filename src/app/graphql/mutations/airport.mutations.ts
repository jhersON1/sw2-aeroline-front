// src/app/core/graphql/mutations/airport.mutations.ts

import { gql } from 'apollo-angular';

// Mutation para crear aeropuerto (según tu schema: createAirport)
export const CREATE_AIRPORT = gql`
  mutation CreateAirport($input: AirportInput!) {
    createAirport(input: $input) {
      id
      code
      name
      city
      country
    }
  }
`;

// Mutation para actualizar aeropuerto (según tu schema: updateAirport)
export const UPDATE_AIRPORT = gql`
  mutation UpdateAirport($id: ID!, $input: AirportInput!) {
    updateAirport(id: $id, input: $input) {
      id
      code
      name
      city
      country
    }
  }
`;

// Mutation para eliminar aeropuerto (según tu schema: deleteAirport)
export const DELETE_AIRPORT = gql`
  mutation DeleteAirport($id: ID!) {
    deleteAirport(id: $id)
  }
`;
