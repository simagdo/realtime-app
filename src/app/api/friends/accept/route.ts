import {z} from "zod";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {fetchRedis} from "@/helpers/redis";
import {db} from "@/lib/db";
import {pusherServer} from "@/lib/pusher";
import {toPusherKey} from "@/lib/utils";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {id: idToAdd} = z.object({id: z.string()}).parse(body);

        const session = await getServerSession(authOptions);

        if (!session) {
            return new Response('Unauthorized', {status: 401});
        }

        // Verify both Users are not already Friends
        const isAlreadyFriends = await fetchRedis(
            'sismember',
            `user:${session.user.id}:friends`,
            idToAdd);

        if (isAlreadyFriends) {
            return new Response('Already Friends', {status: 400});
        }

        const hasFriendRequest = await fetchRedis(
            'sismember',
            `user:${session.user.id}:incoming_friend_requests`,
            idToAdd
        );

        if (!hasFriendRequest) {
            return new Response('No Friend Request', {status: 400});
        }

        const [userRaw, friendRaw] = (await Promise.all([
            fetchRedis('get', `user:${session.user.id}`),
            fetchRedis('get', `user:${idToAdd}`)
        ])) as [string, string];

        const user = JSON.parse(userRaw) as User;
        const friend = JSON.parse(friendRaw) as User;

        // Notify added User
        await Promise.all([
            pusherServer.trigger(toPusherKey(`user${idToAdd}:friends`), 'new_friend', user),
            pusherServer.trigger(toPusherKey(`user${session.user.id}:friends`), 'new_friend', friend),
            db.sadd(`user:${session.user.id}:friends`, idToAdd),
            db.sadd(`user:${idToAdd}:friends`, session.user.id),
            //await db.srem(`user:${idToAdd}:outbound_friend_requests`, session.user.id);
            db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd)
        ])

        pusherServer.trigger(toPusherKey(`user${idToAdd}:friends`), 'new_friend', '');

        return new Response('OK');
    } catch (error) {
        console.log(error)

        if (error instanceof z.ZodError) {
            return new Response('Invalid Request payload', {status: 422});
        }

        return new Response('Invalid Request', {status: 400});
    }
}