import { useState, useCallback, useEffect } from "react";
import { supabaseApi, setAuthToken, getAuthToken, type SupabaseUser, type SupabaseVendor } from "../services/supabaseApi";
import toast from "react-hot-toast";

interface AuthUser extends SupabaseUser {
  vendor?: SupabaseVendor;
}

export function useAuthSupabase() {
  const [userId, setUserId] = useState<string | null>(() => {
    const saved = localStorage.getItem("uniko_user_id");
    return saved ? saved : null;
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Initialize user from token on mount
  useEffect(() => {
    const token = getAuthToken();
    const savedUserId = localStorage.getItem("uniko_user_id");

    if (token && savedUserId) {
      // Optionally verify token with backend
      // For now, we'll just set the userId and let the component fetch user data
      setUserId(savedUserId);
    } else if (!token) {
      setUserId(null);
      setUser(null);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const result = await supabaseApi.auth.login(email, password);

      // Save auth data
      localStorage.setItem("uniko_user_id", result.user.id);
      localStorage.setItem("uniko_token", result.token);
      setAuthToken(result.token);
      setUserId(result.user.id);

      // Combine user and vendor data
      const fullUser: AuthUser = {
        ...result.user,
        vendor: result.vendor || undefined,
      };
      setUser(fullUser);

      toast.success(`Bienvenido, ${result.user.name}!`);
      return fullUser;
    } catch (error: any) {
      setAuthLoading(false);
      throw error;
    }
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string; role: string; phone?: string }) => {
    setAuthLoading(true);
    try {
      const result = await supabaseApi.auth.register(data.name, data.email, data.password, data.role);

      localStorage.setItem("uniko_user_id", result.user.id);
      localStorage.setItem("uniko_token", result.token);
      setAuthToken(result.token);
      setUserId(result.user.id);

      const fullUser: AuthUser = {
        ...result.user,
        vendor: undefined,
      };
      setUser(fullUser);

      toast.success("Cuenta creada exitosamente!");
      return { id: result.user.id, role: data.role };
    } catch (error) {
      setAuthLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("uniko_user_id");
    localStorage.removeItem("uniko_token");
    setAuthToken(null);
    setUserId(null);
    setUser(null);
    toast.success("Sesión cerrada");
  }, []);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    try {
      const userData = await supabaseApi.auth.getMe(userId);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }, [userId]);

  // When userId changes, fetch user data
  useEffect(() => {
    if (userId) {
      fetchUser();
    } else {
      setUser(null);
      setAuthLoading(false);
    }
  }, [userId, fetchUser]);

  return {
    user: user || undefined,
    isAuthenticated: !!userId && !!user,
    isLoading: authLoading || (user === undefined && !!userId),
    login,
    register,
    logout,
    userId,
    fetchUser,
  };
}

// Helper to get the current token for direct API calls
export function getCurrentToken(): string | null {
  return getAuthToken();
}

// Helper to check if user has a specific role
export function hasRole(user: AuthUser | undefined, roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}