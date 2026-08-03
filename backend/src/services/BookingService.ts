import mongoose from 'mongoose';
import { Booking, IBooking } from '../models/Booking';
import { Coach } from '../models/Coach';
import { Seat } from '../models/Seat';
import { Station } from '../models/Station';

interface BookingRequest {
  seatId: string;
  fromStationId: string;
  toStationId: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  travelDate: Date;
}

export class BookingService {
  static async checkSeatAvailability(
    seatId: string,
    fromStationId: string,
    toStationId: string
  ): Promise<boolean> {
    const fromStation = await Station.findById(fromStationId);
    const toStation = await Station.findById(toStationId);

    if (!fromStation || !toStation) {
      throw new Error('Station not found');
    }

    const [startOrder, endOrder] = fromStation.order <= toStation.order
      ? [fromStation.order, toStation.order]
      : [toStation.order, fromStation.order];

    const overlappingBookings = await Booking.find({
      seatId: new mongoose.Types.ObjectId(seatId),
      status: 'confirmed',
    }).populate('fromStationId').populate('toStationId');

    const overlapping = overlappingBookings.some((booking) => {
      const bookingFrom = booking.fromStationId as unknown as any;
      const bookingTo = booking.toStationId as unknown as any;
      if (!bookingFrom || !bookingTo) return false;

      const bookingStart = Math.min(bookingFrom.order, bookingTo.order);
      const bookingEnd = Math.max(bookingFrom.order, bookingTo.order);
      return bookingStart <= endOrder && bookingEnd >= startOrder;
    });

    return !overlapping;
  }

  static async createBooking(request: BookingRequest): Promise<IBooking> {
    try {
      const isAvailable = await this.checkSeatAvailability(
        request.seatId,
        request.fromStationId,
        request.toStationId
      );

      if (!isAvailable) {
        throw new Error('Seat is not available for the requested leg');
      }

      const fromStation = await Station.findById(request.fromStationId);
      const toStation = await Station.findById(request.toStationId);

      if (!fromStation || !toStation) {
        throw new Error('Station not found');
      }

      const distance = Math.abs(toStation.distanceFromStart - fromStation.distanceFromStart);
      const basePrice = 10;
      const price = distance * basePrice;

      const booking = new Booking({ ...request, price, status: 'confirmed' });
      await booking.save();

      await Seat.findByIdAndUpdate(request.seatId, { isReserved: true });

      return booking;
    } catch (error) {
      throw error;
    }
  }

  static async getAvailableSeats(fromStationId: string, toStationId: string): Promise<any[]> {
    const fromStation = await Station.findById(fromStationId);
    const toStation = await Station.findById(toStationId);

    if (!fromStation || !toStation) {
      throw new Error('Station not found');
    }

    const reservedCoaches = await Coach.find({ type: 'reserved' });
    const coachIds = reservedCoaches.map((c) => c._id);

    const allSeats = await Seat.find({ coachId: { $in: coachIds } });
    const bookings = await Booking.find({ status: 'confirmed' }).populate('fromStationId').populate('toStationId');

    const bookedSeatIds = new Set(
      bookings
        .filter((booking) => {
          const bookingFrom = booking.fromStationId as unknown as any;
          const bookingTo = booking.toStationId as unknown as any;
          if (!bookingFrom || !bookingTo) return false;
          const startOrder = Math.min(fromStation.order, toStation.order);
          const endOrder = Math.max(fromStation.order, toStation.order);
          const bookingStart = Math.min(bookingFrom.order, bookingTo.order);
          const bookingEnd = Math.max(bookingFrom.order, bookingTo.order);
          return bookingStart <= endOrder && bookingEnd >= startOrder;
        })
        .map((booking) => booking.seatId.toString())
    );

    return allSeats.filter((seat) => !bookedSeatIds.has(seat._id.toString()));
  }
}