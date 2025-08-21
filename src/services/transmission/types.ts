import { TransmissionClient } from "../../transmission-rpc/transmission";
// Defines the shape of our context's state
export interface TransmissionContextState {
  isLoading: boolean;
  error: string | null;
  // A function to send authenticated requests to the Transmission server
  client: TransmissionClient
}