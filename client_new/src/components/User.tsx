import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
    name: string;
    email: string;
}

const User: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        axios.get('/api/user')
            .then(response => setUser(response.data))
            .catch(() => setUser(null));
    }, []);

    return (
        <div>
            {user ? (
                <div>
                    <h1>Welcome, {user.name}</h1>
                    <p>Email: {user.email}</p>
                </div>
            ) : (
                <p>Please log in.</p>
            )}
        </div>
    );
};

export default User;
