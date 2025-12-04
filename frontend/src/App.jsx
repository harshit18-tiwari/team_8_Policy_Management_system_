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
    const [view, setView] = useState('home');
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Restore session if token exists
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const username = localStorage.getItem('username');
        if (token) setUser({ token, role, username });
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

    const renderView = () => {
        if (!user && view !== 'home') return <LoginScreen onLogin={handleLogin} />;

        switch (view) {
            case 'home': return user ? <Dashboard user={user} setView={setView} /> : <LoginScreen onLogin={handleLogin} />;
            case 'products': return <ProductList setView={setView} setSelectedProduct={setSelectedProduct} />;
            case 'calculator': return <PremiumCalculator product={selectedProduct} setView={setView} />;
            case 'purchase': return <PurchaseForm product={selectedProduct} user={user} setView={setView} />;
            case 'dashboard': return <Dashboard user={user} setView={setView} />;
            case 'file-claim': return <FileClaim user={user} setView={setView} />;
            case 'admin': return <AdminPanel user={user} />;
            default: return <div style={{ textAlign: 'center', padding: '20px', fontSize: '18px' }}>⚠️ Page Not Found</div>;
        }
    };

    return (
        <div className="app-container" style={styles.appContainer}>
            <Navbar user={user} setView={setView} onLogout={handleLogout} />
            <div className="content" style={styles.content}>
                {renderView()}
            </div>
        </div>
    );
}


// ---------- Login UI Updated ---------- //

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
            res.ok ? onLogin(data) : setError(data.error);
        } catch {
            setError('❌ Unable to reach server');
        }
    };

    return (
        <div style={styles.loginContainer}>
            <h1 style={styles.heading}>🔐 Login</h1>

            {error && <p style={styles.error}>{error}</p>}

            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                />
                <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Login</button>
            </form>

            <p style={styles.hint}>Try: <strong>john / password123</strong> or <strong>admin / admin123</strong></p>
        </div>
    );
}


// ---------- UI Style Objects ---------- //

const styles = {
    appContainer: {
        minHeight: '100vh',
        background: '#f5f7fa',
        fontFamily: 'Arial, sans-serif'
    },
    content: {
        maxWidth: '900px',
        margin: 'auto',
        padding: '20px'
    },
    loginContainer: {
        maxWidth: '380px',
        margin: '100px auto',
        padding: '30px',
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center'
    },
    heading: {
        marginBottom: '20px',
        color: '#222'
    },
    error: {
        color: 'red',
        fontWeight: 'bold',
        marginBottom: '10px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    input: {
        padding: '10px',
        fontSize: '1rem',
        borderRadius: '5px',
        border: '1px solid #bbb'
    },
    button: {
        background: '#2563eb',
        color: 'white',
        padding: '12px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        transition: '0.2s',
    },
    hint: {
        fontSize: '0.8rem',
        marginTop: '15px',
        color: '#444'
    }
};

export default App;
