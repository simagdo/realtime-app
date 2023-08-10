import React from 'react';
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {notFound} from "next/navigation";
import {fetchRedis} from "@/helpers/redis";
import FriendRequests from "@/components/FriendRequests";

const Requests = async () => {
    const session = await getServerSession(authOptions);

    if (!session) {
        notFound();
    }

    // IDs of People who sent Current Logged in User a Friend Request
    const incomingSenderIDs = (await fetchRedis(
        'smembers',
        `user:${session.user.id}:incoming_friend_requests`
    )) as string[];

    const incomingFriendRequests = await Promise.all(
        incomingSenderIDs.map((async (senderId) => {
            const sender = await fetchRedis(
                'get',
                `user:${senderId}`) as string
            const senderParsed = JSON.parse(sender) as User;
            return {
                senderId,
                senderEmail: senderParsed.email
            }
        }))
    )

    console.table(incomingFriendRequests)

    return (
        <main className='pt-8'>
            <h1 className='font-bold text-5xl mb-8'>Add a Friend</h1>
            <div className='flex flex-col gap-4'>
                <FriendRequests
                    incomingFriendRequests={incomingFriendRequests}
                    sessionId={session.user.id}/>
            </div>
        </main>
    );
};

export default Requests;
