import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { whatsappNumber } = body

    if (!whatsappNumber) {
      return NextResponse.json(
        { error: 'WhatsApp number is required' },
        { status: 400 }
      )
    }

    // Validate WhatsApp number format (should start with country code, no spaces or plus)
    const cleanNumber = whatsappNumber.replace(/[\s+]/g, '')
    if (!cleanNumber.match(/^62\d{8,15}$/)) {
      return NextResponse.json(
        { error: 'Invalid WhatsApp number format. Must start with 62 followed by 8-15 digits.' },
        { status: 400 }
      )
    }

    // Upsert the WhatsApp number setting
    const setting = await db.setting.upsert({
      where: { key: 'whatsapp_number' },
      update: { value: cleanNumber },
      create: { key: 'whatsapp_number', value: cleanNumber }
    })

    return NextResponse.json({
      success: true,
      message: 'WhatsApp number configured successfully',
      whatsappNumber: setting.value
    })
  } catch (error) {
    console.error('Error initializing WhatsApp number:', error)
    return NextResponse.json(
      { error: 'Failed to configure WhatsApp number' },
      { status: 500 }
    )
  }
}

// GET to check current configuration
export async function GET() {
  try {
    const setting = await db.setting.findUnique({
      where: { key: 'whatsapp_number' }
    })

    return NextResponse.json({
      configured: !!setting,
      whatsappNumber: setting?.value || null
    })
  } catch (error) {
    console.error('Error checking WhatsApp configuration:', error)
    return NextResponse.json(
      { error: 'Failed to check configuration' },
      { status: 500 }
    )
  }
}
