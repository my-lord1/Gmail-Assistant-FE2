import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { LogOut, Menu, X as CloseIcon } from "lucide-react"; 
import Aurora from "../components/Aurora";
import GmailCompose from "../components/MailComposer";
import GmailAgent from "./modal_dialog";

export default function DashBoard() {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [showAgent, setShowAgent] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const [locallyRead, setLocallyRead] = useState(() => {
    const saved = sessionStorage.getItem(`readThreads_${user_id}`);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const GlassLayer = ({ className = "", rounded = "rounded-3xl", opacity = "bg-white/10" }) => (
    <div className={`absolute inset-0 -z-10 border border-white/20 ${opacity} backdrop-blur-[40px] backdrop-saturate-150 shadow-lg ${rounded} ${className}`}>
      <div className={`absolute inset-0 border border-white/10 ${rounded}`} style={{ clipPath: 'inset(1px)' }}></div>
    </div>
  );

  const getDisplayName = (from) => {
    if (!from) return "Unknown";
    from = from.trim();
    const quoteMatch = from.match(/^"(.*)"\s*<.*>$/);
    if (quoteMatch) return quoteMatch[1];
    const angleMatch = from.match(/^(.*)<(.*)>$/);
    if (angleMatch) {
      const name = angleMatch[1].trim();
      const email = angleMatch[2].trim();
      if (name) return name;
      return email.length > 17 ? email.slice(0, 17) + "..." : email;
    }
    return from.length > 17 ? from.slice(0, 17) + "..." : from;
  };

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8000/emails/full-threaded/${user_id}`
        );
        if (!response.ok) throw new Error("Failed to fetch emails");
        const data = await response.json();
        setThreads(data.threads || []);
        setUserInfo(data.user_info || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmails();
  }, [user_id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleThreadClick = async (threadId) => {
    setLocallyRead((prev) => {
      const newSet = new Set(prev);
      newSet.add(threadId);
      sessionStorage.setItem(`readThreads_${user_id}`, JSON.stringify([...newSet]));
      return newSet;
    });

    fetch(`http://localhost:8000/api/agent/mark-read/${user_id}/${threadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch((err) => console.error("Failed to mark read on server:", err));

    navigate(`/thread/${user_id}/${threadId}`);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/auth/google/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id }),
      });
    } catch (err) {
      console.error("Logout API call failed", err);
    }
    sessionStorage.clear();
    localStorage.removeItem('user_id'); 
    navigate('/'); 
  };

  if (error) return <div className="text-white p-10 font-sans">Error: {error}</div>;

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
      <div className="relative z-10 w-full h-full flex flex-col p-3 sm:p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6 shrink-0 flex-wrap gap-3 sm:gap-4">
          <div className="flex gap-2 sm:gap-4 flex-wrap">
            <button onClick={() => setShowComposer(true)} className="relative group px-4 sm:px-8 py-2 sm:py-3 font-semibold text-sm sm:text-base text-white transition-all duration-300 hover:scale-105 active:scale-95">
              <GlassLayer rounded="rounded-full" className="group-hover:bg-white/20 transition-colors" />
              <span className="relative z-20">Compose</span>
            </button>

            <button onClick={() => setShowAgent(true)} className="relative group px-4 sm:px-8 py-2 sm:py-3 font-semibold text-sm sm:text-base text-white transition-all duration-300 hover:scale-105 active:scale-95">
              <GlassLayer rounded="rounded-full" className="group-hover:bg-white/20 transition-colors" />
              <span className="relative z-20">Agent</span>
            </button>
          </div>

          <div className="flex gap-2 sm:gap-4 items-center">
            <div className="hidden sm:flex relative px-4 sm:px-8 py-2 sm:py-3 items-center justify-center">
              <GlassLayer rounded="rounded-full" />
              <span className="relative z-20 text-lg sm:text-xl font-bold tracking-wide text-white/90">Inbox</span>
            </div>

            <div className="relative z-50" ref={profileRef}> 
              <div onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="relative z-20 pl-2 sm:pl-4 pr-4 sm:pr-6 py-2 flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 transition-all duration-300 hover:bg-black/40 hover:border-white/30 cursor-pointer">
                {userInfo?.profile_photo ? (
                  <img src={userInfo.profile_photo} alt="Profile" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white/30 shadow-sm object-cover"/>
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 border-2 border-white/30" />
                )}
                
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-sm font-bold text-white leading-tight">
                    {userInfo?.user_name || "User"}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-white/60 font-medium uppercase tracking-wider">
                    {userInfo?.gmail_id ? "Connected" : `ID: ${user_id}`}
                  </span>
                </div>
              </div>

              <button onClick={handleLogout}
                className={`absolute inset-0 -z-10 flex items-center justify-center gap-2 rounded-full 
                           bg-red-600/20 border border-red-500/30 text-red-200 font-bold tracking-wide text-xs sm:text-sm
                           transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-xl backdrop-blur-md
                           ${isProfileOpen 
                             ? "opacity-100 translate-y-[115%] pointer-events-auto" 
                             : "opacity-0 translate-y-0 pointer-events-none"}`}>
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div className="relative z-20 h-full p-3 sm:p-5 border border-white/20 rounded-2xl sm:rounded-3xl overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex h-full items-center justify-center text-white/50 animate-pulse">
                Loading your inbox...
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 pb-20">
                {threads.length === 0 && (
                  <p className="text-white/50 text-center mt-10">No emails found</p>
                )}
                
                {threads.map((thread) => {
                  const latestMsg = thread.messages?.[thread.messages.length - 1] || {};
                  const from = getDisplayName(latestMsg.from);
                  const subject = latestMsg.subject || "(No Subject)";
                  const sentTime = latestMsg.sent_time || "";
                  const isActuallyUnread = latestMsg.is_unread && !locallyRead.has(thread.threadId);

                  return (
                    <div key={thread.threadId} onClick={() => handleThreadClick(thread.threadId)} className="relative group p-3 sm:p-5 cursor-pointer transition-all duration-300 hover:scale-[1.01]">
                      <GlassLayer rounded="rounded-xl sm:rounded-2xl" opacity={isActuallyUnread ? "bg-white/20" : "bg-white/5"} className="group-hover:bg-white/20 transition-colors duration-300"/>
                      <div className="relative z-10 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between sm:items-center">
                        <span className={`text-xs sm:text-base truncate ${isActuallyUnread ? "font-bold text-white/95" : "font-medium text-white/70"}`}>
                          {from}
                        </span>
                        <span className={`text-xs sm:text-base truncate sm:w-1/2 ${isActuallyUnread ? "font-bold text-white/95" : "text-white/60"}`}>
                          {subject}
                        </span>
                        <span className={`text-xs ${isActuallyUnread ? "font-bold text-white/95" : "text-white/40"}`}>
                          {sentTime}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <GmailAgent userId={user_id} onClose={() => setShowAgent(false)} onLogout={handleLogout} />
        </div>
      )}

      {showComposer && (
        <div className="fixed bottom-5 right-5 sm:bottom-10 sm:right-10 z-50 drop-shadow-2xl animate-in slide-in-from-bottom-10 duration-300 max-w-[calc(100vw-40px)]">
          <GmailCompose userId={user_id} onClose={() => setShowComposer(false)} />
        </div>
      )}
    </div>
  );
}