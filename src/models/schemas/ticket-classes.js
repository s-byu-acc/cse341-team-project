import mongoose from 'mongoose';

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

const ticketClassSchema = new mongoose.Schema(
  {
    class: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    pricePerKm: {
      type: Number,
      required: true,
      min: 0
    },
    amenities: {
      type: [String],
      default: []
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    availableDays: {
      type: [String],
      enum: DAYS,
      default: DAYS
    }
  },
  { collection: 'ticketClasses' }
);

export default mongoose.model('TicketClass', ticketClassSchema);