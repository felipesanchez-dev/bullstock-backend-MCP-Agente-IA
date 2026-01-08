import dotenv from "dotenv";

dotenv.config();

import express from "express";
import { correlationIdMiddleware } from "@/middlewares/correlationId";
import newsRoutes from "@/routes/newsRoutes";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Middleware de correlation ID
app.use(correlationIdMiddleware);

// Rutas básicas
app.get("/", (req, res) => {
  console.log(`[${(req as any).id}] Respuesta a ruta raíz`);
  res.send("Bullstock Backend - Análisis de Sentimientos");
});

// Usar rutas de noticias
app.use("/", newsRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
