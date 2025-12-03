import { Sparkles, Send, Archive, Trash2, CheckCircle } from 'lucide-react';

export default function ResultDisplay({ data, onClose }) {
  const { type, title, message, icon } = data;
  
  const isSuccess = type === 'success';
  const isSummary = icon === 'sparkles';

  const bgColor = isSummary ? 'bg-purple-500/10' : (isSuccess ? 'bg-green-500/10' : 'bg-gray-500/10');
  const borderColor = isSummary ? 'border-purple-500/20' : (isSuccess ? 'border-green-500/20' : 'border-gray-500/20');
  const glowColor = isSummary ? 'bg-purple-500' : (isSuccess ? 'bg-green-500' : 'bg-gray-500');
  const iconColor = isSummary ? 'text-purple-300' : (isSuccess ? 'text-green-400' : 'text-gray-400');

  const getIcon = () => {
    const size = isSummary ? "w-8 h-8" : "w-12 h-12";
    
    if (icon === 'sparkles') return <Sparkles className={`${size} ${iconColor}`} />;
    if (icon === 'send') return <Send className={`${size} ${iconColor}`} />;
    if (icon === 'archive') return <Archive className={`${size} ${iconColor}`} />;
    if (icon === 'trash') return <Trash2 className={`${size} ${iconColor}`} />;
    return <CheckCircle className={`${size} ${iconColor}`} />;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-500">
      <div className={`relative ${isSummary ? 'p-4' : 'p-8'} rounded-full ${bgColor} border ${borderColor} ${isSummary ? 'mb-4' : 'mb-6'}`}>
        <div className={`absolute inset-0 ${glowColor} blur-2xl opacity-20 animate-pulse`}></div>
        <div className="relative z-10">
          {getIcon()}
        </div>
      </div>

      <h3 className="text-3xl font-bold text-white mb-6 text-center">{title}</h3>
      <div className="w-full max-h-[450px] overflow-y-auto custom-scrollbar px-2 mb-8">
        <p className="text-white/60 text-lg text-left max-w-md mx-auto leading-relaxed">
          {message}
        </p>                
      </div>

      <button onClick={onClose} className="bg-white text-black font-bold text-lg px-12 py-3 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-all active:scale-95">
        Return to Agent Modal
      </button>
    </div>
  );
}