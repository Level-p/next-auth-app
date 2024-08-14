import { Webhook } from "svix"
import { headers } from "next/headers"

export default async function POST(req) {

    const WEBHOOK_SECRET = process.env. WEBHOOK_SECRET

    if(!WEBHOOK_SECRET) {
        throw new Error('Please add  WEBHOOK_SECRET from Clerk Dashboaerd to .env or .env.local')
    }

    // Get the headers
    const headerPayload = headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-tiemstamp')
    const svix_signatiure = headerPayload.get('dvix-signature')

    // If there are no headers, error out
    if(!svix_id || !svix_signatiure || !svix_timestamp) {
        return new Response ('Error occured -- no svix headers', {
            status: 400
        })
    }

    // Get body 
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt

    // Verify the payload with headers
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature":svix_signatiure
        }) 
    } catch (err) {
        console.log('Error verifying webhooks:', err);
        return new Response('Error occured', {
            status: 400
        })
    }

    // Do something with the payload
    // For this guide, you simply log the payload to the console
    const { id } = evt.data
    const eventType = evt.type
    console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
    console.log('Webhook body:', body);

    if(eventType === 'user.created') {
        console.log('User created');
    }
    if(eventType === 'user.updated') {
        console.log('User updated');
    }

  return new Response ('', {status: 200})
}