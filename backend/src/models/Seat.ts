import mongoose, { Schema, Document } from 'mongoose';

export interface ISeat extends Document {
  coachId: mongoose.Types.ObjectId;
  seatNumber: string;
  position: { row: number; column: number };
  isReserved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SeatSchema = new Schema<ISeat>(
  {
    coachId: { type: Schema.Types.ObjectId, ref: 'Coach', required: true },
    seatNumber: { type: String, required: true },
    position: { row: { type: Number, required: true }, column: { type: Number, required: true } },
    isReserved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SeatSchema.index({ coachId: 1, seatNumber: 1 }, { unique: true });

export const Seat = mongoose.model<ISeat>('Seat', SeatSchema);