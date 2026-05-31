import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { RefreshResponse } from "@/types";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshTokenCookie = cookieStore.get("refresh_token");

    if (!refreshTokenCookie) {
      console.error("[Refresh Token Route] No refresh_token cookie found in request!");
      return NextResponse.json({ error: "No refresh token available" }, { status: 401 });
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Cookie": `refresh_token=${refreshTokenCookie.value}`,
      },
    });

    if (!res.ok) {
      // Refresh failed (e.g. expired refresh token)
      console.error(`[Refresh Token Route] FastAPI returned ${res.status} for refresh token.`);
      const errText = await res.text().catch(() => "");
      console.error(`[Refresh Token Route] FastAPI error response:`, errText);
      return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    }

    const data: RefreshResponse = await res.json();

    // The backend may send a new Set-Cookie for the refresh_token
    const setCookieHeader = res.headers.get("Set-Cookie");
    if (setCookieHeader) {
      const parts = setCookieHeader.split(";").map(part => part.trim());
      const [nameValue, ...options] = parts;
      const [cookieName, cookieValue] = nameValue.split("=");
      
      const cookieOpts: any = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/auth/refresh", // Must match whatever the backend expects/sets
      };
      
      const maxAgePart = options.find(opt => opt.toLowerCase().startsWith("max-age="));
      if (maxAgePart) {
        cookieOpts.maxAge = parseInt(maxAgePart.split("=")[1], 10);
      }

      cookieStore.set(cookieName, cookieValue, cookieOpts);
    }

    // Decode the new access token to update the NextAuth session properly
    let newFields = {};
    try {
      const base64Url = data.access_token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
      newFields = JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Failed to decode backend access token:", e);
    }

    return NextResponse.json({ 
      accessToken: data.access_token,
      ...newFields,
    });
  } catch (error) {
    console.error("Refresh route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
