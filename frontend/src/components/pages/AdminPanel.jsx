import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../api';

function AdminPanel({ user }) {
    const [allClaims, setAllClaims] = useState([]);
    const [allPolicies, setAllPolicies] = useState([]);

    useEffect(() => {
        fetchWithAuth('/claims/all').then(res => res.json()).then(setAllClaims);
        fetchWithAuth('/policies/all').then(res => res.json()).then(setAllPolicies);
    }, []);

    const updateClaimStatus = async (id, newStatus) => {
        const res = await fetchWithAuth(`/claims/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            alert("Status updated");
            // refresh
            fetchWithAuth('/claims/all').then(res => res.json()).then(setAllClaims);
        } else {
            const err = await res.json();
            alert("Error: " + err.error);
        }
    };

    return (
        <div>
            <h1>Admin & Underwriter Panel</h1>

            <section>
                <h2>All Claims (Action Required)</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allClaims.map(c => (
                            <tr key={c.id}>
                                <td>{c.id}</td>
                                <td>{c.username}</td>
                                <td>{c.status}</td>
                                <td>
                                    {c.status === 'SUBMITTED' && (
                                        <button onClick={() => updateClaimStatus(c.id, 'UNDER_REVIEW')}>Review</button>
                                    )}
                                    {c.status === 'UNDER_REVIEW' && (
                                        <>
                                            <button onClick={() => updateClaimStatus(c.id, 'APPROVED')}>Approve</button>
                                            <button onClick={() => updateClaimStatus(c.id, 'REJECTED')} className="secondary">Reject</button>
                                        </>
                                    )}
                                    {c.status === 'APPROVED' && (
                                        <button onClick={() => updateClaimStatus(c.id, 'DISBURSED')}>Disburse Funds</button>
                                    )}
                                    <a href={`http://localhost:5000/${c.evidence_path}`} target="_blank" rel="noreferrer">View Evidence</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section>
                <h2>All Policies</h2>
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Product</th>
                            <th>Status</th>
                            <th>Premium</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allPolicies.map(p => (
                            <tr key={p.id}>
                                <td>{p.username}</td>
                                <td>{p.product_name}</td>
                                <td>{p.status}</td>
                                <td>{p.premium_amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default AdminPanel;
