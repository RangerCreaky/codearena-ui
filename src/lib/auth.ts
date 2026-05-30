import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { cookies } from "next/headers";
import type { AuthResponse } from "@/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, account, user, trigger, session }) {
      if (trigger === "update" && session) {
        if (session.accessToken) token.accessToken = session.accessToken;
        if (session.username !== undefined) token.username = session.username;
        if (session.displayName !== undefined) token.displayName = session.displayName;
        if (session.avatarUrl !== undefined) token.avatarUrl = session.avatarUrl;
        if (session.isGuest !== undefined) token.isGuest = session.isGuest;
      }

      // On initial sign-in, forward the Google id_token to our FastAPI backend
      if (account && account.id_token) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_token: account.id_token }),
            }
          );

          if (res.ok) {
            const data: AuthResponse = await res.json();
            token.accessToken = data.access_token;
            token.isNewUser = data.is_new_user;
            
            // Decode the JWT to get backend fields (username, display_name, etc.)
            try {
              const base64Url = data.access_token.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
              const parsed = JSON.parse(jsonPayload);
              
              token.username = parsed.username;
              token.displayName = parsed.display_name;
              token.avatarUrl = parsed.avatar_url;
              token.isGuest = parsed.is_guest;
            } catch (e) {
              console.error("Failed to decode backend access token:", e);
            }

            // Forward the refresh token cookie from the backend to the browser
            const setCookieHeader = res.headers.get("Set-Cookie");
            if (setCookieHeader) {
              try {
                // Parse a basic Set-Cookie header (FastAPI sends: refresh_token=value; HttpOnly; Secure; SameSite=Strict; Max-Age=...)
                const parts = setCookieHeader.split(";").map(part => part.trim());
                const [nameValue, ...options] = parts;
                const [cookieName, cookieValue] = nameValue.split("=");
                
                // Construct cookie options
                const cookieOpts: any = {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === "production",
                  sameSite: "strict",
                  path: "/auth/refresh",
                };
                
                // Extract Max-Age if present
                const maxAgePart = options.find(opt => opt.toLowerCase().startsWith("max-age="));
                if (maxAgePart) {
                  cookieOpts.maxAge = parseInt(maxAgePart.split("=")[1], 10);
                }

                // Await cookies API which is async in Next 15+
                const cookieStore = await cookies();
                cookieStore.set(cookieName, cookieValue, cookieOpts);
              } catch (cookieError) {
                console.error("Failed to set refresh token cookie (likely called from read-only context):", cookieError);
              }
            }
          } else {
            console.error("Backend auth failed:", res.status);
          }
        } catch (error) {
          console.error("Backend auth error:", error);
        }

        // Store user info from the Google profile
        if (user) {
          token.userId = user.id;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) session.accessToken = token.accessToken as string;
      if (token.isNewUser !== undefined) session.isNewUser = token.isNewUser as boolean;
      if (token.userId) session.userId = token.userId as string;
      if (token.username !== undefined) session.username = token.username as string | null;
      if (token.displayName !== undefined) session.displayName = token.displayName as string | null;
      if (token.avatarUrl !== undefined) session.avatarUrl = token.avatarUrl as string | null;
      if (token.isGuest !== undefined) session.isGuest = token.isGuest as boolean;
      return session;
    },
  },
  events: {
    async signOut() {
      try {
        const cookieStore = await cookies();
        const refreshTokenCookie = cookieStore.get("refresh_token");

        if (refreshTokenCookie) {
          // 1. Tell FastAPI backend to destroy the session/token
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
            method: "POST",
            headers: {
              "Cookie": `refresh_token=${refreshTokenCookie.value}`,
            },
          });

          // 2. Delete the refresh token locally so the browser forgets it
          cookieStore.delete("refresh_token");
        }
      } catch (err) {
        console.error("Failed to process backend logout:", err);
      }
    },
  },
});

export const { GET, POST } = handlers;
