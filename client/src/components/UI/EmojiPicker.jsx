import React, { useState } from 'react';
import { HiEmojiHappy } from 'react-icons/hi';
import './EmojiPicker.css';

const emojiGroups = [
  {
    name: 'Smileys',
    emojis: ['😊', '😄', '😍', '😂', '😉', '😎', '😇', '😋', '🥳', '🤔', '😐', '😔', '😢', '😭', '😡', '😱']
  },
  {
    name: 'Hands & Hearts',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '👏', '🙌', '🙏', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔']
  },
  {
    name: 'Wellbeing & Growth',
    emojis: ['🧘', '🌱', '☀️', '🌈', '🔥', '✨', '🌟', '💫', '🎯', '🏆', '🎨', '📚', '💼', '💪', '🧠', '🌿']
  }
];

const EmojiPicker = ({ onSelect, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (emoji) => {
    onSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div className="emoji-picker-wrapper">
      <button
        type="button"
        className="emoji-picker-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Insert Emoji"
      >
        <HiEmojiHappy />
      </button>

      {isOpen && (
        <>
          <div className="emoji-picker-backdrop" onClick={() => setIsOpen(false)}></div>
          <div className={`emoji-picker-popup align-${align}`}>
            {emojiGroups.map((group) => (
              <div key={group.name} className="emoji-group">
                <span className="emoji-group-title">{group.name}</span>
                <div className="emoji-grid">
                  {group.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="emoji-item"
                      onClick={() => handleSelect(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default EmojiPicker;
