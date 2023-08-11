import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {z} from "zod";
import {db} from "@/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const session = await getServerSession(authOptions);

        if (!session) {
            return new Response('Unauthorized', {status: 401});
        }

        const {id: idToDeny} = z.object({id: z.string()}).parse(body);

        await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToDeny);

        return new Response('OK');
    } catch (error) {
        console.log(error)

        if (error instanceof z.ZodError) {
            return new Response('Invalid Request payload', {status: 422});
        }

        return new Response('Invalid Request', {status: 400});
    }
}