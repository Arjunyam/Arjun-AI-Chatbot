const corsHeaders = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin"
};

function cors(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(x => x.trim()).filter(Boolean);
  const permitted = allowed.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin);
  return permitted ? { ...corsHeaders, "Access-Control-Allow-Origin": origin } : corsHeaders;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = cors(origin, env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    const url = new URL(request.url);
    if (url.pathname !== "/api/chat") return Response.json({ error: "Not found" }, { status: 404, headers });
    if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers });
    if (!headers["Access-Control-Allow-Origin"]) return Response.json({ error: "Origin not allowed" }, { status: 403 });
    if (!env.OPENAI_API_KEY) return Response.json({ error: "The AI service is not configured." }, { status: 503, headers });
    try {
      const body = await request.json();
      if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 20) {
        return Response.json({ error: "Please send between 1 and 20 messages." }, { status: 400, headers });
      }
      const messages = body.messages.map(m => {
        if (!["user", "assistant"].includes(m.role) || typeof m.content !== "string") throw new Error("Invalid message format.");
        return { role: m.role, content: m.content.slice(0, 8000) };
      });
      const ai = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || "gpt-4.1-mini",
          instructions: "You are Arjun AI, a helpful, clear, friendly general-purpose AI assistant. Answer accurately. If uncertain, say so. Format answers for readability.",
          input: messages.map(m => ({ role: m.role, content: [{ type: "input_text", text: m.content }] }))
        })
      });
      const result = await ai.json();
      if (!ai.ok) return Response.json({ error: result.error?.message || "The AI provider returned an error." }, { status: 502, headers });
      const reply = (result.output || []).flatMap(item => item.content || []).filter(item => item.type === "output_text").map(item => item.text).join("\n");
      return Response.json({ reply: reply || "I could not generate a response. Please try again." }, { headers });
    } catch (error) {
      return Response.json({ error: error.message || "Unexpected server error." }, { status: 400, headers });
    }
  }
};