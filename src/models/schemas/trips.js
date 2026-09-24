import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    startStation: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    endStation: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    distance: {
      type: Number,
      required: true,
      min: 0,
    },
    highlights: {
      type: [String],
      required: true,
      default: [],
    },
    bestSeason: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    operatingMonths: {
      type: [
        {
          type: Number,
          min: 1,
          max: 12,
        },
      ],
      required: true,
      default: [],
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);

export default Trip;