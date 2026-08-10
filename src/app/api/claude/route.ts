import Anthropic from "@anthropic-ai/sdk";

function cleanJsonResponse(text: string): string {
    let responseText = text.trim();

    // Remove markdown code blocks if present
    if (responseText.startsWith("```")) {
        const lines = responseText.split("\n");
        if (lines[0].startsWith("```")) {
            lines.shift();
        }
        if (lines[lines.length - 1].trim() === "```") {
            lines.pop();
        }
        responseText = lines.join("\n").trim();
    }

    const firstBrace = responseText.indexOf("{");
    const lastBrace = responseText.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        responseText = responseText.substring(firstBrace, lastBrace + 1);
    }

    return responseText;
}

export async function POST(request: Request) {
    const apiKey = process.env.AI_API_KEY || process.env.CLAUDE_API_KEY;
    const baseURL = process.env.AI_BASE_URL;
    const model = process.env.AI_MODEL || "claude-3-7-sonnet-20250219";

    if (!apiKey) {
        return new Response(
            JSON.stringify({
                error: "AI API Key not configured in local environment. Please add AI_API_KEY or CLAUDE_API_KEY to your .env file.",
            }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    let data;
    try {
        data = await request.json();
    } catch {
        return new Response(
            JSON.stringify({ error: "Invalid JSON input." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    // Support both old array payload & new expanded AIPayload structure
    const payload = Array.isArray(data) ? { closedTrades: data, openPositions: [], portfolioSummary: null } : data;

    const systemPrompt = `You are an elite quantitative trading assistant and risk manager analyzing a trader's portfolio.
You will receive JSON input containing:
1. "openPositions": Active unclosed positions with entry price, mark price, quantity, position value, unrealized PnL, and unrealized PnL %.
2. "portfolioSummary": Total active positions, total position value, and total portfolio unrealized PnL.
3. "closedTrades": Historical completed trades.

Your tasks:
1. TIME MANAGEMENT ANALYSIS: Group closed trades by opening time in 3-hour intervals (e.g. 00:00-02:59, 03:00-05:59) and evaluate trading performance.
2. LIVE EXPOSURE & SAFETY CHECKLIST: Analyze active "openPositions" and "portfolioSummary" to generate 2-4 critical safety checklist items. Evaluate:
   - Position safety (unrealized PnL % < -10% or severe floating loss)
   - Style alignment (e.g. comparing past short/long win rates with current open positions)
   - Concentration & risk exposure (over-concentration in high volatility crypto assets or unmanaged positions).

Return ONLY valid JSON matching this exact structure:
{
  "claudeComments": {
    "generalObservations": [
      // Array of observations about trading patterns
    ],
    "recommendations": [
      // Array of actionable recommendations
    ]
  },
  "liveExposureChecklist": [
    {
      "status": "safe" | "warning" | "danger",
      "title": "Short risk indicator title",
      "message": "Actionable risk advice for current open positions"
    }
  ]
}

IMPORTANT: You must return ONLY valid JSON with no markdown formatting, no backticks, no code block markers, and no additional text outside the JSON object.`;

    try {
        let responseText = "";

        if (baseURL) {
            // OpenAI-compatible endpoint
            const url = `${baseURL.replace(/\/$/, "")}/chat/completions`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Trading Journal",
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt,
                        },
                        {
                            role: "user",
                            content: JSON.stringify(payload),
                        },
                    ],
                    temperature: 1,
                    max_tokens: 4000,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`AI API request failed: ${response.status} - ${errorText}`);
            }

            const resultJson = await response.json();
            responseText = resultJson.choices?.[0]?.message?.content || "";
        } else {
            // Native Anthropic SDK fallback
            const anthropic = new Anthropic({ apiKey });
            const res = await anthropic.messages.create({
                model,
                max_tokens: 4000,
                temperature: 1,
                system: systemPrompt,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(payload),
                            },
                        ],
                    },
                ],
            });

            const textContent = res.content.find((block) => block.type === "text");
            responseText = textContent?.text || "";
        }

        console.log("Raw AI response:", responseText);

        responseText = cleanJsonResponse(responseText);

        console.log("Cleaned AI response:", responseText);

        if (!responseText) {
             throw new Error("Empty response from AI");
        }

        let parsedResponse;
        try {
             parsedResponse = JSON.parse(responseText);
        } catch (e) {
             console.error("JSON Parse Error:", e);
             console.error("Failed to parse string:", responseText);
             throw new Error("Failed to parse AI response as JSON");
        }

        return new Response(JSON.stringify(parsedResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: unknown) {
        console.error("Error processing request:", error);

        let errorMessage = "An unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return new Response(
            JSON.stringify({
                error: errorMessage,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
