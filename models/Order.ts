import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IOrder extends Document {
  buyerId: string
  buyerName: string
  buyerEmail: string
  productId: string
  productName: string
  productPrice: number
  quantity: number
  totalPrice: number
  crafterId: string
  crafterName: string
  shippingAddress: string
  notes: string
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'refund_requested' | 'refunded'
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>({
  buyerId: { type: String, required: true },
  buyerName: { type: String, required: true },
  buyerEmail: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  crafterId: { type: String, required: true },
  crafterName: { type: String, default: '' },
  shippingAddress: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled', 'refund_requested', 'refunded'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
export default Order
