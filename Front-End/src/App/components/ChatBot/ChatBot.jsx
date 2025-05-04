import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "../../Pages/styles/ChatBot.css";

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setMessages([{ sender: "bot", text: "Como posso ajudar?" }]);
      inputRef.current?.focus();
    } else {
      setMessages([]);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: input }),
      });
      const data = await res.json();
      setMessages([...newMessages, { sender: "bot", text: data.resposta }]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { sender: "bot", text: "Erro ao obter resposta." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div
        className="chat-toggle"
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? "Fechar chatbot" : "Abrir chatbot"}
      >
        💬
      </motion.div>

      {open && (
        <motion.div
          className="chat-box"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
        >
          <div className="chat-header">
            <strong>StudIA - Suporte</strong>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar chatbot"
            >
              ✖
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                className={`message ${msg.sender === "user" ? "user" : "bot"}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {msg.text}
              </motion.div>
            ))}
            {isLoading && (
              <div className="loading-message">Carregando...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <input
              ref={inputRef}
              type="text"
              placeholder="Digite sua dúvida..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && sendMessage()}
              disabled={isLoading}
              aria-label="Digite sua mensagem"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              aria-label="Enviar mensagem"
            >
              ➤
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default ChatBot;