import {Webhook} from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function POST (req:Request){
   const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

   if (!WEBHOOK_SECRET) {
    throw new Error("please add webhook secret in env file")
   }

const HeaderPayload = await headers()
const svix_id = HeaderPayload.get("svix-id")
const svix_timestamp = HeaderPayload.get("svix-timestamp")
const svix_signature = HeaderPayload.get("svix-signature")

if(!svix_id || !svix_signature|| !svix_timestamp){
    return new Response("Error occured - No svix headers")
}
  const payload = await req.text()
  const body  = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  

  let evt :WebhookEvent;
  try {
    evt = wh.verify(body,{
        "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying Webhook",err)
    return new  Response("Error occured",{status:400})
  }
console.log(evt);


const eventType = evt.type
 
//logs
if (eventType==="user.created") {
    try {
        const{email_addresses,primary_email_address_id} = evt.data
        //log practice

        const primaryEmail = email_addresses.find(
            (email)=>email.id ==primary_email_address_id //finding primaryemail id from array
        )
               if(!primaryEmail){
                return new Response("No Primary email found",{status:400})
               }
               //create a user in neon
               const newUser  =  await prisma.user.create({
                data:{
                    id:evt.data.id!,
                    email:primaryEmail.email_address,
                    name:evt.data.username
                }
               })
               console.log("New user created",newUser);
               
    } catch (err) {
         return new  Response("Error creating user in db",{status:400})
    }
}
  

return new Response("Webhook recieved successfully", { status: 200 });
}
