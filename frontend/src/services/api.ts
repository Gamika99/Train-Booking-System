import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data.error || 'An error occurred. Please try again.';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Unable to reach the server. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
);

export interface Station {
  _id: string;
  name: string;
  code: string;
  order: number;
  distanceFromStart: number;
}

export interface Seat {
  _id: string;
  coachId: string;
  seatNumber: string;
  position: { row: number; column: number };
  isReserved: boolean;
}

export interface Booking {
  _id: string;
  seatId: Seat;
  fromStationId: Station;
  toStationId: Station;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  travelDate: string;
  price: number;
  status: 'confirmed' | 'cancelled' | 'waitlisted';
  createdAt: string;
}

export const apiService = {
  getStations: () => api.get('/stations'),
  getAvailableSeats: (fromStationId: string, toStationId: string) =>
    api.get('/seats/available', { params: { fromStationId, toStationId } }),
  createBooking: (data: any) => api.post('/bookings', data),
  getBookingsByEmail: (email: string) => api.get('/bookings', { params: { email } }),
  cancelBooking: (bookingId: string) => api.put(`/bookings/${bookingId}/cancel`),
};

export default api;