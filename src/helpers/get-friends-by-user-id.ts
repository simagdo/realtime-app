import {fetchRedis} from "@/helpers/redis";

export const getFriendsByUserId = async (userId: string) => {
    // Retrieve Friends for current User
    const friendIDs = await fetchRedis(
        'smembers',
        `user:${userId}:friends`
    ) as string[];

    return await Promise.all(
        friendIDs.map(async (friendId) => {
            const friend = await fetchRedis(
                'get',
                `user:${friendId}`
            ) as string;
            return JSON.parse(friend) as User;
        })
    );
}