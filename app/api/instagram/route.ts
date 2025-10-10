import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(process.env.FEED_URL!, {
    headers: {
      "x-api-key": process.env.API_KEY!,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  console.log(data)
  return NextResponse.json(data);
}