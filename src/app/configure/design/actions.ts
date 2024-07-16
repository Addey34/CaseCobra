'use server'

import { db } from '@/db'
import { CaseColor, CaseFinish, CaseMaterial, PhoneModel } from '@prisma/client'

export type SaveConfigArgs = {
  color: CaseColor
  finish: CaseFinish
  material: CaseMaterial
  model: string  // Change this to string to accept any input
  configId: string
}

export async function saveConfig({
  color,
  finish,
  material,
  model,
  configId,
}: SaveConfigArgs) {
  console.log("Received values", {color, finish, material, model, configId})

  // Convert the model string to the correct PhoneModel enum value
  const convertedModel = model.replace('IPHONE', 'IPHONE_') as PhoneModel

  // Validate that the converted model is a valid PhoneModel
  if (!Object.values(PhoneModel).includes(convertedModel)) {
    throw new Error(`Invalid phone model: ${model}`)
  }

  await db.configuration.update({
    where: { id: configId },
    data: { 
      color, 
      finish, 
      material, 
      model: convertedModel  // Use the converted model here
    },
  })

  console.log("Updated values", {color, finish, material, model: convertedModel, configId})
}