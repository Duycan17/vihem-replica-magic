import { useEffect, useRef, useState } from "react";
import { Bot, Menu, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { SUGGESTED_QUESTIONS } from "@/components/chat/chatdata";
import { useChatUI } from "@/hooks/useChatUI";
import type { ChatMessage } from "@/types/chat";

const formatTime = (date: Date) =>
  date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar className="h-7 w-7">
        <AvatarFallback className={cn("text-xs", isUser ? "bg-brand text-brand-foreground" : "bg-muted")}>
          {isUser ? "B" : <Bot className="h-3.5 w-3.5" />}
        </AvatarFallback>
      </Avatar>
      <div className={cn("flex max-w-[80%] flex-col gap-1", isUser && "items-end")}>
        <div
          className={cn(
            "whitespace-pre-line rounded-lg px-3 py-2 text-sm leading-relaxed",
            isUser ? "bg-brand text-brand-foreground" : "bg-muted text-foreground",
          )}
        >
          {message.content}
        </div>
        <span className="text-[11px] text-muted-foreground">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex gap-2">
    <Avatar className="h-7 w-7">
      <AvatarFallback className="bg-muted">
        <Bot className="h-3.5 w-3.5" />
      </AvatarFallback>
    </Avatar>
    <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-2">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
    </div>
  </div>
);

const SuggestedQuestions = ({
  disabled,
  onSelect,
  onClose,
}: {
  disabled: boolean;
  onSelect: (q: string) => void;
  onClose: () => void;
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <p className="text-[11px] text-muted-foreground">Gợi ý câu hỏi</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng gợi ý"
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
    <div className="flex flex-wrap gap-2">
      {SUGGESTED_QUESTIONS.map((q) => (
        <button
          key={q}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(q)}
          className="rounded-full border bg-background px-3 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          {q}
        </button>
      ))}
    </div>
  </div>
);

const ChatWidget = () => {
  const { isOpen, toggle, close, messages, input, setInput, isTyping, send, sendText } = useChatUI();
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    setSuggestionsOpen(false);
    send();
  };

  const handleSendText = (q: string) => {
    setSuggestionsOpen(false);
    sendText(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen && (
        <div
          role="dialog"
          aria-label="Trò chuyện với trợ lý Vihem"
          className="flex w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border bg-card shadow-sm sm:w-[380px]"
          style={{ maxHeight: "min(520px, calc(100dvh - 6rem))" }}
        >
          <header className="flex items-center justify-between border-b bg-brand px-4 py-3 text-brand-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-brand-dark text-brand-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold leading-none">Trợ lý Vihem</p>
                <p className="mt-0.5 text-xs opacity-80">Thường phản hồi ngay</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={close}
              aria-label="Đóng chat"
              className="h-8 w-8 text-brand-foreground hover:bg-brand-dark hover:text-brand-foreground"
            >
              <X />
            </Button>
          </header>

          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3"
            style={{ height: "min(360px, calc(100dvh - 14rem))" }}
          >
            <div className="flex flex-col gap-4">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {isTyping && <TypingIndicator />}
            </div>
          </div>

          <footer className="border-t">
            {suggestionsOpen && (
              <div className="border-b px-3 py-2">
                <SuggestedQuestions
                  disabled={isTyping}
                  onSelect={handleSendText}
                  onClose={() => setSuggestionsOpen(false)}
                />
              </div>
            )}
            <div className="flex items-end gap-2 p-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setSuggestionsOpen((v) => !v)}
                disabled={isTyping}
                aria-label={suggestionsOpen ? "Ẩn gợi ý câu hỏi" : "Hiện gợi ý câu hỏi"}
                aria-expanded={suggestionsOpen}
                className="h-10 w-10 shrink-0"
              >
                <Menu />
              </Button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
                rows={1}
                disabled={isTyping}
                aria-label="Nhập tin nhắn"
                className="max-h-24 min-h-[40px] flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                aria-label="Gửi tin nhắn"
                className="h-10 w-10 shrink-0 bg-brand text-brand-foreground hover:bg-brand-dark"
              >
                <Send />
              </Button>
            </div>
          </footer>
        </div>
      )}

      <Button
        size="icon"
        onClick={toggle}
        aria-label={isOpen ? "Thu gọn chat" : "Mở chat"}
        aria-expanded={isOpen}
        className="h-12 w-12 rounded-lg bg-brand text-brand-foreground shadow-sm hover:bg-brand-dark"
      >
        {isOpen ? <X /> : <MessageCircle />}
      </Button>
    </div>
  );
};

export default ChatWidget;
