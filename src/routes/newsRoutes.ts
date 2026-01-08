import { Router } from "express";
import { NewsController } from "@/controllers/newsController";

const router = Router();
const newsController = new NewsController();

// Rutas para noticias
router.get("/news-nasdaq", newsController.getNasdaqNews.bind(newsController));
router.get("/news-nq", newsController.getNQNews.bind(newsController));
router.get(
  "/sentiment-analyzer-news",
  newsController.getSentimentAnalyzerNews.bind(newsController)
);

export default router;
