import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../api';

function Dashboard({ user, setView }) {
    // State to store user's policies list
    const [policies, setPolicies] = useState([]);
    // State to store user's submitted claims list
    const [claims, setClaims] = useState([]);
// Function to refresh both policies and claims from the server
    const refreshData = async () => {
        const pRes = await fetchWithAuth('/policies/my-policies');
        setPolicies(await pRes.json());
// Fetch policies belonging to the logged-in user (authenticated request)
        const cRes = await fetchWithAuth('/claims/my-claims');
        // Fetch claims submitted by the logged-in user
        setClaims(await cRes.json());
    };

    useEffect(() => {
        refreshData();
    }, []);

    const simulatePayment = async (policyId) => {
        const res = await fetchWithAuth('/payments/simulate', {
            method: 'POST',
            body: JSON.stringify({ policyId })
        });
        const data = await res.json();
        alert(data.message);
        refreshData();
    };

    return (
        <div>
            <h1>My Dashboard</h1>

            <section>
                <h2>My Policies</h2>
                {policies.length === 0 && <p>No policies found.</p>}
                <div className="grid">
                    {policies.map(p => (
                        <div key={p.id} className={`card ${p.status}`}>
                            <h3>{p.product_name}</h3>
                            {/* Display current status of the policy */}
                                <p>Status: <strong>{p.status}</strong></p>
                                
                                {/* Show policy number, if missing display "N/A" */}
                                <p>Policy #: {p.policy_number || 'N/A'}</p>
                                
                                {/* Display premium amount for this policy */}
                                <p>Premium: ${p.premium_amount}</p>


                            {p.status === 'PENDING_PAYMENT' && (
                                <button onClick={() => simulatePayment(p.id)}>Pay Now (Simulate)</button>
                            )}

                            {p.status === 'ACTIVE' && (
                                <>
                                    <a
                                        href={`http://localhost:5000/${p.pdf_path}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn-link"
                                    >
                                        Download Certificate
                                    </a>
                                    <button onClick={() => setView('file-claim')}>File a Claim</button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2>My Claims</h2>
                {claims.length === 0 && <p>No claims filed.</p>}
                <table>
                    <thead>
                        <tr>
                            <th>Policy #</th>
                            <th>Status</th>
                            <th>Description</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {claims.map(c => (
                            <tr key={c.id}>
                                <td>{c.policy_number}</td>
                                <td><span className={`badge ${c.status}`}>{c.status}</span></td>
                                <td>{c.description}</td>
                                <td>${c.amount_requested}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default Dashboard;
