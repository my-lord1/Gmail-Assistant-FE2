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
      title = 'Skipped (Low Priority)';
      message = 'The AI marked this as low priority/irrelevant and marked it as read.';
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
        message = 'You successfully handled the notification.';
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
      <div className={`w-[800px] h-[750px] max-w-[95vw] flex flex-col rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${glassPanel}`}>
        <div className="relative z-20 flex justify-between items-center p-8 border-b border-white/10">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-wide">Agent Unread</h2>
            <p className="text-white/50 text-sm font-medium">
               {modalPhase === 'list' && 'Your intelligent inbox assistant'}
               {modalPhase === 'processing' && 'Processing active thread'}
               {modalPhase === 'result' && 'Action Report'}
            </p>
          </div>
          <button onClick={handleCloseModal} className="p-3 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all duration-300 hover:rotate-90">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {modalPhase === 'list' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-8">
                <div className="flex p-1 bg-black/20 rounded-2xl w-fit border border-white/5">
                    {['all', 'today', 'week'].map((f) => (
                    <button key={f} onClick={() => filterEmails(f)} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${filter === f ? 'bg-white text-black shadow-lg scale-105' : 'text-white/60 hover:text-white'}`}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                    ))}
                </div>
                <button onClick={handleSummarize} className="group flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-all hover:scale-[1.02] active:scale-95">
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="font-bold tracking-wide text-sm">Summarize Inbox</span>
                </button>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <Loader className="w-10 h-10 animate-spin text-white mb-4" />
                    <p className="text-white/70">Scanning inbox...</p>
                  </div>
                ) : error ? (
                  <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 flex items-center gap-4">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                    <p className="text-red-200 font-medium">{error}</p>
                  </div>
                ) : filteredEmails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-white/30">
                    <Mail className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-xl font-light">All caught up</p>
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
              <button onClick={() => setModalPhase('list')} disabled={processingAction !== null} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50">
                <ArrowLeft className="w-4 h-4" /> Back to List
              </button>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8 flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
                  <p className="text-red-200 font-medium">{error}</p>
                </div>
              )}
              {!interrupt ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="relative">
                      <div className={`absolute inset-0 ${processingAction === 'summarize' ? 'bg-purple-500' : 'bg-blue-500'} blur-xl opacity-20 animate-pulse`}></div>
                      <Loader className="w-16 h-16 animate-spin text-white relative z-10" />
                  </div>
                  <p className="text-white/80 mt-6 text-lg font-light animate-pulse">
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