import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

export function setupSwagger(app: Express) {
  const swaggerSpec = { openapi: '3.0.0', info: { title: 'API Docs', version: '1.0.0' } };
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}