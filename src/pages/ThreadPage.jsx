import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import Aurora from "../components/Aurora"; 
import GmailCompose from "../components/MailComposer";

export default function ThreadPage() {
  const { user_id, threadId } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndices, setExpandedIndices] = useState([]); 
  const [showReply, setShowReply] = useState(false);

  const GlassLayer = ({ className = "", rounded = "rounded-3xl", opacity = "bg-white/10" }) => (
    <div className={`absolute inset-0 -z-10 border border-white/20 ${opacity} backdrop-blur-[40px] backdrop-saturate-150 shadow-xl ${rounded} ${className}`}>
      <div className={`absolute inset-0 border border-white/10 ${rounded}`} style={{ clipPath: 'inset(1px)' }}></div>
    </div>
  );

  useEffect(() => {
    const fetchThread = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/emails/full-threaded/${user_id}`);
        if (!response.ok) throw new Error("Failed to fetch thread");
        const data = await response.json();
        const foundThread = data.threads.find((t) => t.threadId === threadId);
        setThread(foundThread || null);
        
        if (foundThread && foundThread.messages.length > 0) {
            setExpandedIndices([foundThread.messages.length - 1]);
        }
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
  const toggleExpand = (index) => {
    setExpandedIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden text-white font-sans bg-black">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Aurora
          colorStops={["#7cff67", "#b19eef", "#5227ff"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.75}
        />
      </div>
      <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto pt-8 pb-20 px-4">
            <div className="flex flex-col gap-6 mb-8">
                <button onClick={() => navigate(-1)} className="relative group self-start px-6 py-2 font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 pl-4">
                    <GlassLayer rounded="rounded-full" className="group-hover:bg-white/20 transition-colors" />
                    <span className="relative z-20 flex items-center gap-2">
                         <span>←</span> Back
                    </span>
                </button>
                {!loading && thread && (
                    <div className="relative p-8">
                        <GlassLayer rounded="rounded-[2rem]" opacity="bg-white/5" />
                        <h1 className="relative z-20 text-3xl font-bold text-white mb-2 leading-tight">
                            {thread.subject || "(No Subject)"}
                        </h1>
                        <div className="relative z-20 flex gap-4 text-sm font-medium text-white/60 uppercase tracking-wider">
                            <span>{thread.message_count} Messages</span>
                            <span>•</span>
                            <span>Latest: {lastMessage?.sent_time}</span>
                        </div>
                    </div>
                )}
            </div>
            {loading && (
                <div className="relative p-12 flex flex-col items-center justify-center min-h-[400px]">
                    <GlassLayer rounded="rounded-[2.5rem]" />
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white/80 mb-4 opacity-80"></div>
                    <span className="text-white/60 font-medium animate-pulse">Retrieving conversation...</span>
                </div>
            )}
            {!loading && error && (
                <div className="relative p-8 text-center">
                    <GlassLayer rounded="rounded-3xl" className="border-red-500/30 bg-red-500/10" />
                    <span className="relative z-20 text-red-200 font-semibold text-lg">{error}</span>
                </div>
            )}
            {!loading && thread && (
                <div className="space-y-4">
                    {thread.messages.map((msg, index) => {
                        const isExpanded = expandedIndices.includes(index);
                        
                        return (
                            <div 
                                key={msg.id} 
                                onClick={() => !isExpanded && toggleExpand(index)} 
                                className={`relative group transition-all duration-500 ease-spring ${isExpanded ? "cursor-default my-6" : "cursor-pointer hover:scale-[1.01]"}`}>
                                <GlassLayer rounded="rounded-[2rem]" opacity={isExpanded ? "bg-white/15" : "bg-white/5"} className={`transition-all duration-500 ${isExpanded ? "backdrop-blur-3xl" : "group-hover:bg-white/10"}`}/>

                                <div className="relative z-20 p-6">
                                    <div onClick={(e) => { e.stopPropagation(); toggleExpand(index); }} className="flex justify-between items-start cursor-pointer select-none">
                                        <div className="flex flex-col">
                                            <span className={`font-bold text-lg transition-colors ${isExpanded ? "text-white" : "text-white/80"}`}>
                                                {msg.from}
                                            </span>
                                            {isExpanded && (
                                                <span className="text-xs text-white/50 mt-1">
                                                    To: {msg.to}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                            {msg.sent_time}
                                        </span>
                                    </div>

                                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? "max-h-[2000px] opacity-100 mt-6" : "max-h-0 opacity-0"}`}>
                                        <div className="w-full h-px bg-white/10 mb-6"></div> 
                                        <div 
                                            className="prose prose-slate prose-xl max-w-none text-white/90 leading-relaxed font-medium"
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(
                                                    msg.body_html || msg.body_text?.replace(/\n/g, "<br/>") || ""
                                                ),
                                            }}
                                        />
                                    </div>
                                    {!isExpanded && (
                                        <p className="mt-2 text-white/50 text-sm truncate font-medium">
                                            {msg.snippet}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && thread && (
                <div className="mt-8 flex justify-end">
                    {!showReply ? (
                        <button onClick={() => setShowReply(true)} className="relative group px-10 py-4 font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95">
                            <GlassLayer rounded="rounded-full" opacity="bg-blue-500/30" className="group-hover:bg-blue-500/40 border-blue-400/30" />
                            <span className="relative z-20 flex items-center gap-2">
                                ↰ Reply to Thread
                            </span>
                        </button>
                    ) : (
                        <div className="w-full relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="relative p-1">
                                <GmailCompose userId={user_id} threadId={thread.threadId} replyToMessageId={replyToMessageId} initialTo={thread.from} initialSubject={subjectPrefix} onClose={() => setShowReply(false)}/>
                             </div>
                        </div>
                    )}
                </div>
            )}
            {!loading && !thread && !error && (
                <div className="flex justify-center items-center h-64">
                    <span className="text-white/50 text-xl font-light">Thread not found</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
//2am