import React from "react";
import axios from "axios";
import Aurora from "../components/Aurora";

export default function SignIn() {
  const handleAuthorize = async () => {
    try {
      const res = await axios.get("https://gmail-assistant-be.onrender.com/auth/google/start");
      window.location.href = res.data.authorization_url;
    } catch (err) {
      console.error("Google Login Failed:", err);
    }
  };

  const GlassLayer = ({ className = "", rounded = "rounded-3xl", opacity = "bg-white/10" }) => (
    <div className={`absolute inset-0 -z-10 border border-white/20 ${opacity} backdrop-blur-[40px] backdrop-saturate-150 shadow-2xl ${rounded} ${className}`}>
      <div className={`absolute inset-0 border border-white/10 ${rounded}`} style={{ clipPath: 'inset(1px)' }}></div>
    </div>
  );

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden text-white font-sans bg-black selection:bg-blue-500/30">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Aurora
          colorStops={["#7cff67", "#b19eef", "#5227ff"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.75}
        />
      </div>
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6">
        <div className="absolute top-8 w-full max-w-2xl px-2">
            <div className="relative px-6 py-4 flex items-center justify-between group">
                <GlassLayer rounded="rounded-full" className="group-hover:bg-white/15 transition-colors duration-500" />
                <div className="relative z-20 flex items-center gap-3">
                    <span className="text-2xl drop-shadow-md">✉️</span>
                    <span className="text-white font-bold text-lg tracking-wide">Gmail Assistant</span>
                </div>
                <div className="relative z-20 flex items-center gap-6">
                    <a href="https://github.com/my-lord1" className="text-sm font-semibold text-white/70 hover:text-white transition-colors duration-300">
                        Github Docs
                    </a>
                </div>
            </div>
        </div>
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-sm leading-[1.1]">
                Your Inbox, <br />
                <span className="bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">Reimagined.</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100/70 max-w-2xl font-light leading-relaxed">
                Summarize threads, schedule meetings, and reply to a mail. All inside your inbox using AI.
            </p>
            <div className="mt-3 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
                <button onClick={handleAuthorize} className="relative flex items-center justify-center gap-4 px-10 py-4 rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-95 group-hover:shadow-2xl">
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border border-white rounded-full"></div>
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5"></div>
                    <div className="relative z-10 flex items-center gap-3">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="w-6 h-6" />
                        <span className="text-gray-800 font-bold text-lg tracking-wide">
                            Continue with Google
                        </span>
                    </div>
                </button>
            </div>
            <div className="flex flex-col items-center gap-2">
                <p className="text-white/30 text-xs font-medium uppercase tracking-[0.2em]">
                    Powered by Gemini Flash 2.0, Gmail API & GCalendar API 
                </p>
            </div>
        </div>

      </div>
    </div>
  );
}
//2am