import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../api';

/**
 * KycUpload Component
 * --------------------
 * Allows user to upload KYC documents (Aadhar, PAN, etc.)
 * Shows list of uploaded documents with verification status.
 */
function KycUpload({ user, setView }) {

    // Stores documents fetched from backend
    const [documents, setDocuments] = useState([]);

    // Form state variables
    const [documentType, setDocumentType] = useState('AADHAR');
    const [documentNumber, setDocumentNumber] = useState('');
    const [file, setFile] = useState(null);

    // Uploading loader state
    const [uploading, setUploading] = useState(false);

    /**
     * Load user's documents on component mount
     */
    useEffect(() => {
        loadDocuments();
    }, []);

    /**
     * Fetch user's uploaded KYC documents
     */
    const loadDocuments = async () => {
        const res = await fetchWithAuth('/kyc/my-documents');
        setDocuments(await res.json());
    };

    /**
     * Handle KYC document submission
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic file validation
        if (!file) {
            alert("Please select a file");
            return;
        }

        setUploading(true);

        // Prepare form data for file upload
        const formData = new FormData();
        formData.append('document', file);
        formData.append('documentType', documentType);
        formData.append('documentNumber', documentNumber);

        try {
            const res = await fetchWithAuth('/kyc/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                alert("Document uploaded successfully!");
                
                // Reset the form
                setFile(null);
                setDocumentNumber('');
                
                // Refresh document list
                loadDocuments();
            } else {
                const data = await res.json();
                alert(data.error || "Upload failed");
            }

        } catch (err) {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    /**
     * Returns the badge color class based on verification status
     */
    const getStatusBadge = (status) => {
        const colors = {
            'PENDING': 'badge-warning',
            'VERIFIED': 'badge-success',
            'REJECTED': 'badge-danger'
        };
        return colors[status] || 'badge-secondary';
    };

    return (
        <div>
            <h2>KYC Document Upload</h2>
            <p>Upload your identity documents for verification</p>

            {/* Upload New Document Section */}
            <div className="card">
                <h3>Upload New Document</h3>

                <form onSubmit={handleSubmit}>

                    {/* Select Document Type */}
                    <label>Document Type:</label>
                    <select
                        value={documentType}
                        onChange={e => setDocumentType(e.target.value)}
                    >
                        <option value="AADHAR">Aadhar Card</option>
                        <option value="PAN">PAN Card</option>
                        <option value="LICENSE">Driving License</option>
                        <option value="PASSPORT">Passport</option>
                    </select>

                    {/* Document Number Input */}
                    <label>Document Number:</label>
                    <input
                        type="text"
                        value={documentNumber}
                        onChange={e => setDocumentNumber(e.target.value)}
                        placeholder="Enter document number"
                        required
                    />

                    {/* File Upload Input */}
                    <label>Upload Document (PDF/Image):</label>
                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => setFile(e.target.files[0])}
                        required
                    />

                    {/* Submit + Back Buttons */}
                    <button type="submit" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload Document'}
                    </button>

                    <button
                        type="button"
                        className="secondary"
                        onClick={() => setView('dashboard')}
                    >
                        Back to Dashboard
                    </button>
                </form>
            </div>

            {/* Display Uploaded Documents */}
            <div className="card">
                <h3>My Documents</h3>

                {documents.length === 0 ? (
                    <p>No documents uploaded yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Document Type</th>
                                <th>Document Number</th>
                                <th>Status</th>
                                <th>Uploaded On</th>
                            </tr>
                        </thead>

                        <tbody>
                            {documents.map(doc => (
                                <tr key={doc.id}>
                                    <td>{doc.document_type}</td>
                                    <td>{doc.document_number || 'N/A'}</td>

                                    {/* Status Badge */}
                                    <td>
                                        <span className={`badge ${getStatusBadge(doc.status)}`}>
                                            {doc.status}
                                        </span>
                                    </td>

                                    <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default KycUpload;
