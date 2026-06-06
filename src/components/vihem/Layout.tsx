import { ReactNode } from "react";
import ChatWidget from "@/components/chat/ChatWidget";
import TopBar from "./TopBar";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-background text-foreground">
    <TopBar />
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
    <ChatWidget />
  </div>
);

export default Layout;