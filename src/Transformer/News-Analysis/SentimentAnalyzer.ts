// Modelo de IA para análisis de sentimientos
// Usando MCP para contexto

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.API_KEY_OPEN_IA,
});

export class SentimentAnalyzer {
  async analyzeSentiment(
    text: string
  ): Promise<{ sentiment: string; score: number }> {
    try {
      const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o";
      const FALLB4oACKS = (
        process.env.OPENAI_MODEL_FALLBACKS || "gpt-4o-mini,gpt-4o"
      )
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
      const MAX_TOKENS = 2000;

      const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

      const modelsToTry = [
        DEFAULT_MODEL,
        ...FALLB4oACKS.filter((m) => m !== DEFAULT_MODEL),
      ];

      let lastError: any = null;

      for (const model of modelsToTry) {
        let attempt = 0;
        const maxAttempts = 3;
        while (attempt < maxAttempts) {
          try {
            const response = await openai.chat.completions.create({
              model,
              messages: [
                {
                  role: "system",
                  content: `✅ 1. MACRO Y NOTICIAS
            📢  "Haz un resumen del contexto macroeconómico para hoy. Revisa eventos clave (NFP, CPI, FOMC, PMI), noticias relevantes overnight, y el impacto proyectado en el Nasdaq y Big Tech (AAPL, NVDA, MSFT, AMZN). ¿Está el mercado en modo riesgo-ON o riesgo-OFF?"
            ✅ 2. SENTIMIENTO Y RIESGO GLOBAL
            💡  "Evalúa el sentimiento de riesgo del mercado hoy para MNQ. ¿Cómo están el VIX, el DXY, US10Y y USDJPY: presión macro, Flujos hacia riesgo (índices, cripto, oro).
            las tasas de interés y los flujos institucionales? ¿El entorno favorece largos, cortos o espera?"
            - ¿Existen divergencias de riesgo?
            Reglas duras:
            - VIX > 30 + DXY fuerte = NO operar direccional.
            3. CORRELACIONES CLAVE
            📊 "Revisa las correlaciones entre el Nasdaq y VIX, DXY, XAUUS, US10Y, USDJPY y Big Tech (AAPL, MSFT, NVDA, AMZN). ¿Confirman o contradicen la dirección esperada para el día en MNQ?"

            You are a sentiment analysis expert. Analyze the sentiment of the given news text. Respond with a JSON object containing "sentiment" (positive, negative, or neutral) and "score" (a number from -1 to 1, where -1 is very negative, 0 neutral, 1 very positive). Consider the macroeconomic context, risk sentiment, and key correlations as outlined above. Also, account for the need for broader news margins to ensure comprehensive analysis.`,
                },
                {
                  role: "user",
                  content: text,
                },
              ],
              max_tokens: MAX_TOKENS,
              temperature: 0.2,
            });

            const content = response.choices[0]?.message?.content;
            if (content) {
              const cleanedContent = content
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
              const result = JSON.parse(cleanedContent);
              return { sentiment: result.sentiment, score: result.score };
            } else {
              throw new Error("No response from OpenAI");
            }
          } catch (err: any) {
            lastError = err;
            const status = err?.status;
            const headers = err?.headers || err?.response?.headers;
            const retryAfter = headers?.get
              ? headers.get("retry-after")
              : headers?.["retry-after"];
            const isRateLimit =
              err?.code === "rate_limit_exceeded" || status === 429;
            attempt += 1;
            if (isRateLimit && attempt < maxAttempts) {
              const waitMs = retryAfter
                ? Number(retryAfter) * 1000
                : Math.pow(2, attempt) * 1000;
              console.warn(
                `Rate limit on model ${model}, attempt ${attempt}. Waiting ${waitMs}ms before retry.`
              );
              await sleep(waitMs);
              continue;
            }
            if (isRateLimit) {
              console.warn(
                `Rate limit reached for model ${model}, switching to next fallback.`
              );
              break; // try next model
            }
            if (attempt < maxAttempts) {
              const waitMs = Math.pow(2, attempt) * 500;
              await sleep(waitMs);
              continue;
            }
            break;
          }
        }
      }
      console.error("All models failed for sentiment analysis", lastError);
      throw lastError;
    } catch (error) {
      console.error("Error analyzing sentiment:", error || error);
      return { sentiment: "neutral", score: 0 };
    }
  }
}
