import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: 'admin' | 'pembeli' | 'penumpul' | 'pengepul' | 'pengrajin' | 'distributor'
  city: string
  phone: string
  bio: string
  avatarUrl: string
  storeId: string
  isDeactivated: boolean
  resetToken?: string
  resetTokenExpires?: Date
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'pembeli', 'penumpul', 'pengepul', 'pengrajin', 'distributor'], default: 'pembeli' },
  city: { type: String, default: '' },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  storeId: { type: String, default: '' },
  isDeactivated: { type: Boolean, default: false },
  resetToken: { type: String, default: '' },
  resetTokenExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
})

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export default User
