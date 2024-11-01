import React from 'react';

const Login = () => {
    return (
        <div>
            <h1>Login Page</h1>
            <p>Redirecting to Shibboleth IdP for authentication... (simulated)</p>
            {/* In a real app, you would use window.location to redirect to your back-end login URL */}
            <button onClick={() => (window.location.href = '/auth/login')}>Login with Shibboleth</button>
        </div>
    )
};

export default Login;
