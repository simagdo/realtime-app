import React, {FC} from 'react';
import AddFriendButton from "@/components/AddFriendButton";

const Add: FC = () => {
    return (
        <main className='pt-8'>
            <h1 className='font-bold text-5xl mb-8'>Add a Friend</h1>
            <AddFriendButton/>
        </main>
    );
};

export default Add;