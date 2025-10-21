import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';


export default function DashBoard (){
    const { user_id, user_email } = useParams(); 
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:8000/mails/fetch/${user_id}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch emails');
                }
                
                const data = await response.json();
                setEmails(data.emails);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchEmails();
    }, [user_id]);
    
    if (loading) return <div>Loading emails...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
        <div>
            <h1>User Profile</h1>
            <p>User ID: {user_id}</p>
            <p>User email: {user_email}</p>
            
            <h2>Recent Emails ({emails.length})</h2>
            <ul>
                {emails.map((email) => (
                    <li key={email.id}>
                        <strong>From:</strong> {email.From}<br/>
                        <strong>Subject:</strong> {email.Subject}<br/>
                        <strong>Date:</strong> {email.Date}<br/>
                        <em>{email.snippet}</em>
                    </li>
                ))}
            </ul>
        </div>
    )
}