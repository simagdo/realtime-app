import React from 'react';
import "react-loading-skeleton/dist/skeleton.css";
import Skeleton from "react-loading-skeleton";

const Loading = () => {

    return (
        <div className='w-full flex flex-col gap-3'>
            <Skeleton className='mb-4' height={60} width={500}/>
            <Skeleton height={20} width={150}/>
            <Skeleton height={40} width={400}/>
        </div>
    );
};

export default Loading;
