import React, { useState, useEffect } from 'react';
import { Mail, Loader, X, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import EmailItem from '../components/EmailItem';
import ResultDisplay from '../components/ResultDisplay';
import InterruptDisplay from '../components/InterruptDisplay';

export default function GmailAgent({ userId, onClose }) {
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [threadId, setThreadId] = useState(null);
  const [interrupt, setInterrupt] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [error, setError] = useState(null);
  const [modalPhase, setModalPhase] = useState('list'); 
  const [resultData, setResultData] = useState(null); 

  const glassPanel = "bg-black/40 backdrop-blur-[40px] backdrop-saturate-150 border border-white/20 shadow-2xl ring-1 ring-white/10";
  const glassButton = "relative group overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 active:scale-95 text-white";
  const inputStyle = "w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:bg-black/40 focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all";

  useEffect(() => {
    if (modalPhase === 'list' && emails.length === 0) {
      fetchEmails();
    }
  }, [modalPhase]);
  
  const fetchEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8000/api/agent/get-unread-emails?user_id=${userId}&order=newest`
      );
      const data = await response.json();
      if (data.status === 'success') {
        const sorted = sortEmailsByDate(data.emails);
        setEmails(sorted);
        setFilteredEmails(sorted);
      } else {
        setError('Failed to fetch emails');
      }
    } catch (err) {
      setError('Failed to fetch emails');
      throw err; 
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    setModalPhase('processing');
    setProcessingAction('summarize'); 
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/agent/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      
      const data = await response.json();

      if (data.status === 'success') {
        setResultData({
            type: 'success',
            title: 'Inbox Executive Summary',
            message: data.summary, 
            icon: 'sparkles' 
        });
        setModalPhase('result');
      } else {
        setError("Failed to generate summary");
        setModalPhase('list');
      }
    } catch (err) {
      setError("Network error during summarization");
      setModalPhase('list');
    } finally {
      setProcessingAction(null);
    }
  };

  const parseEmailDate = (dateStr) => {
    try { return new Date(dateStr); } catch { return new Date(0); }
  };

  const sortEmailsByDate = (emailList) => {
    return [...emailList].sort((a, b) => {
      return parseEmailDate(b.time) - parseEmailDate(a.time);
    });
  };

  const filterEmails = (filterType) => {
    setFilter(filterType);
    let filtered = [...emails];
    if (filterType === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter((e) => parseEmailDate(e.time) >= today);
    } else if (filterType === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((e) => parseEmailDate(e.time) >= weekAgo);
    }
    setFilteredEmails(sortEmailsByDate(filtered));
  };

  useEffect(() => { if (emails.length > 0) filterEmails(filter); }, [emails]);

  const handleCompletion = (decision, userAction = null) => {
    let resultType = 'success';
    let title = 'Completed';
    let message = 'Workflow finished successfully.';
    let icon = 'check';

    if (userAction === 'ignore') {
      resultType = 'ignored';
      title = 'Action Dismissed';
      message = 'You chose to ignore this action. No changes were made.';
      icon = 'trash';
    }
    else if (decision === 'ignore') {
      resultType = 'ignored';
      title = 'Skipped (Triage Decision: Ignore)';
      message = 'The AI ignored this mail and marked it as read cause it might be related to promotional/spam.';
      icon = 'archive';
    }
    else if (decision === 'respond') {
        resultType = 'success';
        title = 'Reply Sent Successfully';
        message = 'The email response has been generated and sent.';
        icon = 'send';
    }
    else if (decision === 'notify') {
        resultType = 'success';
        title = 'Triage Handled';
        message = 'You decided to ignore the email.';
        icon = 'check';
    }

    setResultData({ type: resultType, title, message, icon });
    
    const updatedEmails = emails.filter((e) => e.id !== selectedEmailId);
    setEmails(updatedEmails);
    setFilteredEmails(
        updatedEmails.filter(e => true)
    );

    setModalPhase('result');
    setThreadId(null);
    setInterrupt(null);
  };

  const processEmail = async (emailId) => {
    setSelectedEmailId(emailId);
    setThreadId(null);
    setInterrupt(null);
    setEditMode(false);
    setError(null);
    setModalPhase('processing');
    setProcessingAction(null);

    try {
      const response = await fetch('http://localhost:8000/api/agent/process-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, email_id: emailId, order: 'newest' }),
      });
      const data = await response.json();

      if (data.status === 'interrupted') {
        setThreadId(data.thread_id);
        let cleanInterrupt = null;
        if (data.interrupt_payload && data.interrupt_payload[0]) {
             const container = data.interrupt_payload[0];
             cleanInterrupt = (container.value && Array.isArray(container.value)) ? container.value[0] : (container.value || container);
        }
        setInterrupt(cleanInterrupt);
      } else if (data.status === 'completed') {
        handleCompletion(data.classification_decision);
      }
    } catch (err) {
      setError('Failed to process email');
      setModalPhase('list');
    }
  };

  const handleInterruptResponse = async (responseType, args = null) => {
    if (!threadId) return;
    setProcessingAction(responseType);
    setError(null);
    
    const userResponse = {
      type: responseType,
      args: args || {},
      action_request: interrupt.action_request,
      config: interrupt.config,
      description: interrupt.description
    };

    try {
      const response = await fetch('http://localhost:8000/api/agent/resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ thread_id: threadId, user_response: userResponse }),
      });
      const data = await response.json();

      if (data.status === 'interrupted') {
        let cleanInterrupt = null;
        if (data.interrupt_payload && data.interrupt_payload[0]) {
             const container = data.interrupt_payload[0];
             cleanInterrupt = (container.value && Array.isArray(container.value)) ? container.value[0] : (container.value || container);
        } else if (data.interrupt_payload) {
             cleanInterrupt = data.interrupt_payload;
        }
        setInterrupt(cleanInterrupt);
        setEditMode(false);
        setProcessingAction(null);
      } else if (data.status === 'completed') {
        handleCompletion(data.classification_decision, responseType);
        setProcessingAction(null);
      }
    } catch (err) {
      setError('Failed to process response');
      setProcessingAction(null);
    }
  };

  const closeResult = () => {
      setModalPhase('list');
      setResultData(null);
  };

  const handleCloseModal = () => {
    if ((modalPhase === 'processing' && processingAction) || modalPhase === 'result') {
      if (onClose) onClose();
    } else {
      if (onClose) onClose();
    }
  };

  return (
    <>
      <div className={`w-[95%] sm:w-full max-w-2xl lg:max-w-[800px] h-[80vh] lg:h-[750px] flex flex-col rounded-2xl lg:rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${glassPanel}`}>
        <div className="relative z-20 flex justify-between items-center p-4 sm:p-6 lg:p-8 border-b border-white/10">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide truncate">Agent Unread</h2>
            <p className="text-white/50 text-xs sm:text-sm font-medium mt-1">
               {modalPhase === 'list' && 'Your intelligent inbox assistant'}
               {modalPhase === 'processing' && 'Processing active thread'}
               {modalPhase === 'result' && 'Action Report'}
            </p>
          </div>
          <button onClick={handleCloseModal} className="p-2 sm:p-3 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all duration-300 hover:rotate-90 shrink-0 ml-3">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          {modalPhase === 'list' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 sm:justify-between sm:items-center mb-6 lg:mb-8">
                <div className="flex p-1 bg-black/20 rounded-2xl w-fit border border-white/5">
                    {['all', 'today', 'week'].map((f) => (
                    <button key={f} onClick={() => filterEmails(f)} className={`px-3 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${filter === f ? 'bg-white text-black shadow-lg scale-105' : 'text-white/60 hover:text-white'}`}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                    ))}
                </div>
                <button onClick={handleSummarize} className="group flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-5 py-2 sm:py-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap text-sm">
                    <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 group-hover:rotate-12 transition-transform duration-300 shrink-0" />
                    <span className="font-bold tracking-wide hidden sm:inline">Summarize Inbox</span>
                    <span className="font-bold tracking-wide sm:hidden">Summarize</span>
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 sm:py-20 opacity-50">
                    <Loader className="w-8 sm:w-10 h-8 sm:h-10 animate-spin text-white mb-4" />
                    <p className="text-white/70 text-sm">Scanning inbox...</p>
                  </div>
                ) : error ? (
                  <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
                    <AlertCircle className="w-5 sm:w-6 h-5 sm:h-6 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-red-200 font-medium text-sm break-words">{error}</p>
                  </div>
                ) : filteredEmails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-white/30">
                    <Mail className="w-12 sm:w-16 h-12 sm:h-16 mb-4 opacity-50" />
                    <p className="text-lg sm:text-xl font-light">All caught up</p>
                  </div>
                ) : (
                  filteredEmails.map((email) => (
                      <EmailItem key={email.id} email={email} onClick={() => processEmail(email.id)} parseDate={parseEmailDate} />
                  ))
                )}
              </div>
            </div>
          )}

          {modalPhase === 'processing' && (
            <div className="animate-in slide-in-from-right-8 duration-500">
              <button onClick={() => setModalPhase('list')} disabled={processingAction !== null} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50">
                <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to List</span><span className="sm:hidden">Back</span>
              </button>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 flex items-start gap-3 sm:gap-4">
                  <AlertCircle className="w-5 sm:w-6 h-5 sm:h-6 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-200 font-medium text-sm break-words">{error}</p>
                </div>
              )}
              {!interrupt ? (
                <div className="flex flex-col items-center justify-center py-20 sm:py-24">
                  <div className="relative">
                      <div className={`absolute inset-0 ${processingAction === 'summarize' ? 'bg-purple-500' : 'bg-blue-500'} blur-xl opacity-20 animate-pulse`}></div>
                      <Loader className="w-12 sm:w-16 h-12 sm:h-16 animate-spin text-white relative z-10" />
                  </div>
                  <p className="text-white/80 mt-4 sm:mt-6 text-sm sm:text-lg font-light animate-pulse text-center px-4">
                    {processingAction === 'summarize' ? 'Reading your emails & generating summary...' : 'Analyzing context & tools...'}
                  </p>
                </div>
              ) : (
                <InterruptDisplay
                  interrupt={interrupt}
                  onAccept={() => handleInterruptResponse('accept')}
                  onEdit={(args) => handleInterruptResponse('edit', args)}
                  onIgnore={() => handleInterruptResponse('ignore')}
                  onResponse={(args) => handleInterruptResponse('response', args)}
                  onTriageResponse={() => handleInterruptResponse('response')}
                  onTriageIgnore={() => handleInterruptResponse('ignore')}
                  processingAction={processingAction}
                  editMode={editMode}
                  setEditMode={setEditMode}
                  editValues={editValues}
                  setEditValues={setEditValues}
                  inputStyle={inputStyle}
                  glassButton={glassButton}
                />
              )}
            </div>
          )}

          {modalPhase === 'result' && resultData && (
             <ResultDisplay data={resultData} onClose={closeResult} />
          )}

        </div>
      </div>
    </>
  );
}