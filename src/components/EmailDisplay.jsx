export default function EmailDisplay({ args, editMode, setEditValues, editValues, inputStyle }) {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-white/60 text-xs font-bold uppercase ml-1">To</label>
          <input 
            type="text" 
            value={editMode ? editValues.to_email || '' : args.to_email || ''} 
            onChange={(e) => setEditValues({ ...editValues, to_email: e.target.value })} 
            disabled={!editMode} 
            className={`${inputStyle} mt-2 disabled:opacity-60 disabled:cursor-not-allowed`} 
          />
        </div>
        <div>
          <label className="text-white/60 text-xs font-bold uppercase ml-1">Subject</label>
          <input 
            type="text" 
            value={editMode ? editValues.subject || '' : args.subject || ''} 
            onChange={(e) => setEditValues({ ...editValues, subject: e.target.value })} 
            disabled={!editMode} 
            className={`${inputStyle} mt-2 disabled:opacity-60 disabled:cursor-not-allowed`} 
          />
        </div>
        <div>
          <label className="text-white/60 text-xs font-bold uppercase ml-1">Body</label>
          <textarea 
            value={editMode ? editValues.body_text || '' : args.body_text || ''} 
            onChange={(e) => setEditValues({ ...editValues, body_text: e.target.value })} 
            disabled={!editMode} 
            className={`${inputStyle} mt-2 h-32 resize-none disabled:opacity-60 disabled:cursor-not-allowed custom-scrollbar`} 
          />
        </div>
      </div>
    );
  }