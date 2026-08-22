import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

type Message = { role: 'user' | 'bot'; text: string };

// Bersihkan format markdown dari teks bot agar tidak terlihat sebagai simbol
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold** → bold
    .replace(/\*(.+?)\*/g, '$1')       // *italic* → italic
    .replace(/^#{1,6}\s+/gm, '')       // # Heading → Heading
    .replace(/^[\*\-]\s+/gm, '• ')    // * item / - item → • item
    .replace(/`(.+?)`/g, '$1')         // `code` → code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // [text](url) → text
    .trim();
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Shalom! Saya asisten AI GPdI Melati Depok. Ada yang bisa saya bantu?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: stripMarkdown(data.data?.response || 'Maaf, terjadi kesalahan.') 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Maaf, saya sedang offline.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "Jadwal ibadah minggu ini?",
    "Syarat baptis air",
    "Lokasi gereja"
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={clsx(
          "fixed bottom-6 right-6 bg-navy text-gold p-4 rounded-full shadow-lg shadow-navy/30",
          "hover:bg-navy-light hover:scale-105 transition-all z-50 flex items-center justify-center border border-gold/20",
          isOpen ? "hidden" : "flex"
        )}
      >
        <MessageSquare size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col border border-border-subtle"
            style={{ height: '500px', maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="bg-navy text-white p-4 flex justify-between items-center border-b border-gold/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-gold">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">Asisten AI Gereja</h3>
                  <p className="text-xs text-gold">Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-grow p-4 overflow-y-auto bg-sand-darker flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={clsx("flex gap-2 max-w-[85%]", msg.role === 'user' ? "self-end flex-row-reverse" : "self-start")}>
                  <div className={clsx("w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-1", msg.role === 'user' ? "bg-navy text-gold" : "bg-white text-navy border border-border-subtle")}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={clsx("p-3 rounded-2xl text-sm leading-relaxed shadow-sm", msg.role === 'user' ? "bg-navy text-white rounded-tr-sm" : "bg-white text-navy border border-border-subtle rounded-tl-sm")}>
                    {msg.role === 'bot'
                      ? msg.text.split('\n').map((line, i) => (
                          <span key={i}>{line}{i < msg.text.split('\n').length - 1 && <br />}</span>
                        ))
                      : msg.text
                    }
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 max-w-[85%] self-start">
                  <div className="w-6 h-6 rounded-full bg-white border border-border-subtle text-navy flex-shrink-0 flex items-center justify-center mt-1">
                    <Bot size={14} />
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-border-subtle rounded-tl-sm shadow-sm flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 bg-sand-darker flex flex-wrap gap-2">
                {quickQuestions.map(q => (
                  <button 
                    key={q} 
                    onClick={() => handleSend(q)}
                    className="text-[10px] font-bold uppercase tracking-wider bg-white border border-border-subtle text-navy px-3 py-1.5 rounded-full hover:border-gold hover:text-gold transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 bg-white border-t border-border-subtle flex gap-2">
              <input
                type="text"
                placeholder="Ketik pesan..."
                className="flex-grow bg-sand-dark rounded-full px-4 py-2 text-sm text-navy focus:outline-none focus:ring-1 focus:ring-gold border border-border-subtle"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend(input)}
              />
              <button 
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-navy text-gold rounded-full flex items-center justify-center hover:bg-navy-light disabled:opacity-50 transition-colors"
              >
                <Send size={16} className="ml-1" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
