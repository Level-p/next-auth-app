import { Webhook } from "svix"
import { headers } from "next/headers"
import { createOrUpdateUser, deleteUser } from "@/lib/actions/user"

export default async function POST(req) {

    const WEBHOOK_SECRET = process.env. WEBHOOK_SECRET

    if(!WEBHOOK_SECRET) {
        throw new Error('Please add  WEBHOOK_SECRET from Clerk Dashboaerd to .env or .env.local')
    }

    // Get the headers
    const headerPayload = headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-tiemstamp')
    const svix_signatiure = headerPayload.get('svix-signature')

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

    if(eventType === 'user.created' || eventType === "user.updated") {
        const { id,  first_name, last_name, email_addresses, username} = evt.data
        try {
            await createOrUpdateUser ( 
                id,
                first_name,
                last_name,
                email_addresses,
                username
            )
            return new Response('User is created or updated', {
                status: 200
            })
        } catch (error) {
            console.log('Error creating or updating user:', error);
            return new Response('Error occured', {
                status: 400
            })
        }
    }

    if(eventType === 'user.deleted') {
        const { id } = evt.data
        try {
            await deleteUser(id)
            return new Response('User is deleted', {
                status: 200
            })
        } catch (error) {
            console.log('Error deleting user:', error);
            return new Response('Error occured', {
                status: 400
            })
        }
    }

  return new Response ('', {status: 200})
}