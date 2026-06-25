import mongoose, { Schema, Document, Model } from 'mongoose'

export type PaymentMethod = 'transfer_bca' | 'transfer_bri' | 'transfer_mandiri' | 'qris' | 'cod'
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refund_requested' | 'refunded'

export interface IOrder extends Document {
  buyerId: string
  buyerName: string
  buyerEmail: string
  productId: string
  productName: string
  productPrice: number
  productImageUrl: string
  quantity: number
  subtotal: number
  shippingCost: number
  totalPrice: number
  crafterId: string
  crafterName: string
  // Shipping
  recipientName: string
  recipientPhone: string
  shippingAddress: string
  shippingCity: string
  notes: string
  // Payment
  paymentMethod: PaymentMethod
  paymentProofUrl: string
  paidAt?: Date
  // Tracking
  trackingNumber: string
  status: OrderStatus
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
  productImageUrl: { type: String, default: '' },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  crafterId: { type: String, required: true },
  crafterName: { type: String, default: '' },
  recipientName: { type: String, default: '' },
  recipientPhone: { type: String, default: '' },
  shippingAddress: { type: String, default: '' },
  shippingCity: { type: String, default: '' },
  notes: { type: String, default: '' },
  paymentMethod: { type: String, enum: ['transfer_bca', 'transfer_bri', 'transfer_mandiri', 'qris', 'cod'], default: 'transfer_bca' },
  paymentProofUrl: { type: String, default: '' },
  paidAt: { type: Date },
  trackingNumber: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refund_requested', 'refunded'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
export default Order
