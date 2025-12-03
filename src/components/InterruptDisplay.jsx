import { Calendar, Mail, HelpCircle, Loader } from 'lucide-react';
import MeetingDisplay from './MeetingDisplay';
import EmailDisplay from './EmailDisplay';
import QuestionDisplay from './QuestionDisplay';

export default function InterruptDisplay({ interrupt, onAccept, onEdit, onIgnore, onResponse, onTriageResponse, onTriageIgnore, processingAction, editMode, setEditMode, editValues, setEditValues, inputStyle, glassButton }) {
  const action = interrupt?.action_request?.action;
  const args = interrupt?.action_request?.args || {};
  const description = interrupt?.description || {};
  const config = interrupt?.config || {};

  const getIcon = () => {
    if (action === 'schedule_meeting') return <Calendar className="w-8 h-8 text-purple-300" />;
    if (action === 'send_email') return <Mail className="w-8 h-8 text-blue-300" />;
    if (action === 'Question') return <HelpCircle className="w-8 h-8 text-yellow-300" />;
    return <HelpCircle className="w-8 h-8 text-white/50" />;
  };

  if (action?.includes('Email Assistant')) {
    const classification = action.replace('Email Assistant: ', '');
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">{getIcon()}</div>
          <div>
            <h3 className="text-2xl font-bold text-white">Triage Needed</h3>
            <p className="text-white/60 mt-1">AI Suggestion: <span className="text-blue-300 font-bold uppercase tracking-wider">{classification}</span></p>
          </div>
        </div>
        <div className="bg-white/5 rounded-[1.5rem] p-6 border border-white/10">
          <p className="text-xl font-light text-white leading-relaxed">{description.question || 'What should we do with this email?'}</p>
        </div>
        <div className="flex gap-4">
          {config.allow_respond && (
            <button onClick={onTriageResponse} disabled={processingAction !== null} className={`flex-1 rounded-xl py-4 font-bold text-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all ${processingAction === 'response' ? 'opacity-70' : ''} ${processingAction !== null ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}>
              {processingAction === 'response' ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : 'Respond'}
            </button>
          )}
          {config.allow_ignore && (
            <button onClick={onTriageIgnore} disabled={processingAction !== null} className={`flex-1 rounded-xl py-4 font-bold text-lg ${glassButton} ${processingAction !== null ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {processingAction === 'ignore' ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : 'Ignore'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-white/10 pb-6">
        <div className="p-3 bg-white/5 rounded-xl border border-white/10">{getIcon()}</div>
        <h3 className="text-2xl font-bold text-white capitalize tracking-wide">{action.replace('_', ' ')}</h3>
      </div>
      {description && (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-3">
          <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-white/40 uppercase tracking-widest">Context</span></div>
          <p><span className="text-white/50">From:</span> <span className="text-white font-medium ml-2">{description.author}</span></p>
          <p><span className="text-white/50">Subject:</span> <span className="text-white font-medium ml-2">{description.subject}</span></p>
          <div className="h-px w-full bg-white/10 my-3"></div>
          <p className="text-white/80 italic text-sm line-clamp-3">"{description.body}"</p>
        </div>
      )}

      <div className="bg-black/20 rounded-2xl p-6 border border-white/10">
        {action === 'schedule_meeting' && <MeetingDisplay args={args} editMode={editMode} setEditMode={setEditMode} editValues={editValues} setEditValues={setEditValues} inputStyle={inputStyle} />}
        {action === 'send_email' && <EmailDisplay args={args} editMode={editMode} setEditMode={setEditMode} editValues={editValues} setEditValues={setEditValues} inputStyle={inputStyle} />}
        {action === 'Question' && <QuestionDisplay args={args} editValues={editValues} setEditValues={setEditValues} inputStyle={inputStyle} />}
      </div>

      <div className="flex gap-3 pt-2">
        {action === 'Question' ? (
          <>
            <button onClick={() => onResponse(editValues.answer || '')} disabled={processingAction !== null} className={`flex-1 rounded-xl py-4 font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all ${processingAction !== null ? 'opacity-50' : 'hover:scale-[1.02]'}`}>
              {processingAction === 'response' ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : 'Submit Answer'}
            </button>
            <button onClick={onIgnore} disabled={processingAction !== null} className={`flex-1 rounded-xl py-4 font-bold ${glassButton} ${processingAction !== null ? 'opacity-50' : ''}`}>
              {processingAction === 'ignore' ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : 'Ignore'}
            </button>
          </>
        ) : (
          <>
            {!editMode && (
              <>
                <button onClick={onAccept} disabled={processingAction !== null} className={`flex-1 rounded-xl py-4 font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all ${processingAction !== null ? 'opacity-50' : 'hover:scale-[1.02]'}`}>
                  {processingAction === 'accept' ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm'}
                </button>
                <button onClick={() => { setEditMode(true); setEditValues(args); }} disabled={processingAction !== null} className={`flex-1 rounded-xl py-4 font-bold ${glassButton} ${processingAction !== null ? 'opacity-50' : ''}`}>Edit</button>
                <button onClick={onIgnore} disabled={processingAction !== null} className={`flex-1 rounded-xl py-4 font-bold ${glassButton} ${processingAction !== null ? 'opacity-50' : ''}`}>
                  {processingAction === 'ignore' ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : 'Ignore'}
                </button>
              </>
            )}
          </>
        )}
      </div>
      {editMode && action !== 'Question' && (
        <button onClick={() => onEdit(editValues)} disabled={processingAction !== null} className={`w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all ${processingAction !== null ? 'opacity-50' : 'hover:scale-[1.01]'}`}>
          {processingAction === 'edit' ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : 'Save Changes & Confirm'}
        </button>
      )}
    </div>
  );
}