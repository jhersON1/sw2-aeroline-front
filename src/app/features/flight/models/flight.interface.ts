export interface Flight {
  id: string;
  flightNumber: string;
  aircraftId: string;
  originAirportId: string;
  destinationAirportId: string;
  departureTime: string;
  arrivalTime: string;
  daysOfWeek: number[]; // [1,2,3,4,5] = Lunes a Viernes
  price: number;
  status: 'active' | 'cancelled' | 'delayed';
  aircraft?: {
    id: string;
    model: string;
    seatsTotal: number;
  };
  originAirport?: {
    id: string;
    name: string;
    code: string;
    city: string;
  };
  destinationAirport?: {
    id: string;
    name: string;
    code: string;
    city: string;
  };
}

export interface FlightInput {
  flightNumber: string;
  aircraftId: string;
  originAirportId: string;
  destinationAirportId: string;
  departureTime: string;
  arrivalTime: string;
  daysOfWeek: number[];
  price: number;
}

export interface FlightValidation {
  flightNumber?: string;
  aircraftId?: string;
  originAirportId?: string;
  destinationAirportId?: string;
  departureTime?: string;
  arrivalTime?: string;
  daysOfWeek?: string;
  price?: string;
}
