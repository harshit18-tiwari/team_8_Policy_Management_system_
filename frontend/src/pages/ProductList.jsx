import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../api';

function ProductList({ setView, setSelectedProduct }) {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchWithAuth('/products').then(res => res.json()).then(setProducts);
    }, []);

    const handleSelect = (product) => {
        setSelectedProduct(product);
        setView('calculator');
    };

    return (
        <div>
            <h2>Available Insurance Plans</h2>
            <div className="grid">
                {products.map(p => (
                    <div key={p.id} className="card">
                        <h3>{p.name}</h3>
                        <p>Type: {p.type}</p>
                        <p>Base Price: ${p.base_price}</p>
                        <button onClick={() => handleSelect(p)}>Calculate & Buy</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductList;
