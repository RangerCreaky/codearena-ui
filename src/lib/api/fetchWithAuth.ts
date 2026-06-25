import { getSession, signOut, getCsrfToken } from "next-auth/react";

let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  try {
    const refreshRes = await fetch("/api/auth/refresh-token", {
      method: "POST",
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      
      // Update the NextAuth session with the new fields
      const csrfToken = await getCsrfToken();
      await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csrfToken,
          data,
        }),
      });

      return data.accessToken;
    } else {
      console.error("Session completely expired. Logging out.");
      await signOut({ callbackUrl: "/" });
      return null;
    }
  } catch (refreshErr) {
    console.error("Failed to refresh token", refreshErr);
    await signOut({ callbackUrl: "/" });
    return null;
  } finally {
    refreshPromise = null;
  }
}

export async function fetchWithAuth(url: string | URL | globalThis.Request, options: RequestInit = {}, providedSession?: any): Promise<Response> {
  const session = providedSession || await getSession();
  
  if (!session?.accessToken) {
    console.error("fetchWithAuth failed: missing accessToken. Session object:", session);
    throw new Error("No access token available. User might not be authenticated.");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${session.accessToken}`);

  const config: RequestInit = {
    ...options,
    headers,
  };

  let response = await fetch(url, config);

  // If 401 Unauthorized, token might be expired. Try to refresh.
  if (response.status === 401) {
    if (!refreshPromise) {
      refreshPromise = performRefresh();
    }

    const newAccessToken = await refreshPromise;

    if (newAccessToken) {
      // Retry the original request with the new access token
      headers.set("Authorization", `Bearer ${newAccessToken}`);
      response = await fetch(url, {
        ...options,
        headers,
      });
    }
  }

  return response;
}
