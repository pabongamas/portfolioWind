import { NextResponse } from "next/server";

export async function GET(req: Request) {
    console.log("entro")
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect("/?error=missing_code");

  const base = "https://graph.facebook.com/v19.0";
  // short-lived
  const shortRes = await fetch(
    `${base}/oauth/access_token?client_id=${process.env.META_APP_ID}` +
    `&client_secret=${process.env.META_APP_SECRET}` +
    `&redirect_uri=${process.env.NEXT_PUBLIC_BASE_URL}/api/meta/callback` +
    `&code=${code}`
  );
  const short = await shortRes.json();

  // long-lived
  const longRes = await fetch(
    `${base}/oauth/access_token?grant_type=fb_exchange_token` +
    `&client_id=${process.env.META_APP_ID}` +
    `&client_secret=${process.env.META_APP_SECRET}` +
    `&fb_exchange_token=${short.access_token}`
  );
  const long = await longRes.json(); // { access_token, expires_in, token_type }

  // TODO: guarda long.access_token de forma segura (DB/Secrets)
  return NextResponse.redirect("/?ok=connected");
}