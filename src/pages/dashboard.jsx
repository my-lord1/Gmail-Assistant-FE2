import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

export default function DashBoard() {
  const { user_id } = useParams();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/emails/full-threaded/${user_id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch emails');
        }
        const data = await response.json();

        // Extract only body_html from each message
        const allBodyHtml = [];
        data.forEach(thread => {
          thread.messages.forEach(msg => {
            allBodyHtml.push(msg.body_html);
          });
        });

        setEmails(allBodyHtml);
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
      <h1>User Dashboard</h1>
      <h2>User ID: {user_id}</h2>

      {emails.length === 0 && <p>No emails found</p>}

      {emails.map((html, index) => (
        <div
          key={index}
          style={{ border: '1px solid #ccc', margin: '20px 0', padding: '10px' }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
        />
      ))}
    </div>
  );
}
