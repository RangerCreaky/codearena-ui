import { getSession, signOut, getCsrfToken } from "next-auth/react";

export async function fetchWithAuth(url: string | URL | globalThis.Request, options: RequestInit = {}): Promise<Response> {
  const session = await getSession();
  
  if (!session?.accessToken) {
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

        // Retry the original request with the new access token
        headers.set("Authorization", `Bearer ${data.accessToken}`);
        response = await fetch(url, {
          ...options,
          headers,
        });
      } else {
        // Refresh token is also expired or invalid
        console.error("Session completely expired. Logging out.");
        await signOut({ callbackUrl: "/" });
      }
    } catch (refreshErr) {
      console.error("Failed to refresh token", refreshErr);
      await signOut({ callbackUrl: "/" });
    }
  }

  return response;
}
