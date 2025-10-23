import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY on server" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: {
            type: "realtime",
            model: "gpt-realtime",
          },
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Failed to fetch ephemeral key", details: text },
        { status: 500 }
      );
    }

    const data = await res.json();
    // The response includes { value: "ek_...", ... }
    return NextResponse.json({ value: data?.value });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
