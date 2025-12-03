"use client";

import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { api } from "~/trpc/react";

export interface User {
  id: number;
  email: string;
  role: "user" | "admin";
}

export function useAuth() {
  const [user, setUser, isLoading] = useLocalStorage<User | null>("user", null);
  const [token, setToken] = useLocalStorage<string | null>("token", null);
  const [visitorId, setVisitorId] = useLocalStorage<string>("visitorId", "");

  // Verify token on mount
  const { data: verifiedUser, isLoading: isVerifying } =
    api.quiz.verifyToken.useQuery(
      { token: token ?? "" },
      {
        enabled: !!token && !isLoading,
        retry: false,
      },
    );

  // Sync verified user with local state
  useEffect(() => {
    if (!isLoading && !isVerifying && token) {
      if (verifiedUser) {
        // Token is valid, update user if needed
        if (
          !user ||
          user.id !== verifiedUser.id ||
          user.email !== verifiedUser.email ||
          user.role !== verifiedUser.role
        ) {
          setUser(verifiedUser as User);
        }
      } else {
        // Token is invalid, clear auth state
        setUser(null);
        setToken(null);
      }
    }
  }, [verifiedUser, isVerifying, isLoading, token, user, setUser, setToken]);

  // Generate a visitor ID if none exists
  if (!isLoading && !visitorId && typeof window !== "undefined") {
    const newVisitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setVisitorId(newVisitorId);
  }

  const login = (userData: User & { token: string }) => {
    setUser({
      id: userData.id,
      email: userData.email,
      role: userData.role,
    });
    setToken(userData.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const isAdmin = user?.role === "admin";

  return {
    user,
    token,
    visitorId,
    isLoading: isLoading || (!!token && isVerifying),
    isAdmin,
    login,
    logout,
  };
}
