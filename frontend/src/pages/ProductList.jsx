import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../api';

/**
 * ProductList Component
 * ---------------------
 * Displays all insurance products available for purchase.
 * Allows user to select a product and proceed to premium calculator.
 */
function ProductList({ setView, setSelectedProduct }) {

    // Stores list of products fetched from backend
    const [products, setProducts] = useState([]);

    /**
     * Fetch products on initial component load.
     * fetchWithAuth() automatically attaches Authorization header.
     */
    useEffect(() => {
        fetchWithAuth('/products')
            .then(res => res.json())
            .then(setProducts);  // sets the received product list to state
    }, []);

    /**
     * When user selects a product:
     *  - Save selected product
     *  - Navigate to calculator screen
     */
    const handleSelect = (product) => {
        setSelectedProduct(product);
        setView('calculator');
    };

    return (
        <div>
            <h2>Available Insurance Plans</h2>

            {/* Display list of products in grid layout */}
            <div className="grid">
                {products.map(p => (
                    <div key={p.id} className="card">
                        <h3>{p.name}</h3>
                        <p>Type: {p.type}</p>
                        <p>Base Price: ${p.base_price}</p>

                        {/* Button to go to premium calculator */}
                        <button onClick={() => handleSelect(p)}>
                            Calculate & Buy
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductList;
