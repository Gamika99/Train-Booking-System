import express from 'express';
import { BookingController } from '../controllers/BookingController';

const router = express.Router();

router.get('/stations', BookingController.getStations);
router.get('/seats/available', BookingController.getAvailableSeats);
router.post('/bookings', BookingController.createBooking);
router.get('/bookings', BookingController.getBookingsByEmail);
router.put('/bookings/:id/cancel', BookingController.cancelBooking);

export default router;