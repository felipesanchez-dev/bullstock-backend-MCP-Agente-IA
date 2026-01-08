# Bullstock Backend

Backend modular para análisis de sentimientos en noticias usando inteligencia artificial.

## Arquitectura

Este proyecto utiliza una arquitectura modular (scraming architecture) para garantizar versatilidad, crecimiento y mantenibilidad.

### Estructura de Carpetas

```
src/
├── TransformerIA/          # Módulo de transformación y análisis con IA
│   ├── AnalisisNoticias/   # Análisis de sentimientos en noticias
│   │   └── SentimentAnalyzer.ts
│   └── Noticias/           # Procesamiento específico de noticias con IA
│       └── Agentes/
│           └── NewsSentimentAgent.ts
└── Noticias/               # Fuentes de datos de noticias
    └── newsapi/
        └── NewsAPIService.ts
```

### Tecnologías

- **Node.js** con **TypeScript**
- **Express.js** para el servidor
- **Model Context Protocol (MCP)** para integración con modelos de IA
- **NewsAPI** como fuente de datos
- **OpenAI/Gemini** para análisis de sentimientos

### Alias de Rutas

Se utilizan alias de rutas para mantener imports limpios y escalables:

- `@/*` apunta a `src/*`

Ejemplo: `import { NewsAPIService } from "@/Noticias/newsapi/NewsAPIService";`

### Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables de entorno en `.env`

3. Construir el proyecto:
   ```bash
   npm run build
   ```

4. Ejecutar:
   ```bash
   npm start
   ```

### Desarrollo

Para desarrollo:
```bash
npm run dev
```

### Arquitectura MCP

Se utiliza MCP para proporcionar contexto a los modelos de IA, permitiendo análisis más precisos y contextualizados.