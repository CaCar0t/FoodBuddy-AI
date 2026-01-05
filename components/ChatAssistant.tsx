"use client";

import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { chatWithNutritionist } from '../services/geminiService';
import { Send, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatAssistantProps {
  profile: UserProfile;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ profile }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `สวัสดีครับคุณ ${profile.name}! \nผม FoodBuddy ยินดีให้คำปรึกษาเรื่องอาหารและโภชนาการครับ ถามได้เลย!` }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));

      const responseText = await chatWithNutritionist(history, userMsg, profile);
      
      setMessages(prev => [...prev, { role: 'model', text: responseText || "ขออภัยครับ เกิดข้อผิดพลาด" }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "ขออภัยครับ ระบบมีปัญหาชั่วคราว" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] md:h-[calc(100vh-2rem)] p-4 pb-24 md:pb-4">
      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full">
        {/* Header */}
        <div className="bg-white p-4 border-b border-gray-100 flex items-center gap-3 shadow-sm z-10">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500">
                <Bot size={24} />
            </div>
            <div>
                <h3 className="font-bold text-gray-800">ผู้ช่วยโภชนาการ</h3>
                <p className="text-xs text-green-500 flex items-center gap-1">● ออนไลน์</p>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' 
                    ? 'bg-pink-500 text-white rounded-tr-none shadow-md shadow-pink-200' 
                    : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none'
                }`}
                >
                {m.role === 'model' ? (
                    <div className="markdown-body">
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                ) : (
                    m.text
                )}
                </div>
            </div>
            ))}
            {loading && (
            <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex gap-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2">
            <input
                type="text"
                className="flex-1 border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-50 transition-all"
                placeholder="พิมพ์คำถามที่นี่..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={loading}
            />
            <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-pink-500 text-white p-4 rounded-2xl hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-pink-200"
            >
                <Send size={20} />
            </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;