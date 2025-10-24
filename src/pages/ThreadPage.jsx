import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import bgImage from "../assets/brave5.avif";
import GmailCompose from "../components/MailComposer";

export default function ThreadPage() {
  const { user_id, threadId } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndices, setExpandedIndices] = useState([]);
  const [showReply, setShowReply] = useState(false);

  useEffect(() => {
    const fetchThread = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/emails/full-threaded/${user_id}`);
        if (!response.ok) throw new Error("Failed to fetch thread");
        const data = await response.json();
        const foundThread = data.threads.find((t) => t.threadId === threadId);
        setThread(foundThread || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchThread();
  }, [user_id, threadId]);

  const lastMessage = thread?.messages[thread?.messages.length - 1];
  const replyTo = lastMessage?.from || "";
  const subjectPrefix = thread?.subject?.startsWith("Re:") ? thread.subject : `Re: ${thread?.subject}`;
  const replyToMessageId = lastMessage?.id;

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-cover bg-center overflow-y-auto" style={{ backgroundImage: `url(${bgImage})` }}>
      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="flex flex-col items-center justify-center bg-white/80 p-6 rounded-xl shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-t-5 border-blue-600 mb-4"></div>
            <span className="text-gray-700 font-medium">Loading Threads...</span>
          </div>
        </div>
      )}

      {/* back button */}
      <button onClick={() => navigate(-1)} className="text-md mt-5 z-30 font-bold text-black rounded-xl p-4 hover:text-red bg-white/80 cursor-pointer">
        ← Back to Inbox
      </button>
      <div className="max-w-5xl mx-auto mt-5 border p-3">
      
      {/* Main Content */}
      {!loading && error && (
        <div className="relative z-10 flex justify-center items-center min-h-screen">
          <span className="text-red-500 font-semibold text-lg">{error}</span>
        </div>
      )}

      {!loading && thread && (
        <div className="relative z-10 max-w-4xl mx-auto pt-6 pb-10 border px-4">
          <h2 className="text-2xl font-bold mb-3 text-white">{thread.subject || "(No Subject)"}</h2>
          <p className="text-gray-200 font-semibold mb-6">Total messages: {thread.message_count}</p>

          <div className="space-y-5 mt-6">
            {thread.messages.map((msg, index) => {
              const isExpanded = expandedIndices.includes(index);
              return (
                <div key={msg.id} className={`border border-gray-200 rounded-xl ${isExpanded ? "p-4 bg-gray-800/50 text-white" : "p-2 cursor-pointer hover:bg-gray-700/30 text-white"}`}
                  onClick={() => setExpandedIndices(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index])}>
                  <div className="flex justify-between items-center">
                    <span>FROM: {msg.from}</span>
                    <span className="text-sm">{msg.sent_time}</span>
                  </div>
                  <div className="flex mb-3">TO: {msg.to}</div>
                  {isExpanded ? (
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          msg.body_html || msg.body_text.replace(/\n/g, "<br/>")
                        ),
                      }}
                    />
                  ) : (
                    <p className="text-gray-300 text-sm truncate">{msg.snippet}</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            {!showReply && (
              <button onClick={() => setShowReply(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Reply
              </button>
            )}

            {showReply && (
              <div className="mt-4">
                <GmailCompose
                  userId={user_id}
                  threadId={thread.threadId}
                  replyToMessageId={replyToMessageId}
                  initialTo={replyTo}
                  initialSubject={subjectPrefix}
                  onClose={() => setShowReply(false)}
                />
              </div>
            )}
          </div>
        </div>
      )}

        {/* Thread Not Found */}
        {!loading && !thread && !error && (
          <div className="relative z-10 flex justify-center items-center min-h-screen">
            <span className="text-white font-semibold text-lg">Thread not found</span>
          </div>
        )}
      </div>
    </div>
  );
}
