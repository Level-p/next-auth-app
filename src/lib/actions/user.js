import User from "../models/user.model";

import { connect } from '../mongodb/mongoose'

export const createOrUpdateUser = async (
    id,
    first_name,
    last_name,
    email_addresses,
    username
) => {
    try {
        await connect()

        const user = await User.findOneAndUpdate({clerkId: id}, {
            $set: {
                first_name: first_name,
                last_name: last_name,
                email: email_addresses[0].email,
                username: username
            }
        }, {new: true, upsert: true})
        
        return user
    } catch (error) {
        console.log('Error creating or updating user:', error);
    }
}

export const deleteUser = async (id) => {
    try {
        await connect()

        await User.findOneAndDelete({clerkId: id})
    } catch (error) {
        console.log('Error deleting user:', error);
    }
}