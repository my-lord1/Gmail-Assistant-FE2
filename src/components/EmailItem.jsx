import { Play } from 'lucide-react';

export default function EmailItem({ email, onClick, parseDate }) {
  const date = parseDate(email.time);
  return (
    <div onClick={onClick} className="group relative p-5 cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-[1.01] hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start gap-4 mb-2">
        <div className="min-w-0">
          <h3 className="text-white text-lg font-bold truncate pr-4 group-hover:text-blue-200 transition-colors">{email.subject}</h3>
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">{email.from}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-white/40 text-xs font-medium bg-white/5 px-2 py-1 rounded-md">
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>
      <p className="text-white/70 text-sm line-clamp-2 font-light leading-relaxed">{email.body}</p>
      <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
        <div className="bg-blue-600 rounded-full p-2 text-white shadow-lg"><Play className="w-4 h-4 fill-current" /></div>
      </div>
    </div>
  );
}