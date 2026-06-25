export interface PaymentOption {
  id: 'transfer_bca' | 'transfer_bri' | 'transfer_mandiri' | 'qris' | 'cod'
  label: string
  group: 'transfer' | 'instant' | 'cod'
  account?: string
  accountName?: string
  description: string
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: 'transfer_bca', label: 'Transfer BCA', group: 'transfer', account: '1234567890', accountName: 'PT RecycleMate Indonesia', description: 'Transfer ke Virtual Account BCA' },
  { id: 'transfer_bri', label: 'Transfer BRI', group: 'transfer', account: '0987654321', accountName: 'PT RecycleMate Indonesia', description: 'Transfer ke Virtual Account BRI' },
  { id: 'transfer_mandiri', label: 'Transfer Mandiri', group: 'transfer', account: '1122334455', accountName: 'PT RecycleMate Indonesia', description: 'Transfer ke Virtual Account Mandiri' },
  { id: 'qris', label: 'QRIS', group: 'instant', description: 'Scan QR untuk bayar (GoPay, OVO, DANA, dll)' },
  { id: 'cod', label: 'Bayar di Tempat (COD)', group: 'cod', description: 'Bayar tunai saat barang diterima' },
]

export const DEFAULT_SHIPPING_COST = 15000

export function getPaymentOption(id: string): PaymentOption | undefined {
  return PAYMENT_OPTIONS.find(p => p.id === id)
}

export const ORDER_STATUS_META: Record<string, { label: string; color: string; step: number }> = {
  pending: { label: 'Menunggu Pembayaran', color: 'bg-yellow-100 text-yellow-700', step: 1 },
  paid: { label: 'Pembayaran Dikonfirmasi', color: 'bg-blue-100 text-blue-700', step: 2 },
  processing: { label: 'Diproses Penjual', color: 'bg-indigo-100 text-indigo-700', step: 2 },
  shipped: { label: 'Dalam Pengiriman', color: 'bg-purple-100 text-purple-700', step: 3 },
  completed: { label: 'Selesai', color: 'bg-green-100 text-green-700', step: 4 },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700', step: 0 },
  refund_requested: { label: 'Permintaan Refund', color: 'bg-orange-100 text-orange-700', step: 0 },
  refunded: { label: 'Dana Dikembalikan', color: 'bg-gray-100 text-gray-600', step: 0 },
}
