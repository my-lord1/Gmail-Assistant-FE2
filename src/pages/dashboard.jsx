import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import bgImage from "../assets/brave5.avif";

export default function DashBoard() {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

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

  if (error) return <div>Error: {error}</div>;

  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }}>
      {/* Centered scrollable box */}
      <div className="max-w-7xl mx-auto mt-5 p-3">
      <div className="flex justify-between mb-3">
          <div className="bg-white/80 rounded-xl p-2 flex items"> 
            <span className="text-2xl font-bold"> Inbox </span>
          </div>
          <div className="bg-white/80 rounded-xl p-4 flex items-center gap-2">
            {userInfo?.profile_photo && (
              <img src={userInfo.profile_photo} alt="Profile" className="w-12 h-12 rounded-full border border-gray-300 shadow-sm"/>)}
            <div>
              <div className="font-bold text-xl text-left ">
                Hi, {userInfo?.user_name || "User"}
              </div>
              <div className="text-xs text-left">
                {userInfo?.gmail_id || `User ID: ${user_id}`}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div>Loading emails...</div>
        ) : (
          <>
            {threads.length === 0 && (
              <p className="text-gray-500">No emails found</p>
            )}

            <div className="h-[600px] overflow-y-auto space-y-2">
              {threads.map((thread) => {
                const latestMsg =
                  thread.messages?.[thread.messages.length - 1] || {};
                const from = getDisplayName(latestMsg.from);
                const subject = latestMsg.subject || "(No Subject)";
                const sentTime = latestMsg.sent_time || "";
                const isUnread = latestMsg.is_unread;

                return (
                  <div key={thread.threadId} className={`border border-gray-200 p-4 cursor-pointer rounded-xl transition-colors ${ isUnread ? "bg-gray-50" : "bg-white/50"}`}>
                    <div className="flex flex-row justify-between items-center">
                      <span className={`w-1/3 text-left ${ isUnread ? "font-semibold text-gray-2000": "text-gray-800"}`}>
                        {from}
                      </span>
                      <span className={`w-1/2 text-left ${ isUnread ? "font-semibold text-gray-2000": "text-gray-800"}`}>
                        {subject}
                      </span>
                      
                     
                        <span className={`w-1/2 flex items-center justify-end w-1/6 space-x-2 text-xs font-semibold ${ isUnread ? "font-semibold text-gray-2000": "text-gray-800"}`}>
                          {sentTime}
                        </span>
                      
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
