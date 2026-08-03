import mongoose, { Schema, Document } from 'mongoose';

export interface IStation extends Document {
  name: string;
  code: string;
  order: number;
  distanceFromStart: number;
  createdAt: Date;
  updatedAt: Date;
}

const StationSchema = new Schema<IStation>(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    order: { type: Number, required: true, unique: true },
    distanceFromStart: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Station = mongoose.model<IStation>('Station', StationSchema);