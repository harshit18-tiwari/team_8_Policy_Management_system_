import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import ProductList from './pages/ProductList.jsx';
import PremiumCalculator from './pages/PremiumCalculator.jsx';
import PurchaseForm from './pages/PurchaseForm.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FileClaim from './pages/FileClaim.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('home'); // Simple routing state
    const [selectedProduct, setSelectedProduct] = useState(null); // For passing data between views

    // Check for token on load
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const username = localStorage.getItem('username');
        if (token) {
            setUser({ token, role, username });
        }
    }, []);

    const handleLogin = (userData) => {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('role', userData.role);
        localStorage.setItem('username', userData.username);
        setUser(userData);
        setView('dashboard');
    };

    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
        setView('home');
    };

    // Simple "Router"
    const renderView = () => {
        if (!user && view !== 'home') return <LoginScreen onLogin={handleLogin} />;

        switch (view) {
            case 'home':
                return user ? <Dashboard user={user} setView={setView} /> : <LoginScreen onLogin={handleLogin} />;
            case 'products':
                return <ProductList setView={setView} setSelectedProduct={setSelectedProduct} />;
            case 'calculator':
                return <PremiumCalculator product={selectedProduct} setView={setView} />;
            case 'purchase':
                return <PurchaseForm product={selectedProduct} user={user} setView={setView} />;
            case 'dashboard':
                return <Dashboard user={user} setView={setView} />;
            case 'file-claim':
                return <FileClaim user={user} setView={setView} />;
            case 'admin':
                return <AdminPanel user={user} />;
            default:
                return <div>404 Not Found</div>;
        }
    };

    return (
        <div className="app-container">
            <Navbar user={user} setView={setView} onLogout={handleLogout} />
            <div className="content">
                {renderView()}
            </div>
        </div>
    );
}

// Inline Login Component for simplicity
function LoginScreen({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                onLogin(data);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Connection refused');
        }
    };

    return (
        <div className="card login-card">
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
                <button type="submit">Login</button>
            </form>
            <p style={{ fontSize: '0.8rem' }}>Try: john/password123 or admin/admin123</p>
        </div>
    );
}

export default App;
