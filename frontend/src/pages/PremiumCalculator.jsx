import React, { useState } from 'react';
import { fetchWithAuth } from '../api';

/**
 * PremiumCalculator Component
 * ---------------------------
 * Allows user to calculate the insurance premium for a selected product
 * based on age and coverage amount.
 */
function PremiumCalculator({ product, setView }) {
    // Form state
    const [age, setAge] = useState(30);
    const [coverage, setCoverage] = useState(10000);

    // Store the calculated premium quote
    const [quote, setQuote] = useState(null);

    // Return early if no product is selected
    if (!product) return <div>No product selected.</div>;

    /**
     * Handle premium calculation
     * Sends age and coverage to backend API and updates the quote state
     */
    const handleCalculate = async () => {
        const res = await fetchWithAuth('/premium/calculate', {
            method: 'POST',
            body: JSON.stringify({
                productId: product.id,
                age: parseInt(age),
                coverageAmount: parseInt(coverage)
            })
        });
        const data = await res.json();
        setQuote(data);
    };

    return (
        <div className="card">
            <h2>Calculate Premium: {product.name}</h2>

            {/* Age Input */}
            <label>Age:</label>
            <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
            />

            {/* Coverage Amount Input */}
            <label>Coverage Amount ($):</label>
            <input
                type="number"
                value={coverage}
                onChange={e => setCoverage(e.target.value)}
            />

            {/* Calculate Button */}
            <button onClick={handleCalculate}>Get Quote</button>

            {/* Display Quote if available */}
            {quote && (
                <div className="quote-box">
                    <h3>Estimated Premium: ${quote.premiumAmount}</h3>
                    <button onClick={() => setView('purchase')}>Proceed to Buy</button>
                </div>
            )}

            {/* Back Button */}
            <button className="secondary" onClick={() => setView('products')}>
                Back
            </button>
        </div>
    );
}

export default PremiumCalculator;
