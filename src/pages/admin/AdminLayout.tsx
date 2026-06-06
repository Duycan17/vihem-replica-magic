import { Navigate, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FilePlus, ExternalLink, LogOut } from "lucide-react";

const AdminLayout = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-secondary">
      <aside className="w-56 bg-card border-r border-border flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-border">
          <span className="font-bold text-brand text-lg">Vihem CMS</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <Link
            to="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" /> Bài viết
          </Link>
          <Link
            to="/admin/posts/new"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary transition-colors"
          >
            <FilePlus className="h-4 w-4" /> Tạo bài mới
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary transition-colors"
          >
            <ExternalLink className="h-4 w-4" /> Xem website
          </a>
        </nav>
        <div className="p-3 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Đăng xuất
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
