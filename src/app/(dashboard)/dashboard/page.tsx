import React, {FunctionComponent} from 'react';
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

interface DashboardProps {
}

const Dashboard: FunctionComponent<DashboardProps> = async ({}) => {
    const session = await getServerSession(authOptions);

    return (
        <pre>{JSON.stringify(session)}</pre>
    );
};

export default Dashboard;
