import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName,
      customerPhone,
      customerAddress,
      paymentMethod,
      items
    } = body

    // Calculate total
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)

    // Save order to database
    const order = await db.order.create({
      data: {
        customerName,
        customerPhone,
        customerAddress,
        paymentMethod,
        totalAmount,
        items: JSON.stringify(items),
        status: 'pending'
      }
    })

    // Get WhatsApp number from settings
    const setting = await db.setting.findUnique({
      where: { key: 'whatsapp_number' }
    })

    if (!setting) {
      return NextResponse.json(
        { error: 'WhatsApp number not configured' },
        { status: 400 }
      )
    }

    const whatsappNumber = setting.value

    // Format message for WhatsApp
    let message = `🍽️ *New Order Received*\n\n`
    message += `📋 Order ID: ${order.id}\n`
    message += `👤 Customer: ${customerName}\n`
    message += `📱 Phone: ${customerPhone}\n`
    message += `📍 Address: ${customerAddress}\n`
    message += `💳 Payment: ${paymentMethod}\n\n`
    message += `🛒 *Order Details:*\n`

    items.forEach((item: any, index: number) => {
      message += `${index + 1}. ${item.name}\n`
      message += `   Qty: ${item.quantity} x Rp${item.price.toLocaleString()}\n`
      message += `   Subtotal: Rp${(item.price * item.quantity).toLocaleString()}\n`
    })

    message += `\n💰 *Total: Rp${totalAmount.toLocaleString()}*\n`
    message += `\n📅 ${new Date().toLocaleString('id-ID')}`

    // Create WhatsApp URL
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

    return NextResponse.json({
      success: true,
      orderId: order.id,
      whatsappUrl
    })
  } catch (error) {
    console.error('Error processing checkout:', error)
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    )
  }
}
