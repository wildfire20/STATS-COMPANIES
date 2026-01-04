import { useQuery } from "@tanstack/react-query";

interface DemoStatus {
  isDemo: boolean;
  name?: string;
  expiresAt?: string;
}

export function useDemo() {
  const { data, isLoading } = useQuery<DemoStatus>({
    queryKey: ["/api/demo/status"],
    retry: false,
  });

  return {
    isDemo: data?.isDemo ?? false,
    demoName: data?.name,
    demoExpiresAt: data?.expiresAt ? new Date(data.expiresAt) : undefined,
    isLoading,
  };
}
