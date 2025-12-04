import React, { useState } from 'react';
import { fetchWithAuth } from '../api';

function PurchaseForm({ product, user, setView }) {
    // In a real app, we'd pass the calculated premium here properly
    // For simplicity, we just use the base price or a fixed logic here
    // or fetch the calculation again silently.
    const [status, setStatus] = useState('');

    const handlePurchase = async () => {
        const res = await fetchWithAuth('/policies/purchase', {
            method: 'POST',
            body: JSON.stringify({
                productId: product.id,
                premiumAmount: product.base_price // simplified for prototype
            })
        });

        if (res.ok) {
            alert("Policy Created! Redirecting to Dashboard to Pay.");
            setView('dashboard');
        } else {
            setStatus("Error creating policy");
        }
    };

    return (
        <div className="card">
            <h2>Confirm Purchase</h2>
            <p>Product: {product.name}</p>
            <p>Base Cost: ${product.base_price}</p>
            <p>User: {user.username}</p>

            <div className="kyc-mock">
                <p><em>(KYC Documents are assumed verified for this prototype)</em></p>
            </div>

            <button onClick={handlePurchase}>Confirm & Create Policy</button>
            <button className="secondary" onClick={() => setView('products')}>Cancel</button>
            {status && <p>{status}</p>}
        </div>
    );
}

export default PurchaseForm;
