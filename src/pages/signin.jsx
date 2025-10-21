import React from "react";
import axios from "axios";
import Aurora from "../components/Aurora";

export default function SignIn() {
  const handleAuthorize = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/auth/google/start");
      window.location.href = res.data.authorization_url;
    } catch (err) {
      console.error("Google Login Failed:", err);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex flex-col items-center justify-center overflow-hidden text-center">
      {/* 🔹 Background */}
      <div className="absolute inset-0 bg-black -z-10">
        <Aurora
          colorStops={["#7cff67", "#b19eef", "#5227ff"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.75}
        />
      </div>

      {/* 🔹 Navbar */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-[90%] max-w-4xl px-6 py-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✉️</span>
          <span className="text-white font-semibold text-lg">Gmail Assistant</span>
        </div>

        <div className="flex items-center gap-6 text-white font-medium">
          <a href="#" className="hover:text-blue-300 transition">Github Documentation</a>
        </div>
      </div>

      {/* 🔹 Foreground Content */}
      <div className="flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Get started with your AI-powered inbox
        </h1>
        <p className="text-gray-200 text-lg mb-8 max-w-lg">
          Summarize, schedule, and reply — all inside your inbox.
        </p>

        <button onClick={handleAuthorize}
          className="hover:cursor-pointer flex items-center justify-center gap-4 px-8 py-3 bg-white text-gray-700 font-semibold rounded-full shadow-sm hover:bg-gray-100 transition duration-300">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="w-5 h-5" />
          Continue with Google
        </button>


        <p className="text-gray-400 text-sm mt-6">
          Powered by Gemini:Flash-2.0 & Gmail API
        </p>
      </div>

      {/* 🔹 Glow Behind Button */}
      <div className="absolute bottom-[45%] left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl -z-10"></div>
    </div>
  );
}
