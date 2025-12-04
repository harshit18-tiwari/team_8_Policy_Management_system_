import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../api';

function FileClaim({ user, setView }) {
    const [policies, setPolicies] = useState([]);
    const [policyId, setPolicyId] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [file, setFile] = useState(null);

    useEffect(() => {
        // Only fetch ACTIVE policies
        fetchWithAuth('/policies/my-policies')
            .then(res => res.json())
            .then(data => setPolicies(data.filter(p => p.status === 'ACTIVE')));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!policyId || !file) {
            alert("Please select a policy and upload evidence.");
            return;
        }

        const formData = new FormData();
        formData.append('policyId', policyId);
        formData.append('description', description);
        formData.append('amount', amount);
        formData.append('evidence', file);

        const res = await fetchWithAuth('/claims/file', {
            method: 'POST',
            body: formData // fetchWithAuth handles content-type for FormData
        });

        if (res.ok) {
            alert("Claim Filed Successfully");
            setView('dashboard');
        } else {
            alert("Error filing claim");
        }
    };

    return (
        <div className="card">
            <h2>File a New Claim</h2>
            <form onSubmit={handleSubmit}>
                <label>Select Policy:</label>
                <select onChange={e => setPolicyId(e.target.value)} value={policyId}>
                    <option value="">-- Select --</option>
                    {policies.map(p => (
                        <option key={p.id} value={p.id}>{p.product_name} ({p.policy_number})</option>
                    ))}
                </select>

                <label>Description of Incident:</label>
                <textarea onChange={e => setDescription(e.target.value)} required />

                <label>Claim Amount ($):</label>
                <input type="number" onChange={e => setAmount(e.target.value)} required />

                <label>Upload Evidence (Image/PDF):</label>
                <input type="file" onChange={e => setFile(e.target.files[0])} required />

                <button type="submit">Submit Claim</button>
                <button type="button" className="secondary" onClick={() => setView('dashboard')}>Cancel</button>
            </form>
        </div>
    );
}

export default FileClaim;
