import { useState } from 'react';

export default function GmailCompose({ 
    userId,
    threadId = null, 
    replyToMessageId = null, 
    initialTo = '', 
    initialSubject = '',
    onClose 
}) {
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (threadId) {
      if (!body) {
        setMessage({ type: 'error', text: 'Please type your reply' });
        return;
      }
    } else {
      if (!to || !subject || !body) {
        setMessage({ type: 'error', text: 'Please fill all fields' });
        return;
      }
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = { user_id: userId, body_text: body };

      if (threadId && replyToMessageId) {
        payload.thread_id = threadId;
        payload.reply_to_message_id = replyToMessageId;
      } else {
        payload.to_email = to;
        payload.subject = subject;
      }

      const response = await fetch("http://localhost:8000/emails/send", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to send email');
      }

      const result = await response.json();
      setMessage({ type: 'success', text: 'Email sent successfully!' });
      
      if (!threadId) {
        setTo('');
        setSubject('');
      }
      setBody('');
      
      if (onClose) onClose();

    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-3xl min-w-lg mx-auto bg-white rounded-2xl shadow p-6 relative">
      <button
        onClick={onClose}
        className="absolute cursor-pointer top-2 right-4 text-gray-400 hover:text-red-500 text-2xl"
        title="Close"
      >
        ✖
      </button>

      <div className="text-2xl font-bold mb-4">
        {threadId ? 'Reply to Gmail' : 'New Message'}
      </div>
      
      <form onSubmit={handleSend} className="space-y-4">

        {!threadId && (
          <>
            <div>
              <label className="block text-md text-left font-medium mb-1">To</label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="recipient@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-md text-left font-medium mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email subject"
                required
              />
            </div>
          </>
        )}

        {threadId && (
          <p className="text-gray-600 mb-2">
            Replying to: {to} | Subject: {subject}
          </p>
        )}

        <div>
          <label className="block text-md text-left font-medium mb-1">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={threadId ? "Type your reply..." : "Type your message here..."}
            required
          />
        </div>

        {message.text && (
          <div className={`p-3 rounded ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Email'}
        </button>
      </form>
    </div>
  );
}
