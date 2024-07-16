'use server'

import { BASE_PRICE, PRODUCT_PRICES } from '@/config/products'
import { db } from '@/db'
import { stripe } from '@/lib/stripe'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { CaseFinish, CaseMaterial, Country, Order, Prisma } from '@prisma/client'

export const createCheckoutSession = async ({
  configId,
}: {
  configId: string
}) => {
  const configuration = await db.configuration.findUnique({
    where: { id: configId },
  })

  if (!configuration) {
    throw new Error('No such configuration found')
  }

  const { getUser } = getKindeServerSession()
  const kindeUser = await getUser()

  if (!kindeUser || !kindeUser.id || !kindeUser.email) {
    throw new Error('You need to be logged in')
  }

  // Vérifier si l'utilisateur existe déjà dans la base de données
  let user = await db.user.findUnique({
    where: { email: kindeUser.email },
  })

  // Si l'utilisateur n'existe pas, le créer
  if (!user) {
    user = await db.user.create({
      data: {
        email: kindeUser.email,
        // Ajoutez d'autres champs si nécessaire
      },
    })
  }

  const { finish, material } = configuration

  let price = BASE_PRICE
  if (finish === CaseFinish.TEXTURED) {
    price += PRODUCT_PRICES.finish.textured
  }
  if (material === CaseMaterial.POLYCARBONATE) {
    price += PRODUCT_PRICES.material.polycarbonate
  }

  let order: Order | undefined = undefined

  const existingOrder = await db.order.findFirst({
    where: {
      userId: user.id,
      configurationId: configuration.id,
    },
  })

  console.log(user.id, configuration.id)

  if (existingOrder) {
    order = existingOrder
  } else {
    // Créer des adresses temporaires
    const tempAddress: Prisma.BillingAddressCreateInput = {
      name: "To be updated",
      street: "To be updated",
      city: "To be updated",
      postalCode: "00000",
      country: Country.USA,
    }

    order = await db.order.create({
      data: {
        amount: price / 100,
        user: {
          connect: { id: user.id }
        },
        configuration: {
          connect: { id: configuration.id }
        },
        billingAddress: {
          create: tempAddress
        },
        shippingAddress: {
          create: tempAddress
        }
      },
    })
  }

  const product = await stripe.products.create({
    name: 'Custom iPhone Case',
    images: [configuration.imageUrl],
    default_price_data: {
      currency: 'USD',
      unit_amount: price,
    },
  })

  const stripeSession = await stripe.checkout.sessions.create({
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/preview?id=${configuration.id}`,
    payment_method_types: ['card', 'paypal'],
    mode: 'payment',
    shipping_address_collection: { allowed_countries: ['FR', 'DE', 'GB', 'IT', 'ES', 'US', 'CA'] },
    metadata: {
      userId: user.id,
      orderId: order.id,
    },
    line_items: [{ price: product.default_price as string, quantity: 1 }],
  })

  return { url: stripeSession.url }
}