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
                error: "AI API Key not configured. Please add AI_API_KEY or CLAUDE_API_KEY to your .env file.",
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

    const { trades, openPositions, portfolioSummary, closedTrades, followUpQuestion, prevResponse } = data;

    const systemPrompt = `You are an expert quantitative trading assistant and risk coach answering a trader's follow-up question.
You have access to:
1. "openPositions": Active unclosed positions with symbol, direction (buy/sell), entry price, current mark price, quantity, position value ($), unrealized PnL ($), and unrealized PnL (%).
2. "portfolioSummary": Summary of active positions, total position value ($), and total portfolio unrealized PnL ($ and %).
3. "closedTrades": Historical completed trades.
4. "prevResponse": Previous report analysis context.

Instructions:
- Use the active "openPositions" data (entry price, mark price, quantity, unrealized PnL, PnL %) to specifically and accurately answer questions about active trades, unstopped positions, risk exposure, and portfolio health.
- Structure your response in a single JSON object matching this exact format:

{
  "answer": [
    // Array of detailed response paragraphs addressing the follow-up question using concrete data
  ]
}

IMPORTANT: You must return ONLY valid JSON with no markdown formatting, no backticks, no code block markers, and no additional text outside the JSON object.`;

    const userContent = JSON.stringify({
        openPositions: openPositions || [],
        portfolioSummary: portfolioSummary || null,
        closedTrades: closedTrades || trades || [],
        prevResponse,
        followUpQuestion,
    });

    try {
        let responseJson;

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
                            content: userContent,
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
            const rawContent = resultJson.choices?.[0]?.message?.content || "";
            const cleanedContent = cleanJsonResponse(rawContent);

            // Wrap in simulated Anthropic response structure to satisfy client-side parsing
            responseJson = {
                content: [
                    {
                        type: "text",
                        text: cleanedContent,
                    }
                ]
            };
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
                                text: userContent,
                            },
                        ],
                    },
                ],
            });
            responseJson = res;
        }

        return new Response(JSON.stringify(responseJson), {
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
