import { NewsAPIService } from "@/News/Newsapi/NewsAPIService";
import { SentimentAnalyzer } from "@/Transformer/News-Analysis/SentimentAnalyzer";

export class NewsSentimentAgent {
  private newsService = new NewsAPIService();
  private sentimentAnalyzer = new SentimentAnalyzer();

  async processNasdaqNewsSentiment(from?: string, to?: string) {
    const articles = await this.newsService.getNasdaqNews(from, to);
    const results = await Promise.all(
      articles.map(async (article: any) => {
        const sentiment = await this.sentimentAnalyzer.analyzeSentiment(
          article.title + " " + article.description
        );
        return {
          ...article,
          sentiment,
        };
      })
    );
    return results;
  }

  async processMacroEconomicNewsSentiment(from?: string, to?: string) {
    const articles = await this.newsService.getMacroEconomicNews(from, to);
    const results = await Promise.all(
      articles.map(async (article: any) => {
        const sentiment = await this.sentimentAnalyzer.analyzeSentiment(
          article.title + " " + article.description
        );
        return {
          ...article,
          sentiment,
        };
      })
    );
    return results;
  }
}
