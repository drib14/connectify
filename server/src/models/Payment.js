import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number, // in PHP
      required: true,
    },
    referenceId: {
      type: String, // PayMongo session ID or payment ID
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', PaymentSchema);
