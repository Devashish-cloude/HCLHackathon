import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paperclip, Send, Plus, Trash2, Edit2, Loader2, Bot, User, Check, Copy } from 'lucide-react';
import api from '../services/api';

export const AIMentor: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(conversationId || null);
  const [inputText, setInputText] = useState('');
  
  // States
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [aiTyping, setAiTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch list of conversations
  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations);
        // Default to most recent conversation if none is active and there are items
        if (!activeConvId && res.data.conversations.length > 0) {
          const firstId = res.data.conversations[0].id;
          setActiveConvId(firstId);
          navigate(`/ai-mentor/${firstId}`, { replace: true });
        }
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch messages for active conversation
  const fetchMessages = async (id: string) => {
    setLoadingHistory(true);
    try {
      const res = await api.get(`/conversations/${id}`);
      if (res.data.success) {
        setMessages(res.data.conversation.messages);
      }
    } catch (err) {
      console.error('Failed to load message history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    }
  }, [activeConvId]);

  // Handle URL param synchronization
  useEffect(() => {
    if (conversationId && conversationId !== activeConvId) {
      setActiveConvId(conversationId);
    }
  }, [conversationId]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiTyping]);

  const handleStartNewChat = async () => {
    try {
      const res = await api.post('/conversations', { title: 'New Chat Session' });
      if (res.data.success) {
        const newId = res.data.conversation.id;
        setConversations(prev => [res.data.conversation, ...prev]);
        setActiveConvId(newId);
        setMessages([]);
        navigate(`/ai-mentor/${newId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await api.delete(`/conversations/${id}`);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConvId === id) {
        setActiveConvId(null);
        setMessages([]);
        navigate('/ai-mentor');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const currentInput = inputText;
    setInputText('');
    setAiTyping(true);

    // Optimistically update UI with user message
    const tempUserMsg = { id: 'temp-user', role: 'user', content: currentInput, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await api.post('/ai/chat', {
        message: currentInput,
        conversationId: activeConvId
      });

      if (res.data.success) {
        const aiMsg = res.data.aiResponse;
        
        // Update list of chats (to bubble up active conversation)
        fetchConversations();
        
        // Update messages state
        setMessages(prev => prev.filter(m => m.id !== 'temp-user').concat([res.data.userMessage, aiMsg]));
        
        if (!activeConvId) {
          setActiveConvId(res.data.conversationId);
          navigate(`/ai-mentor/${res.data.conversationId}`);
        }
      }
    } catch (err) {
      console.error(err);
      // Remove temporary message and warn user
      setMessages(prev => prev.filter(m => m.id !== 'temp-user'));
      alert('AI Mentor failed to respond. Please try again.');
    } finally {
      setAiTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Group chat history into Today, Yesterday, Older
  const groupConversations = () => {
    const today: any[] = [];
    const yesterday: any[] = [];
    const older: any[] = [];

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    conversations.forEach(c => {
      const date = new Date(c.updatedAt);
      const diff = now.getTime() - date.getTime();

      if (diff < oneDay && now.getDate() === date.getDate()) {
        today.push(c);
      } else if (diff < 2 * oneDay && now.getDate() - date.getDate() === 1) {
        yesterday.push(c);
      } else {
        older.push(c);
      }
    });

    return { today, yesterday, older };
  };

  const grouped = groupConversations();

  // Custom renderer for message paragraphs + code blocks
  const renderMessageContent = (content: string, msgId: string) => {
    const paragraphs = content.split('\n\n');
    return paragraphs.map((block, pIdx) => {
      if (block.startsWith('```')) {
        // Extract language and code content
        const lines = block.split('\n');
        const lang = lines[0].replace('```', '') || 'javascript';
        const code = lines.slice(1, -1).join('\n');
        const blockId = `${msgId}-${pIdx}`;

        return (
          <div key={pIdx} className="my-4 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 overflow-hidden shadow-lg">
            <div className="flex justify-between items-center bg-slate-950 px-4 py-2 border-b border-slate-800 text-[10px] font-bold text-slate-400">
              <span className="uppercase">{lang}</span>
              <button
                onClick={() => handleCopyCode(code, blockId)}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                {copiedId === blockId ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 font-mono text-xs overflow-x-auto text-emerald-400">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      return (
        <p key={pIdx} className="text-xs leading-relaxed mb-2 last:mb-0">
          {block.split('**').map((chunk, cIdx) => {
            if (cIdx % 2 === 1) {
              return <strong key={cIdx} className="font-extrabold text-slate-900">{chunk}</strong>;
            }
            // inline code check `code`
            return chunk.split('`').map((subChunk, sIdx) => {
              if (sIdx % 2 === 1) {
                return <code key={sIdx} className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px] font-bold">{subChunk}</code>;
              }
              return subChunk;
            });
          })}
        </p>
      );
    });
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)] overflow-hidden fade-in">
      
      {/* --- LEFT CHAT DIRECTORY LIST --- */}
      <aside className="hidden md:flex w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex-col justify-between shrink-0">
        <div className="space-y-6 flex-1 overflow-y-auto pr-1">
          {/* New Chat Button */}
          <button
            onClick={handleStartNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand-200 bg-brand-50 hover:bg-brand-100 py-2.5 text-xs font-bold text-brand-600 shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>

          {/* Grouped conversations list */}
          <div className="space-y-4 text-xs font-semibold">
            {/* Today */}
            {grouped.today.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block px-2 mb-1">Today</span>
                {grouped.today.map(c => (
                  <div
                    key={c.id}
                    onClick={() => { setActiveConvId(c.id); navigate(`/ai-mentor/${c.id}`); }}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      activeConvId === c.id 
                        ? 'bg-brand-50 text-brand-700 font-bold' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate flex-1 pr-2">{c.title}</span>
                    <button 
                      onClick={(e) => handleDeleteChat(c.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Yesterday */}
            {grouped.yesterday.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block px-2 mb-1">Yesterday</span>
                {grouped.yesterday.map(c => (
                  <div
                    key={c.id}
                    onClick={() => { setActiveConvId(c.id); navigate(`/ai-mentor/${c.id}`); }}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      activeConvId === c.id 
                        ? 'bg-brand-50 text-brand-700 font-bold' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate flex-1 pr-2">{c.title}</span>
                    <button 
                      onClick={(e) => handleDeleteChat(c.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Older */}
            {grouped.older.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block px-2 mb-1">Older</span>
                {grouped.older.map(c => (
                  <div
                    key={c.id}
                    onClick={() => { setActiveConvId(c.id); navigate(`/ai-mentor/${c.id}`); }}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      activeConvId === c.id 
                        ? 'bg-brand-50 text-brand-700' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate flex-1 pr-2">{c.title}</span>
                    <button 
                      onClick={(e) => handleDeleteChat(c.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {conversations.length === 0 && (
              <p className="text-center py-6 text-[10px] text-slate-400 font-semibold">No chats found. Start one above!</p>
            )}
          </div>
        </div>
      </aside>

      {/* --- RIGHT CHAT MAIN WINDOW WORKSPACE --- */}
      <div className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between overflow-hidden">
        {/* Chat window Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-none">
              {conversations.find(c => c.id === activeConvId)?.title || 'AI Mentor Chat'}
            </h3>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 mt-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              AI Mentor Online
            </span>
          </div>
        </div>

        {/* Message bubble stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
          {loadingHistory ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div key={msg.id} className={`flex gap-4 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                    {/* Bot avatar */}
                    {isAssistant && (
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100 shrink-0 shadow-sm">
                        <Bot className="h-5 w-5" />
                      </div>
                    )}

                    {/* Bubble content */}
                    <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm border ${
                      isAssistant 
                        ? 'bg-white border-slate-100 text-slate-700' 
                        : 'bg-brand-500 border-brand-600 text-white selection:bg-brand-600 selection:text-white'
                    }`}>
                      {/* Name label */}
                      <span className={`text-[10px] font-bold block mb-1.5 ${
                        isAssistant ? 'text-slate-400' : 'text-brand-100 text-right'
                      }`}>
                        {isAssistant ? 'AI Mentor' : 'You'}
                      </span>
                      <div>
                        {isAssistant ? (
                          renderMessageContent(msg.content, msg.id)
                        ) : (
                          <p className="text-xs leading-relaxed">{msg.content}</p>
                        )}
                      </div>
                    </div>

                    {/* User Avatar */}
                    {!isAssistant && (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold shrink-0">
                        U
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Blinking typing dots */}
              {aiTyping && (
                <div className="flex gap-4 justify-start">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100 shrink-0">
                    <Bot className="h-5 w-5 animate-bounce" />
                  </div>
                  <div className="rounded-2xl p-4 bg-white border border-slate-100 text-slate-500 shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input workspace bottom area */}
        <div className="px-6 py-4 border-t border-slate-100 shrink-0 bg-white">
          <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-2 focus-within:border-brand-500 focus-within:bg-white transition-all">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
              <Paperclip className="h-4.5 w-4.5" />
            </button>
            <textarea
              rows={1}
              placeholder="Message AI Mentor..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 max-h-32 min-h-[2.25rem] bg-transparent py-1.5 px-1 text-xs outline-none resize-none leading-relaxed text-slate-800 placeholder-slate-400"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || aiTyping}
              className="p-2.5 rounded-xl bg-brand-500 text-white shadow-premium hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="text-[9px] text-slate-400 font-semibold block text-center mt-2.5">
            AI Mentor can make mistakes. Consider verifying important information.
          </span>
        </div>
      </div>
    </div>
  );
};
