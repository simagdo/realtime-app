import {addFriendValidator} from "@/lib/validations/add-friend";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {fetchRedis} from "@/helpers/redis";
import {db} from "@/lib/db";
import {z} from "zod";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {email: emailToAdd} = addFriendValidator.parse(body.email);

        const idToAdd = await fetchRedis('get', `user:email:${emailToAdd}`) as string;

        console.log({emailToAdd, idToAdd})

        if (!idToAdd) {
            return new Response('This Person does not exist.', {status: 400});
        }

        const session = await getServerSession(authOptions);

        if (!session) {
            return new Response('Unauthorized', {status: 401});
        }

        if (idToAdd === session.user.id) {
            return new Response('You cannot add yourself as a Friend!', {status: 400});
        }

        // Check if User is already added
        const isAlreadyAdded = await fetchRedis(
            'sismember',
            `user:${idToAdd}:incoming_friend_requests`, session.user.id
        ) as 0 | 1;

        if (isAlreadyAdded) {
            return new Response('Already added this User', {status: 400});
        }

        // Check if User is already your Friend
        const isAlreadyFriend = await fetchRedis(
            'sismember',
            `user:${session.user.id}:friends`, idToAdd
        ) as 0 | 1;

        if (isAlreadyFriend) {
            return new Response('Already Friends with this User', {status: 400});
        }

        // Valid Request, send Friend Request
        db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

        return new Response('OK');
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid Request Payload', {status: 422});
        }

        return new Response('Invalid Request', {status: 400});
    }
}