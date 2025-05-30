import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Testing from './pages/Testing';

const App: React.FC = () => {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate fetching the logged-in user from the back-end
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/protected');
        setUser(response.data.user);
      } catch (error) {
        console.error('User not authenticated', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {/* <nav>
          <Link to="/">Home</Link>
          {user ? (
            <>
              <Link to="/protected">Protected Page</Link>
              <span>Welcome, {user.name}!</span>
            </>
          ) : (
            <Link to="/auth/login">Login</Link>
          )}
        </nav> */}
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
