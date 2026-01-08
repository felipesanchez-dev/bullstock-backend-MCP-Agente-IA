// Aquí se integrará con modelos de IA para análisis de sentimientos
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
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
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
        max_tokens: 100,
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        // Limpiar posibles markdown
        const cleanedContent = content
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        const result = JSON.parse(cleanedContent);
        return { sentiment: result.sentiment, score: result.score };
      } else {
        throw new Error("No response from OpenAI");
      }
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      return { sentiment: "neutral", score: 0 };
    }
  }
}
