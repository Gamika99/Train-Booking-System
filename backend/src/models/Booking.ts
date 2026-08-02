import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  seatId: mongoose.Types.ObjectId;
  fromStationId: mongoose.Types.ObjectId;
  toStationId: mongoose.Types.ObjectId;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  bookingDate: Date;
  travelDate: Date;
  price: number;
  status: 'confirmed' | 'cancelled' | 'waitlisted';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    seatId: { type: Schema.Types.ObjectId, ref: 'Seat', required: true },
    fromStationId: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
    toStationId: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
    passengerName: { type: String, required: true },
    passengerEmail: { type: String, required: true },
    passengerPhone: { type: String, required: true },
    bookingDate: { type: Date, default: Date.now },
    travelDate: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['confirmed', 'cancelled', 'waitlisted'], default: 'confirmed' },
  },
  { timestamps: true }
);

BookingSchema.index({ seatId: 1, fromStationId: 1, toStationId: 1 });
BookingSchema.index({ passengerEmail: 1 });
BookingSchema.index({ travelDate: 1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);