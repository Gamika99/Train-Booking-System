import mongoose, { Schema, Document } from 'mongoose';

export interface ICoach extends Document {
  name: string;
  type: 'reserved' | 'unreserved';
  capacity: number;
  coachNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

const CoachSchema = new Schema<ICoach>(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: ['reserved', 'unreserved'], required: true },
    capacity: { type: Number, required: true, min: 1 },
    coachNumber: { type: Number, required: true, unique: true },
  },
  { timestamps: true }
);

export const Coach = mongoose.model<ICoach>('Coach', CoachSchema);