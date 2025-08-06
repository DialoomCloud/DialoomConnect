import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from "./supabase";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = {};
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return headers;
}

export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    body?: unknown;
  }
): Promise<Response> {
  const { method = 'GET', body } = options || {};
  const authHeaders = await getAuthHeaders();
  
  // Handle FormData differently from JSON
  const isFormData = body instanceof FormData;
  
  console.log(`[apiRequest] ${method} ${url}`, {
    isFormData,
    bodyType: body ? body.constructor.name : 'none',
    hasAuthHeaders: !!authHeaders.Authorization
  });
  
  if (isFormData) {
    console.log('[apiRequest] FormData detected, entries:');
    for (let [key, value] of (body as FormData).entries()) {
      if (value instanceof File) {
        console.log(`  - ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  - ${key}:`, value);
      }
    }
  }
  
  const res = await fetch(url, {
    method,
    headers: {
      ...authHeaders,
      // Don't set Content-Type for FormData, let browser set it with boundary
      ...(body && !isFormData ? { "Content-Type": "application/json" } : {})
    },
    // Don't stringify FormData
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  console.log(`[apiRequest] Response: ${res.status} ${res.statusText}`);

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const authHeaders = await getAuthHeaders();
    
    const res = await fetch(queryKey.join("/") as string, {
      headers: authHeaders,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
