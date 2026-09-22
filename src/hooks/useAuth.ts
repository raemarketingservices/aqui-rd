import { useState, useCallback, useEffect } from "react";
import { supabaseApi, setAuthToken, getAuthToken } from "../services/supabaseApi";
import toast from "react-hot-toast";

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  vendor?: any;
  vendorId?: string;
}

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(() => {
    const saved = localStorage.getItem("uniko_user_id");
    return saved ? saved : null;
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const loginMutation = useCallback(async (email: string, password: string) => {
    const result = await supabaseApi.auth.login(email, password);

    // Save auth data
    localStorage.setItem("uniko_user_id", result.user.id);
    localStorage.setItem("uniko_token", result.token);
    setAuthToken(result.token);
    setUserId(result.user.id);

    // Combine user and vendor data
    const fullUser: User = {
      _id: result.user.id,
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      phone: result.user.phone,
      avatar: result.user.avatar,
      vendor: result.vendor,
      vendorId: result.vendor?.id,
    };
    setUser(fullUser);

    toast.success(`Bienvenido, ${result.user.name}!`);
    return fullUser;
  }, []);

  const registerMutation = useCallback(async (data: { name: string; email: string; password: string; role: string; phone?: string }) => {
    const result = await supabaseApi.auth.register(data.name, data.email, data.password, data.role);

    localStorage.setItem("uniko_user_id", result.user.id);
    localStorage.setItem("uniko_token", result.token);
    setAuthToken(result.token);
    setUserId(result.user.id);

    const fullUser: User = {
      _id: result.user.id,
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: data.role,
      phone: data.phone,
    };
    setUser(fullUser);

    toast.success("Cuenta creada exitosamente!");
    return result.user.id;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("uniko_user_id");
    localStorage.removeItem("uniko_token");
    setAuthToken(null);
    setUserId(null);
    setUser(null);
    toast.success("Sesión cerrada");
  }, []);

  // When userId changes, fetch user data
  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        try {
          const userData = await supabaseApi.auth.getMe(userId);
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      };
      fetchUser();
    } else {
      setUser(null);
      setAuthLoading(false);
    }
  }, [userId]);

  return {
    user: user as User | null | undefined,
    isAuthenticated: !!userId && !!user,
    isLoading: authLoading || (user === undefined && !!userId),
    login: loginMutation,
    register: registerMutation,
    logout,
    userId,
  };
}