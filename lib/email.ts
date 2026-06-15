import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM = `"RecycleMate" <${process.env.SMTP_USER}>`

export async function sendWelcome(toName: string, toEmail: string) {
  await transporter.sendMail({
    from: FROM,
    to: toEmail,
    subject: 'Selamat Datang di RecycleMate!',
    html: `<h2>Halo, ${toName}!</h2><p>Selamat datang di RecycleMate — marketplace produk daur ulang terbaik Indonesia.</p><p>Mulai jelajahi produk dan bergabung dengan komunitas kami!</p><br/><p>Salam,<br/>Tim RecycleMate</p>`,
  })
}

export async function sendOrderConfirmation(
  buyerName: string,
  buyerEmail: string,
  productName: string,
  quantity: number,
  total: number,
  crafterName: string
) {
  await transporter.sendMail({
    from: FROM,
    to: buyerEmail,
    subject: 'Pesanan Kamu Berhasil Dibuat!',
    html: `<h2>Pesanan Dikonfirmasi</h2><p>Halo ${buyerName},</p><p>Pesanan kamu telah berhasil dibuat:</p><ul><li><b>Produk:</b> ${productName}</li><li><b>Jumlah:</b> ${quantity}</li><li><b>Total:</b> Rp ${total.toLocaleString('id-ID')}</li><li><b>Penjual:</b> ${crafterName}</li></ul><p>Terima kasih telah berbelanja di RecycleMate!</p>`,
  })
}

export async function sendDonationConfirmation(
  donorName: string,
  donorEmail: string,
  itemName: string,
  material: string,
  quantity: number
) {
  await transporter.sendMail({
    from: FROM,
    to: donorEmail,
    subject: 'Donasi Limbah Kamu Diterima!',
    html: `<h2>Donasi Diterima</h2><p>Halo ${donorName},</p><p>Donasi limbah kamu telah kami terima:</p><ul><li><b>Item:</b> ${itemName}</li><li><b>Material:</b> ${material}</li><li><b>Jumlah:</b> ${quantity}</li></ul><p>Terima kasih telah berkontribusi untuk lingkungan yang lebih baik!</p>`,
  })
}

export async function sendStatusUpdate(
  toName: string,
  toEmail: string,
  subject: string,
  message: string
) {
  await transporter.sendMail({
    from: FROM,
    to: toEmail,
    subject,
    html: `<p>Halo ${toName},</p><p>${message}</p><br/><p>Salam,<br/>Tim RecycleMate</p>`,
  })
}
