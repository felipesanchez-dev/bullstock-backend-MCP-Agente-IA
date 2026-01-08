import axios from "axios";

const NEWS_API_KEY = process.env.API_KEY_NEWSAPI;
const NEWS_API_URL = process.env.NEWS_API_URL;

export class NewsAPIService {
  /**
   * Noticias generales del Nasdaq 100 y sector tecnológico
   */
  async getNasdaqNews(from?: string, to?: string) {
    try {
      const response = await axios.get(`${NEWS_API_URL}/everything`, {
        params: {
          q: "Nasdaq 100 OR NQ futures OR MNQ futures OR Nasdaq futures",
          language: "en",
          sortBy: "publishedAt",
          from,
          to,
          pageSize: 10, // Aumentar el número de artículos para más márgenes
          apiKey: NEWS_API_KEY,
        },
      });

      return response.data.articles;
    } catch (error) {
      console.error("Error fetching Nasdaq news:", error);
      throw error;
    }
  }

  /**
   * Noticias macroeconómicas que afectan al Nasdaq
   */
  async getMacroEconomicNews(from?: string, to?: string) {
    try {
      const response = await axios.get(`${NEWS_API_URL}/everything`, {
        params: {
          q: `
            Federal Reserve OR 
            interest rates OR 
            inflation OR 
            CPI OR 
            PPI OR 
            FOMC OR 
            Jerome Powell OR 
            bond yields
          `,
          language: "en",
          sortBy: "publishedAt",
          from,
          to,
          pageSize: 10, // Aumentar el número de artículos para más márgenes
          apiKey: NEWS_API_KEY,
        },
      });

      return response.data.articles;
    } catch (error) {
      console.error("Error fetching macro news:", error);
      throw error;
    }
  }

  /**
   * Noticias sobre NQ futures (E-mini Nasdaq 100)
   */
  async getNQNews(from?: string, to?: string) {
    try {
      const response = await axios.get(`${NEWS_API_URL}/everything`, {
        params: {
          q: "NQ futures OR E-mini Nasdaq 100 OR Nasdaq E-mini",
          language: "en",
          sortBy: "publishedAt",
          from,
          to,
          pageSize: 10, // Aumentar el número de artículos para más márgenes
          apiKey: NEWS_API_KEY,
        },
      });

      return response.data.articles;
    } catch (error) {
      console.error("Error fetching NQ news:", error);
      throw error;
    }
  }
}
