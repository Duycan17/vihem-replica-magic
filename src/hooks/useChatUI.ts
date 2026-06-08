import { useCallback, useState } from "react";
import { mockChatEngine } from "@/components/chat/chatdata";
import type { ChatEngine, ChatMessage } from "@/types/chat";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Xin chào! Tôi là trợ lý ảo của Vihem. Bạn cần tư vấn sản phẩm, dịch vụ hay thông tin nào?",
  createdAt: new Date(),
};

const uid = () => crypto.randomUUID();

interface UseChatUIOptions {
  engine?: ChatEngine;
}

export const useChatUI = ({ engine = mockChatEngine }: UseChatUIOptions = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const close = useCallback(() => setIsOpen(false), []);

  const sendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMsg: ChatMessage = { id: uid(), role: "user", content: trimmed, createdAt: new Date() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        const reply = await engine.sendMessage(trimmed, [...messages, userMsg]);
        setMessages((prev) => [...prev, { id: uid(), role: "assistant", content: reply, createdAt: new Date() }]);
      } finally {
        setIsTyping(false);
      }
    },
    [engine, isTyping, messages],
  );

  const send = useCallback(() => sendText(input), [input, sendText]);

  const reset = useCallback(() => {
    setMessages([WELCOME]);
    setInput("");
    setIsTyping(false);
  }, []);

  return { isOpen, toggle, close, messages, input, setInput, isTyping, send, sendText, reset };
};
