import React from 'react';
import { Bot, Send } from 'lucide-react';

export default function AIPage({
  aiChatHistory,
  aiInputText,
  setAiInputText,
  aiTyping,
  handleSendMessageToAI
}) {
  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.01)' }}>
        <Bot size={22} color="var(--color-primary)" />
        <div>
          <h4 style={{ fontWeight: '700', fontSize: '15px' }}>Antigravity AI Co-Pilot</h4>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Powered Assistant</span>
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {aiChatHistory.map((msg, idx) => {
          const isSelf = msg.sender.username !== 'Antigravity AI';
          return (
            <div 
              key={idx}
              className={`chat-bubble ${isSelf ? 'sent' : 'ai-msg'}`}
            >
              <span style={{ fontSize: '12.5px' }}>{msg.content}</span>
            </div>
          );
        })}
        {aiTyping && (
          <div className="chat-bubble ai-msg" style={{ padding: '8px 12px' }}>
            <span>Antigravity AI is typing...</span>
          </div>
        )}
      </div>

      {/* Action shortcuts */}
      <div style={{ display: 'flex', gap: '8px', padding: '8px 16px', borderTop: '1px solid var(--border-glass)', overflowX: 'auto' }}>
        <button onClick={() => setAiInputText('Draft a post about joining Connectify')} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}>
          💡 Draft Post
        </button>
        <button onClick={() => setAiInputText('Translate to Spanish: Everything is connected')} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}>
          🌐 Translate phrase
        </button>
        <button onClick={() => setAiInputText('Summarize the Connectify platform features')} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}>
          📝 Summarize features
        </button>
      </div>

      <form onSubmit={handleSendMessageToAI} style={{ display: 'flex', gap: '8px', padding: '12px', background: 'rgba(0,0,0,0.1)' }}>
        <input
          type="text"
          placeholder="Ask AI anything..."
          value={aiInputText}
          onChange={e => setAiInputText(e.target.value)}
          style={{ flex: 1, height: '36px' }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '6px 14px', height: '36px' }}>
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
