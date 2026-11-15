'use client';

import React, { useState, useEffect } from 'react';
import { PostComment } from '@/types';
import { X, MessageSquare, Send, User } from 'lucide-react';
import { getStoredComments, addCommentToPost } from '@/data/marketplace-store';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
  currentUsername?: string;
  onShowToast?: (text: string) => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  postId,
  postTitle,
  currentUsername = 'Teman Gaya',
  onShowToast
}) => {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (postId) {
      setComments(getStoredComments(postId));
    }
  }, [postId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newComment = addCommentToPost(postId, currentUsername, inputText.trim());
    setComments(prev => [newComment, ...prev]);
    setInputText('');
    if (onShowToast) {
      onShowToast('Komentar Anda berhasil dikirim!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div onClick={onClose} className="fixed inset-0" />

      <div className="relative w-full max-w-lg bg-[#FAF9F5] text-[#162D24] rounded-3xl shadow-2xl border border-[#D8D2C4] overflow-hidden flex flex-col max-h-[85vh] z-10">
        {/* Header */}
        <div className="bg-[#162D24] text-white p-4 px-6 flex items-center justify-between border-b border-[#254637]">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-[#8EA89D]" />
            <div>
              <h3 className="text-sm font-serif font-bold text-white leading-tight">
                Komentar ({comments.length})
              </h3>
              <p className="text-[10px] text-neutral-300 truncate max-w-[260px]">
                {postTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comment List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3.5 divide-y divide-neutral-200/60">
          {comments.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400 space-y-1">
              <MessageSquare className="w-8 h-8 mx-auto text-neutral-300 opacity-60" />
              <p className="font-semibold text-neutral-600">Belum ada komentar.</p>
              <p>Jadilah yang pertama memberikan tanggapan atau ulasan gaya!</p>
            </div>
          ) : (
            comments.map((c, i) => (
              <div key={c.id || i} className={`space-y-1 text-xs ${i > 0 ? 'pt-3' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-[#162D24]">
                    <div className="w-6 h-6 rounded-full bg-[#EAF2EE] text-[#162D24] flex items-center justify-center text-[10px]">
                      {c.author.charAt(0).toUpperCase()}
                    </div>
                    <span>{c.author}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">{c.timestamp}</span>
                </div>
                <p className="text-neutral-700 pl-8 leading-relaxed font-normal">
                  {c.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-3.5 bg-white border-t border-[#D8D2C4] flex items-center gap-2">
          <input
            type="text"
            placeholder="Tulis komentar atau tanya ukuran..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-[#FAF9F5] border border-[#DDD8CC] rounded-xl px-3.5 py-2 text-xs text-[#162D24] placeholder:text-neutral-400 focus:outline-none focus:border-[#162D24]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2 bg-[#162D24] hover:bg-[#203D31] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-[#8EA89D]" />
            <span>Kirim</span>
          </button>
        </form>
      </div>
    </div>
  );
};
