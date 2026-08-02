import mongoose from 'mongoose';
import { Booking, IBooking } from '../models/Booking';
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const fromStation = await Station.findById(fromStationId).session(session);
      const toStation = await Station.findById(toStationId).session(session);

      if (!fromStation || !toStation) {
        throw new Error('Station not found');
      }

      const overlappingBookings = await Booking.find({
        seatId: new mongoose.Types.ObjectId(seatId),
        status: 'confirmed',
        $or: [
          { fromStationId: { $gte: fromStationId }, toStationId: { $lte: toStationId } },
          { fromStationId: { $lte: fromStationId }, toStationId: { $gte: toStationId } },
          { fromStationId: { $lte: fromStationId }, toStationId: { $gte: fromStationId, $lte: toStationId } },
          { fromStationId: { $gte: fromStationId, $lte: toStationId }, toStationId: { $gte: toStationId } },
        ],
      }).session(session);

      await session.commitTransaction();
      return overlappingBookings.length === 0;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async createBooking(request: BookingRequest): Promise<IBooking> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const isAvailable = await this.checkSeatAvailability(
        request.seatId,
        request.fromStationId,
        request.toStationId
      );

      if (!isAvailable) {
        throw new Error('Seat is not available for the requested leg');
      }

      const fromStation = await Station.findById(request.fromStationId).session(session);
      const toStation = await Station.findById(request.toStationId).session(session);

      if (!fromStation || !toStation) {
        throw new Error('Station not found');
      }

      const distance = Math.abs(toStation.distanceFromStart - fromStation.distanceFromStart);
      const basePrice = 10;
      const price = distance * basePrice;

      const booking = new Booking({ ...request, price, status: 'confirmed' });
      await booking.save({ session });

      await Seat.findByIdAndUpdate(request.seatId, { isReserved: true }, { session });

      await session.commitTransaction();
      return booking;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getAvailableSeats(fromStationId: string, toStationId: string): Promise<any[]> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const reservedCoaches = await mongoose.model('Coach').find({ type: 'reserved' }).session(session);
      const coachIds = reservedCoaches.map((c) => c._id);

      const allSeats = await Seat.find({ coachId: { $in: coachIds } }).session(session);

      const bookings = await Booking.find({
        status: 'confirmed',
        $or: [
          { fromStationId: { $gte: fromStationId }, toStationId: { $lte: toStationId } },
          { fromStationId: { $lte: fromStationId }, toStationId: { $gte: toStationId } },
          { fromStationId: { $lte: fromStationId }, toStationId: { $gte: fromStationId, $lte: toStationId } },
          { fromStationId: { $gte: fromStationId, $lte: toStationId }, toStationId: { $gte: toStationId } },
        ],
      }).session(session);

      const bookedSeatIds = new Set(bookings.map((b) => b.seatId.toString()));
      const availableSeats = allSeats.filter((seat) => !bookedSeatIds.has(seat._id.toString()));

      await session.commitTransaction();
      return availableSeats;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}