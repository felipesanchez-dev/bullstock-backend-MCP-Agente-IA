import { Request, Response } from "express";
import { NewsAPIService } from "@/Noticias/newsapi/NewsAPIService";
import { SentimentAnalyzer } from "@/TransformerIA/AnalisisNoticias/SentimentAnalyzer";
import OpenAI from "openai";

const newsService = new NewsAPIService();
const sentimentAnalyzer = new SentimentAnalyzer();
const openai = new OpenAI({
  apiKey: process.env.API_KEY_OPEN_IA,
});

export class NewsController {
  async getNasdaqNews(req: Request, res: Response) {
    const requestId = (req as any).id;
    console.log(
      `[${requestId}] Iniciando consulta a NewsAPI para noticias del Nasdaq`
    );
    try {
      const news = await newsService.getNasdaqNews();
      console.log(
        `[${requestId}] Consulta exitosa, obtenidas ${news.length} noticias`
      );

      // Analizar sentimientos
      console.log(
        `[${requestId}] Iniciando análisis de sentimientos para ${news.length} noticias`
      );
      const analyzedNews = await Promise.all(
        news.map(async (article: any) => {
          const text = `${article.title} ${article.description || ""}`;
          const analysis = await sentimentAnalyzer.analyzeSentiment(text);
          return {
            ...article,
            sentiment: analysis.sentiment,
            sentimentScore: analysis.score,
          };
        })
      );
      console.log(`[${requestId}] Análisis de sentimientos completado`);

      res.json({ requestId, news: analyzedNews });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`[${requestId}] Error en consulta: ${message}`);
      res.status(500).json({ requestId, error: message });
    }
  }

  async getNQNews(req: Request, res: Response) {
    const requestId = (req as any).id;
    console.log(
      `[${requestId}] Iniciando consulta a NewsAPI para noticias de NQ futures`
    );
    try {
      const news = await newsService.getNQNews();
      console.log(
        `[${requestId}] Consulta exitosa, obtenidas ${news.length} noticias`
      );

      // Analizar sentimientos
      console.log(
        `[${requestId}] Iniciando análisis de sentimientos para ${news.length} noticias`
      );
      const analyzedNews = await Promise.all(
        news.map(async (article: any) => {
          const text = `${article.title} ${article.description || ""}`;
          const analysis = await sentimentAnalyzer.analyzeSentiment(text);
          return {
            ...article,
            sentiment: analysis.sentiment,
            sentimentScore: analysis.score,
          };
        })
      );
      console.log(`[${requestId}] Análisis de sentimientos completado`);

      res.json({ requestId, news: analyzedNews });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`[${requestId}] Error en consulta: ${message}`);
      res.status(500).json({ requestId, error: message });
    }
  }

  async getSentimentAnalyzerNews(req: Request, res: Response) {
    const requestId = (req as any).id;
    console.log(
      `[${requestId}] Iniciando análisis de sentimientos del mercado Nasdaq (incluyendo NQ)`
    );

    try {
      // Obtener noticias de Nasdaq y NQ
      const [nasdaqNews, nqNews] = await Promise.all([
        newsService.getNasdaqNews(),
        newsService.getNQNews(),
      ]);
      const allNews = [...nasdaqNews, ...nqNews];
      console.log(
        `[${requestId}] Obtenidas ${allNews.length} noticias totales (${nasdaqNews.length} Nasdaq, ${nqNews.length} NQ)`
      );

      // Analizar sentimientos
      const analyzedNews = await Promise.all(
        allNews.map(async (article: any) => {
          const text = `${article.title} ${article.description || ""}`;
          const analysis = await sentimentAnalyzer.analyzeSentiment(text);
          return {
            ...article,
            sentiment: analysis.sentiment,
            sentimentScore: analysis.score,
          };
        })
      );
      console.log(`[${requestId}] Análisis completado`);

      // Resumir sentimientos
      const sentiments = analyzedNews.map((n) => n.sentiment);
      const scores = analyzedNews.map((n) => n.sentimentScore);

      const positive = sentiments.filter((s) => s === "positive").length;
      const negative = sentiments.filter((s) => s === "negative").length;
      const neutral = sentiments.filter((s) => s === "neutral").length;

      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      let marketSentiment = "neutral";
      if (averageScore > 0.1) marketSentiment = "bullish";
      else if (averageScore < -0.1) marketSentiment = "bearish";

      const summary = {
        totalNews: analyzedNews.length,
        positive,
        negative,
        neutral,
        averageScore: parseFloat(averageScore.toFixed(2)),
        marketSentiment,
      };

      console.log(`[${requestId}] Resumen: ${JSON.stringify(summary)}`);

      // Generar explicación narrativa
      const explanation = await this.generateExplanation(analyzedNews, summary);

      res.json({ requestId, summary, explanation });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`[${requestId}] Error: ${message}`);
      res.status(500).json({ requestId, error: message });
    }
  }

  private async generateExplanation(
    analyzedNews: any[],
    summary: any
  ): Promise<string> {
    try {
      const prompt = `✅ 1. MACRO Y NOTICIAS
📢  "Haz un resumen del contexto macroeconómico para hoy. Revisa eventos clave (NFP, CPI, FOMC, PMI), noticias relevantes overnight, y el impacto proyectado en el Nasdaq y Big Tech (AAPL, NVDA, MSFT, AMZN). ¿Está el mercado en modo riesgo-ON o riesgo-OFF?"
✅ 2. SENTIMIENTO Y RIESGO GLOBAL
💡  "Evalúa el sentimiento de riesgo del mercado hoy para MNQ. ¿Cómo están el VIX, el DXY, US10Y y USDJPY: presión macro, Flujos hacia riesgo (índices, cripto, oro).
las tasas de interés y los flujos institucionales? ¿El entorno favorece largos, cortos o espera?"
- ¿Existen divergencias de riesgo?
Reglas duras:
- VIX > 30 + DXY fuerte = NO operar direccional.
3. CORRELACIONES CLAVE
📊 "Revisa las correlaciones entre el Nasdaq y VIX, DXY, XAUUS, US10Y, USDJPY y Big Tech (AAPL, MSFT, NVDA, AMZN). ¿Confirman o contradicen la dirección esperada para el día en MNQ?"

Basado en el análisis de ${summary.totalNews} noticias con sentimientos: ${
        summary.positive
      } positivas, ${summary.negative} negativas, ${
        summary.neutral
      } neutrales, puntuación promedio ${
        summary.averageScore
      }, y sentimiento de mercado ${summary.marketSentiment}.

Proporciona una explicación narrativa detallada de por qué el mercado tiende a ${
        summary.marketSentiment === "bullish"
          ? "subir"
          : summary.marketSentiment === "bearish"
          ? "bajar"
          : "mantenerse neutral"
      }. Considera el contexto macroeconómico, similitudes y patrones en las noticias, sentimientos, y por qué deberíamos tender a subir o no, teniendo en cuenta la macro. Busca patrones en las noticias y sentimientos.`;

      const titlesAndSentiments = analyzedNews
        .slice(0, 20)
        .map((n) => `${n.title} (${n.sentiment})`)
        .join("\n"); // Tomar las primeras 20 para no exceder tokens

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: `Ejemplos de noticias y sentimientos:\n${titlesAndSentiments}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.5,
      });

      return (
        response.choices[0]?.message?.content ||
        "No se pudo generar explicación."
      );
    } catch (error) {
      console.error("Error generando explicación:", error);
      return "Error al generar explicación.";
    }
  }
}
