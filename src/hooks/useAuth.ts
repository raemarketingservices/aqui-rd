import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import toast from "react-hot-toast";

interface User {
  _id: Id<"users">;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  vendor?: any;
}

export function useAuth() {
  const [userId, setUserId] = useState<Id<"users"> | null>(() => {
    const saved = localStorage.getItem("aqui_user_id");
    return saved ? (saved as Id<"users">) : null;
  });

  const user = useQuery(api.users.getMe, userId ? { userId } : "skip");

  const loginMutation = useMutation(api.users.login as any);
  const registerMutation = useMutation(api.users.register);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginMutation({ email, password });
    if (!result) throw new Error("Credenciales inválidas");
    localStorage.setItem("aqui_user_id", result._id);
    setUserId(result._id);
    toast.success(`Bienvenido, ${result.name}!`);
    return result;
  }, [loginMutation]);

  const register = useCallback(async (data: { name: string; email: string; password: string; role: string; phone?: string }) => {
    const id = await registerMutation(data as any);
    localStorage.setItem("aqui_user_id", id);
    setUserId(id);
    toast.success("Cuenta creada exitosamente!");
    return id;
  }, [registerMutation]);

  const logout = useCallback(() => {
    localStorage.removeItem("aqui_user_id");
    setUserId(null);
    toast.success("Sesión cerrada");
  }, []);

  return {
    user: user as User | null | undefined,
    isAuthenticated: !!userId && user !== null && user !== undefined,
    isLoading: user === undefined && !!userId,
    login,
    register,
    logout,
    userId,
  };
}
