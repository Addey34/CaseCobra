import OrderReceivedEmail from '@/components/emails/OrderReceivedEmail'
import { db } from '@/db'
import { stripe } from '@/lib/stripe'
import { Country } from '@prisma/client'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import Stripe from 'stripe'

const resend = new Resend(process.env.RESEND_API_KEY)

function validateCountry(country: string | null | undefined): Country {
  if (!country) return 'USA' 
  const validCountries: Country[] = ['USA', 'CANADA', 'FRANCE'] 
  return validCountries.includes(country as Country) ? (country as Country) : 'USA'
}

function createAddressData(details: Stripe.Checkout.Session.CustomerDetails | Stripe.Checkout.Session.ShippingDetails) {
  const address = details.address
  return {
    id: '',
    name: details.name || 'Unknown',
    street: address?.line1 || 'Unknown',
    city: address?.city || 'Unknown',
    postalCode: address?.postal_code || 'Unknown',
    country: validateCountry(address?.country),
    state: address?.state || null,
    phoneNumber: details.phone || null,
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return new NextResponse('Invalid signature', { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
    
      if (!session.customer_details?.email) {
        throw new Error('Missing user email')
      }
    
      const { userId, orderId } = session.metadata || {}
    
      if (!userId || !orderId) {
        throw new Error('Invalid request metadata')
      }
    
      const shippingAddressData = createAddressData(session.shipping_details!)
      const billingAddressData = createAddressData(session.customer_details!)
      
      const shippingAddress = await db.shippingAddress.create({ data: shippingAddressData })
      const billingAddress = await db.billingAddress.create({ data: billingAddressData })
    
      const updatedOrder = await db.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          paidAt: new Date(),
          shippingAddressId: shippingAddress.id,
          billingAddressId: billingAddress.id,
        },
      })

      await resend.emails.send({
        from: 'CaseCobra <me@adrianguichard.com>',
        to: [session.customer_details.email],
        subject: 'Thanks for your order!',
        react: OrderReceivedEmail({
          orderId,
          orderDate: updatedOrder.createdAt.toLocaleDateString(),
          shippingAddress: shippingAddressData,
        }),
      })
    }

    return NextResponse.json({ result: event, ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: 'Something went wrong', ok: false },
      { status: 500 }
    )
  }
}