import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDonation extends Document {
  donorId: string
  donorName: string
  donorEmail: string
  itemName: string
  description: string
  material: string
  quantity: number
  imageUrl: string
  status: 'pending' | 'matched' | 'processing' | 'completed' | 'cancelled'
  createdAt: Date
}

const DonationSchema = new Schema<IDonation>({
  donorId: { type: String, required: true },
  donorName: { type: String, required: true },
  donorEmail: { type: String, required: true },
  itemName: { type: String, required: true },
  description: { type: String, default: '' },
  material: { type: String, default: '' },
  quantity: { type: Number, default: 1 },
  imageUrl: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'matched', 'processing', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
})

const Donation: Model<IDonation> = mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema)
export default Donation
