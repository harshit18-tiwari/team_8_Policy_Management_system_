import React, { useState } from 'react';
import { fetchWithAuth } from '../api';

/**
 * PurchaseForm Component
 * -----------------------
 * Handles final confirmation before creating a policy.
 * Accepts:
 *  - product : Selected insurance product
 *  - user    : Logged-in user details
 *  - setView : Function to change visible screen (products/dashboard)
 */
function PurchaseForm({ product, user, setView }) {

    // Stores error/success message
    const [status, setStatus] = useState('');

    /**
     * handlePurchase()
     * ----------------
     * Sends purchase request to backend using fetchWithAuth().
     * For prototype: uses product.base_price directly as premium amount.
     */
    const handlePurchase = async () => {
        const res = await fetchWithAuth('/policies/purchase', {
            method: 'POST',
            body: JSON.stringify({
                productId: product.id,
                premiumAmount: product.base_price   // simplified premium logic for MVP
            })
        });

        // If successful, return to dashboard for payment
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

            {/* Display product details */}
            <p>Product: {product.name}</p>
            <p>Base Cost: ${product.base_price}</p>

            {/* Display user details */}
            <p>User: {user.username}</p>

            {/* Mock KYC section */}
            <div className="kyc-mock">
                <p><em>(KYC Documents are assumed verified for this prototype)</em></p>
            </div>

            {/* Action buttons */}
            <button onClick={handlePurchase}>Confirm & Create Policy</button>
            <button className="secondary" onClick={() => setView('products')}>
                Cancel
            </button>

            {/* Show error message if exists */}
            {status && <p>{status}</p>}
        </div>
    );
}

export default PurchaseForm;
