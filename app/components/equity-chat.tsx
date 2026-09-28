"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

type Language = "es" | "en";
type Theme = "light" | "dark";
type MessageRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: MessageRole;
  text: string;
  source?: "gemini" | "demo";
};

type IconName = "book" | "globe" | "moon" | "plus" | "send" | "sparkle" | "sun" | "target" | "users";

const copy = {
  es: {
    language: "Español",
    newChat: "Nuevo chat",
    lightTheme: "Cambiar a modo claro",
    darkTheme: "Cambiar a modo oscuro",
    online: "Gemini conectado",
    title: "Hola, soy Equa",
    subtitle: "Pregúntame lo que quieras sobre igualdad de género.",
    placeholder: "Escribe tu pregunta...",
    send: "Enviar pregunta",
    suggestions: "Prueba con una pregunta",
    prompts: [
      { icon: "book" as IconName, label: "¿Cuántos años lleva esta lucha?" },
      { icon: "target" as IconName, label: "¿Dónde es más grande la brecha?" },
      { icon: "users" as IconName, label: "¿Qué significa igualdad de género?" },
    ],
    welcome:
      "Estoy aquí para ayudarte a entender la igualdad de género desde la historia, los datos y la vida cotidiana. ¿Por dónde empezamos?",
    now: "ahora",
    thinking: "pensando",
    retrying: "probando otro modelo",
    gemini: "Respuesta de Gemini",
    demo: "Respuesta de demostración",
    disclaimer: "Equa puede equivocarse. Para cifras actuales, revisa siempre la fuente y el año.",
    error: "No pude conectarme ahora. Inténtalo de nuevo en un momento.",
  },
  en: {
    language: "English",
    newChat: "New chat",
    lightTheme: "Switch to light mode",
    darkTheme: "Switch to dark mode",
    online: "Gemini connected",
    title: "Hi, I’m Equa",
    subtitle: "Ask me anything about gender equality.",
    placeholder: "Write your question...",
    send: "Send question",
    suggestions: "Try a question",
    prompts: [
      { icon: "book" as IconName, label: "How long has this movement existed?" },
      { icon: "target" as IconName, label: "Where is the gap the widest?" },
      { icon: "users" as IconName, label: "What does gender equality mean?" },
    ],
    welcome:
      "I’m here to help you understand gender equality through history, data and everyday life. Where should we begin?",
    now: "now",
    thinking: "thinking",
    retrying: "trying another model",
    gemini: "Gemini response",
    demo: "Demo response",
    disclaimer: "Equa can make mistakes. For current figures, always check the source and year.",
    error: "I could not connect right now. Try again in a moment.",
  },
};

const welcomeMessage = (language: Language): ChatMessage => ({
  id: "welcome",
  role: "assistant",
  text: copy[language].welcome,
  source: "demo",
});

function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "book") return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20M8 7h8M8 11h6" /></svg>;
  if (name === "globe") return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="M3.8 9h16.4M3.8 15h16.4M12 3.5c2 2.3 3 5.1 3 8.5s-1 6.2-3 8.5c-2-2.3-3-5.1-3-8.5s1-6.2 3-8.5Z" /></svg>;
  if (name === "moon") return <svg {...common}><path d="M20.2 15.7A8.5 8.5 0 0 1 8.3 3.8 8.5 8.5 0 1 0 20.2 15.7Z" /></svg>;
  if (name === "plus") return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "send") return <svg {...common}><path d="m21 3-7.2 18-3.2-7.6L3 10.2 21 3Z" /><path d="M10.6 13.4 21 3" /></svg>;
  if (name === "sun") return <svg {...common}><circle cx="12" cy="12" r="3.6" /><path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4M18.7 18.7l-1.4-1.4M6.7 6.7 5.3 5.3" /></svg>;
  if (name === "target") return <svg {...common}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></svg>;
  if (name === "users") return <svg {...common}><path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 10.5A3.5 3.5 0 1 0 9.5 3a3.5 3.5 0 0 0 0 7.5ZM17 11a3 3 0 1 0 0-6M20.5 20v-1.5a4 4 0 0 0-3-3.8" /></svg>;
  return <svg {...common}><path d="m12 3-1.2 5.8L5 10l5.8 1.2L12 17l1.2-5.8L19 10l-5.8-1.2L12 3ZM19 15l-.5 2.5L16 18l2.5.5L19 21l.5-2.5L22 18l-2.5-.5L19 15Z" /></svg>;
}

export function EquityChat() {
  const [language, setLanguage] = useState<Language>("es");
  const [theme, setTheme] = useState<Theme>("light");
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage("es")]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<"thinking" | "retrying">("thinking");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = copy[language];

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("equa-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      const timer = window.setTimeout(() => setTheme(savedTheme), 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("equa-theme", theme);
  }, [theme]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isLoading]);

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    setMessages((current) => current.length === 1 && current[0].id === "welcome" ? [welcomeMessage(nextLanguage)] : current);
  }

  function newChat() {
    setMessages([welcomeMessage(language)]);
    setInput("");
  }

  async function submitMessage(rawMessage: string) {
    const message = rawMessage.trim();
    if (!message || isLoading) return;

    const history = messages.filter((item) => item.id !== "welcome");
    setMessages((current) => [...current, { id: `${Date.now()}-user`, role: "user", text: message }]);
    setInput("");
    setIsLoading(true);
    setLoadingStage("thinking");
    const retryTimer = window.setTimeout(() => setLoadingStage("retrying"), 6000);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, language, history, modelMode: "auto" }),
      });
      const data = (await response.json()) as { answer?: string; source?: "gemini" | "demo" };
      const answer = data.answer;
      if (!response.ok || !answer) throw new Error("chat_request_failed");
      setMessages((current) => [...current, { id: `${Date.now()}-assistant`, role: "assistant", text: answer, source: data.source ?? "demo" }]);
    } catch {
      setMessages((current) => [...current, { id: `${Date.now()}-error`, role: "assistant", text: t.error, source: "demo" }]);
    } finally {
      window.clearTimeout(retryTimer);
      setIsLoading(false);
      setLoadingStage("thinking");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitMessage(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitMessage(input);
    }
  }

  return (
    <main className="chat-page">
      <header className="simple-header">
        <button className="brand-button" onClick={newChat} aria-label={t.newChat}>
          <span className="brand-icon"><Icon name="sparkle" size={17} /></span>
          <span>Equa<span className="brand-dot">.</span></span>
        </button>
        <div className="header-actions">
          <span className="connection-status"><i />{t.online}</span>
          <div className="language-toggle" role="group" aria-label={t.language}>
            <Icon name="globe" size={14} />
            <button className={language === "es" ? "active" : ""} onClick={() => changeLanguage("es")}>ES</button>
            <button className={language === "en" ? "active" : ""} onClick={() => changeLanguage("en")}>EN</button>
          </div>
          <button className="theme-button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={theme === "light" ? t.darkTheme : t.lightTheme} title={theme === "light" ? t.darkTheme : t.lightTheme}>
            <Icon name={theme === "light" ? "moon" : "sun"} size={16} />
          </button>
        </div>
      </header>

      <section className="chat-shell" aria-label={t.title}>
        <div className="chat-heading">
          <span className="heading-icon"><Icon name="sparkle" size={19} /></span>
          <div><h1>{t.title}</h1><p>{t.subtitle}</p></div>
        </div>

        <div className="messages" aria-live="polite">
          {messages.map((message) => (
            <div className={`message-row ${message.role}`} key={message.id}>
              <span className={`message-avatar ${message.role === "user" ? "user-avatar" : ""}`}>{message.role === "user" ? (language === "es" ? "TÚ" : "YOU") : <Icon name="sparkle" size={14} />}</span>
              <div className="message-body">
                <div className="message-meta"><span>{message.role === "user" ? (language === "es" ? "Tú" : "You") : "Equa"}</span><span>·</span><span>{language === "es" ? t.now : t.now}</span></div>
                <div className="message-bubble">{message.text}</div>
                {message.role === "assistant" && message.id !== "welcome" && <span className="message-source">{message.source === "gemini" ? t.gemini : t.demo}</span>}
              </div>
            </div>
          ))}
          {isLoading && <div className="message-row"><span className="message-avatar"><Icon name="sparkle" size={14} /></span><div className="message-body"><div className="message-meta"><span>Equa</span><span>·</span><span>{loadingStage === "thinking" ? t.thinking : t.retrying}</span></div><div className="message-bubble"><span className="typing-dots"><i /><i /><i /></span></div></div></div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="suggestions"><span>{t.suggestions}</span><div className="suggestion-list">{t.prompts.map((prompt) => <button key={prompt.label} onClick={() => void submitMessage(prompt.label)}><Icon name={prompt.icon} size={14} />{prompt.label}</button>)}</div></div>
        <form className="composer" onSubmit={handleSubmit}><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} placeholder={t.placeholder} aria-label={t.placeholder} rows={1} /><button className="send-button" type="submit" disabled={isLoading || !input.trim()} aria-label={t.send}><Icon name="send" size={16} /></button></form>
        <p className="disclaimer">{t.disclaimer}</p>
      </section>
    </main>
  );
}
