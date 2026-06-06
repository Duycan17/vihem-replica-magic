import { useCallback, useState } from "react";
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

export const useChatUI = ({ engine }: UseChatUIOptions = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const close = useCallback(() => setIsOpen(false), []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = { id: uid(), role: "user", content: text, createdAt: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const reply = engine
        ? await engine.sendMessage(text, [...messages, userMsg])
        : "Cảm ơn bạn đã liên hệ. Tính năng trả lời tự động đang được phát triển — đội ngũ Vihem sẽ hỗ trợ bạn sớm nhất.";
      setMessages((prev) => [...prev, { id: uid(), role: "assistant", content: reply, createdAt: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  }, [engine, input, isTyping, messages]);

  const reset = useCallback(() => {
    setMessages([WELCOME]);
    setInput("");
    setIsTyping(false);
  }, []);

  return { isOpen, toggle, close, messages, input, setInput, isTyping, send, reset };
};
