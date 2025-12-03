export default function MeetingDisplay({ args, editMode, setEditValues, editValues, inputStyle }) {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-white/60 text-xs font-bold uppercase ml-1">Title</label>
          <input 
            type="text" 
            value={editMode ? editValues.title || '' : args.title || ''} 
            onChange={(e) => setEditValues({ ...editValues, title: e.target.value })} 
            disabled={!editMode} 
            className={`${inputStyle} mt-2 disabled:opacity-60 disabled:cursor-not-allowed`} 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-white/60 text-xs font-bold uppercase ml-1">Start</label>
            <input 
              type="text" 
              value={editMode ? editValues.start_time || '' : args.start_time || ''} 
              onChange={(e) => setEditValues({ ...editValues, start_time: e.target.value })} 
              disabled={!editMode} 
              className={`${inputStyle} mt-2 disabled:opacity-60 disabled:cursor-not-allowed`} 
            />
          </div>
          <div>
            <label className="text-white/60 text-xs font-bold uppercase ml-1">End</label>
            <input 
              type="text" 
              value={editMode ? editValues.end_time || '' : args.end_time || ''} 
              onChange={(e) => setEditValues({ ...editValues, end_time: e.target.value })} 
              disabled={!editMode} 
              className={`${inputStyle} mt-2 disabled:opacity-60 disabled:cursor-not-allowed`} 
            />
          </div>
        </div>
      </div>
    );
  }