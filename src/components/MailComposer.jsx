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

  const inputStyle = "w-full px-4 py-3 bg-neutral-800 rounded-xl border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelStyle = "block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 ml-1";

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
      const payload = { 
          user_id: userId, 
          to: to,               
          subject: subject,     
          body_text: body 
      };
      
      if (threadId && replyToMessageId) {
        payload.thread_id = threadId;                 
        payload.reply_to_message_id = replyToMessageId; 
      }

      const response = await fetch("https://gmail-assistant-be.onrender.com/emails/send", {
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
      
      setTimeout(() => {
          if (onClose) onClose();
      }, 1000);

    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[600px] max-w-[95vw] mx-auto bg-black border border-white/10 rounded-2xl shadow-2xl p-8 relative animate-in fade-in zoom-in-95 duration-200">
      
      <button onClick={onClose} title="Close" className="absolute cursor-pointer top-4 right-4 p-2 rounded-full text-neutral-500 hover:text-white hover:bg-white/10 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">
            {threadId ? 'Reply to Thread' : 'New Email'}
        </h2>
        <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
      </div>
      
      <form onSubmit={handleSend} className="space-y-5">

        {!threadId && (
          <>
            <div>
              <label className={labelStyle}>To</label>
              <input type="email" value={to} onChange={(e) => setTo(e.target.value)} className={inputStyle} placeholder="recipient@example.com" required/>
            </div>
            <div>
              <label className={labelStyle}>Subject</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputStyle} placeholder="Email subject" required/>
            </div>
          </>
        )}

        {threadId && (
          <div className="p-3 bg-neutral-800 rounded-lg border border-neutral-700 mb-4 flex flex-col gap-1">
            <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-blue-400 uppercase">Replying To</span>
                <span className="text-[10px] font-mono text-neutral-500">ID: {replyToMessageId?.slice(-6) || 'N/A'}</span>
            </div>
            <div className="text-sm text-gray-300 truncate" title={to}>{to}</div>
            <div className="text-sm text-white font-medium truncate opacity-60">{subject}</div>
          </div>
        )}

        <div>
          <label className={labelStyle}>Message</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} className={`${inputStyle} resize-none`} placeholder={threadId ? "Type your reply..." : "Type your message here..."} required/>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 font-medium text-sm ${
            message.type === 'success' 
              ? 'bg-green-900/30 text-green-400 border border-green-900' 
              : 'bg-red-900/30 text-red-400 border border-red-900'
          }`}>
             <span>{message.type === 'success' ? '✓' : '⚠'}</span>
            {message.text}
          </div>
        )}

        <div className="pt-2">
            <button type="submit" disabled={loading} className="w-full cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-900/20 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all active:scale-[0.98]" >
            {loading ? 'Sending...' : 'Send Message'}
            </button>
        </div>
      </form>
    </div>
  );
}
//2am