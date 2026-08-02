import { Request, Response } from 'express';
import { BookingService } from '../services/BookingService';
import { Station } from '../models/Station';
import { Coach } from '../models/Coach';
import { Seat } from '../models/Seat';
import { Booking } from '../models/Booking';

export class BookingController {
  static async getStations(req: Request, res: Response) {
    try {
      const stations = await Station.find().sort({ order: 1 });
      res.json({ success: true, data: stations });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch stations' });
    }
  }

  static async getAvailableSeats(req: Request, res: Response) {
    try {
      const { fromStationId, toStationId } = req.query;
      if (!fromStationId || !toStationId) {
        return res.status(400).json({ success: false, error: 'fromStationId and toStationId are required' });
      }
      const seats = await BookingService.getAvailableSeats(fromStationId as string, toStationId as string);
      res.json({ success: true, data: seats });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch available seats' });
    }
  }

  static async createBooking(req: Request, res: Response) {
    try {
      const booking = await BookingService.createBooking(req.body);
      res.status(201).json({ success: true, data: booking });
    } catch (error: any) {
      if (error.message === 'Seat is not available for the requested leg') {
        return res.status(409).json({ success: false, error: error.message, code: 'SEAT_UNAVAILABLE' });
      }
      res.status(500).json({ success: false, error: 'Failed to create booking' });
    }
  }

  static async getBookingsByEmail(req: Request, res: Response) {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
      }
      const bookings = await Booking.find({ passengerEmail: email })
        .populate('seatId').populate('fromStationId').populate('toStationId')
        .sort({ createdAt: -1 });
      res.json({ success: true, data: bookings });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
    }
  }

  static async cancelBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const booking = await Booking.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
      if (!booking) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }
      const otherBookings = await Booking.findOne({ seatId: booking.seatId, status: 'confirmed', _id: { $ne: booking._id } });
      if (!otherBookings) {
        await Seat.findByIdAndUpdate(booking.seatId, { isReserved: false });
      }
      res.json({ success: true, data: booking });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to cancel booking' });
    }
  }
}
