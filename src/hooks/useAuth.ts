import { useState, useCallback, useEffect } from "react";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cms/me", { credentials: "include" })
      .then((res) => setIsAuthenticated(res.ok))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const res = await fetch("/api/cms/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const ok = res.ok;
    setIsAuthenticated(ok);
    return ok;
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/cms/logout", { method: "POST", credentials: "include" });
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, loading, login, logout };
};
