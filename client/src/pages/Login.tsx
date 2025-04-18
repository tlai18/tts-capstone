import React from 'react';

const Login = () => {
    return (
        <div>
            <h1>Login Page</h1>
            <p>Redirecting to Shibboleth IdP for authentication... (simulated)</p>
            <button onClick={() => (window.location.href = '/auth/login')}>Login with Shibboleth</button>
        </div>
    )
};

export default Login;
