import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IStore extends Document {
  ownerId: string
  ownerName: string
  ownerEmail: string
  storeName: string
  storeType: 'penumpul' | 'pengepul' | 'pengrajin' | 'distributor'
  description: string
  city: string
  phone: string
  logoUrl: string
  isActive: boolean
  rating: number
  productCount: number
  createdAt: Date
}

const StoreSchema = new Schema<IStore>({
  ownerId: { type: String, required: true, unique: true },
  ownerName: { type: String, required: true },
  ownerEmail: { type: String, required: true },
  storeName: { type: String, required: true },
  storeType: { type: String, enum: ['penumpul', 'pengepul', 'pengrajin', 'distributor'], required: true },
  description: { type: String, default: '' },
  city: { type: String, default: '' },
  phone: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  productCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
})

const Store: Model<IStore> = mongoose.models.Store || mongoose.model<IStore>('Store', StoreSchema)
export default Store
