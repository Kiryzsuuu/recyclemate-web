import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProduct extends Document {
  name: string
  price: number
  material: string
  description: string
  imageUrl: string
  stock: number
  isActive: boolean
  sellerRole: string
  productType: 'waste' | 'material' | 'handcraft' | 'retail'
  crafterId: string
  crafterName: string
  crafterCity: string
  rating: number
  ratingCount: number
  createdAt: Date
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  material: { type: String, default: '' },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  sellerRole: { type: String, default: '' },
  productType: { type: String, enum: ['waste', 'material', 'handcraft', 'retail'], required: true },
  crafterId: { type: String, required: true },
  crafterName: { type: String, default: '' },
  crafterCity: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
})

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
export default Product
