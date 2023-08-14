'use client'

import React, {FunctionComponent, useEffect, useState} from 'react';
import {Check, UserPlus, X} from "lucide-react";
import axios from "axios";
import {useRouter} from "next/navigation";
import {pusherClient} from "@/lib/pusher";
import {toPusherKey} from "@/lib/utils";

interface FriendRequestsProps {
    incomingFriendRequests: IncomingFriendRequest[];
    sessionId: string;
}

const FriendRequests: FunctionComponent<FriendRequestsProps> = ({incomingFriendRequests, sessionId}) => {
    const [friendRequests, setFriendRequests] = useState(incomingFriendRequests);
    const router = useRouter();

    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));

        const friendRequestsHandler = ({senderId, senderEmail}: IncomingFriendRequest) => {
            console.log('new friend request');
            setFriendRequests((prevState) => [...prevState, {
                senderId, senderEmail
            }]);
        }

        pusherClient.bind('incoming_friend_requests', friendRequestsHandler);

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`));
            pusherClient.unbind('incoming_friend_requests', friendRequestsHandler);
        }
    }, [sessionId]);

    const acceptFriend = async (senderId: string) => {
        await axios.post('/api/friends/accept', {id: senderId});

        setFriendRequests((prevState) => prevState.filter(request => request.senderId !== senderId));

        router.refresh();
    }

    const denyFriend = async (senderId: string) => {
        await axios.post('/api/friends/deny', {id: senderId});

        setFriendRequests((prevState) => prevState.filter(request => request.senderId !== senderId));

        router.refresh();
    }

    return (
        <>
            {friendRequests.length === 0 ? (
                <p className='text-sm text-zinc-500'>
                    Nothing to show here...
                </p>
            ) : (
                friendRequests.map(friendRequest => (
                    <div
                        key={friendRequest.senderId}
                        className='flex gap-4 items-center'>
                        <UserPlus className='text-black'/>
                        <p className='font-medium text-lg'>{friendRequest.senderEmail}</p>
                        <button
                            onClick={() => acceptFriend(friendRequest.senderId)}
                            aria-label='accept friend'
                            className='w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md'>
                            <Check className='font-semibold text-white w-3/h h-3/4'/>
                        </button>
                        <button
                            onClick={() => denyFriend(friendRequest.senderId)}
                            aria-label='deny friend'
                            className='w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md'>
                            <X className='font-semibold text-white w-3/h h-3/4'/>
                        </button>
                    </div>
                ))
            )}
        </>
    );
};

export default FriendRequests;
