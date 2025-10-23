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
        setThread(foundThread);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchThread();
  }, [user_id, threadId]);

  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!thread) return <div className="p-6 text-gray-500">Thread not found</div>;

  const lastMessage = thread.messages[thread.messages.length - 1];
  const replyTo = lastMessage?.from || "";
  const subjectPrefix = thread.subject?.startsWith("Re:") ? thread.subject : `Re: ${thread.subject}`;
  const replyToMessageId = lastMessage?.id;

  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen bg-cover bg-center overflow-y-auto"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="max-w-7xl mx-auto mt-5 p-4 bg-white/80 rounded-xl shadow-lg">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-blue-600 hover:underline"
        >
          ← Back to Inbox
        </button>

        {loading ? (
          <div>Loading emails...</div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-3">{thread.subject || "(No Subject)"}</h2>
            <p className="text-gray-600 mb-6">Total messages: {thread.message_count}</p>

            <div className="space-y-5 mt-6">
              {[...thread.messages].reverse().map((msg, index) => {
                const isExpanded = expandedIndices.includes(index);
                return (
                  <div
                    key={msg.id}
                    className={`border border-gray-200 rounded-xl ${isExpanded ? "p-4 bg-gray-50" : "p-2 cursor-pointer hover:bg-gray-100"}`}
                    onClick={() => {
                      setExpandedIndices(prev =>
                        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
                      );
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 ">FROM: {msg.from}</span>
                      <span className="text-sm text-gray-500">{msg.sent_time}</span>
                    </div>
                    <div className="flex text-gray-800 mb-3">TO: {msg.to}</div>
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
                      <p className="text-gray-600 text-sm truncate">{msg.snippet}</p>
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
                    onClose={() => setShowReply(false)}/>
                </div>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
//422 error for reply in thread