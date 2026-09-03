import { useAuth, useUser } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";

export function useLocalUser() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const localUser = useQuery<{ id: string; role: string }>({
    queryKey: ["/api/auth/me"],
    enabled: isLoaded && !!isSignedIn,
  });
  return {
    user,
    isLoading: !isLoaded || (isSignedIn && localUser.isLoading),
    isAuthenticated: !!isSignedIn,
    isAdmin: localUser.data?.role === "admin",
  };
}