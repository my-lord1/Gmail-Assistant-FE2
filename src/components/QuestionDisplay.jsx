export default function QuestionDisplay({ args, editValues, setEditValues, inputStyle }) {
    return (
      <div className="space-y-4">
        <p className="text-white text-lg font-medium">{args.content}</p>
        <textarea 
          value={editValues.answer || ''} 
          onChange={(e) => setEditValues({ ...editValues, answer: e.target.value })} 
          placeholder="Type your answer here..." 
          className={`${inputStyle} h-32 resize-none`} 
        />
      </div>
    );
  }