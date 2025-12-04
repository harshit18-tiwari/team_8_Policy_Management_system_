import React from 'react';

function Navbar({ user, setView, onLogout }) {
    return (
        <nav className="navbar">
            <div className="logo" onClick={() => setView('home')}>🛡 InsureTech</div>
            <div className="links">
                {user ? (
                    <>
                        <button onClick={() => setView('dashboard')}>Dashboard</button>
                        <button onClick={() => setView('products')}>Buy Policy</button>
                        {['ADMIN', 'ADJUSTER', 'UNDERWRITER'].includes(user.role) && (
                            <button onClick={() => setView('admin')}>Admin Panel</button>
                        )}
                        <span>Hi, {user.username}</span>
                        <button className="logout-btn" onClick={onLogout}>Logout</button>
                    </>
                ) : (
                    <span>Welcome, Guest</span>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
