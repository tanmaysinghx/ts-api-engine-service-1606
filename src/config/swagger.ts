import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

export function setupSwagger(app: Express) {
  const swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'TS API Engine Service',
      version: '1.0.0',
      description: 'API Gateway and Workflow Orchestrator service.'
    },
    servers: [
      {
        url: 'http://localhost:1606/api/v1',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        // Define if needed later, e.g., BearerAuth
      },
      schemas: {
        WorkflowSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            transactionId: { type: 'string', example: 'tx_123456' },
            message: { type: 'string', example: 'Workflow executed successfully' },
            data: { type: 'object' }
          }
        },
        WorkflowError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            transactionId: { type: 'string', example: 'tx_123456' },
            message: { type: 'string', example: 'Workflow execution failed' },
            errors: { type: 'object' }
          }
        }
      }
    },
    paths: {
      '/health': {
        get: {
          summary: 'Health Check',
          description: 'Checks if the service is running.',
          responses: {
            '200': {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'OK' },
                      timestamp: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api-engine/trigger-workflow/{workflowCode}': {
        post: {
          summary: 'Trigger Workflow',
          description: 'Executes a configured workflow by its ID (e.g., login-flow). Proxies request to downstream service.',
          parameters: [
            {
              in: 'path',
              name: 'workflowCode',
              required: true,
              schema: { type: 'string' },
              description: 'The ID of the workflow to execute (from registry.yaml)'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  description: 'Payload to pass to the downstream service',
                  example: {
                    username: 'user@example.com',
                    password: 'password123'
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Workflow Executed Successfully',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/WorkflowSuccess' } }
              }
            },
            '500': {
              description: 'Workflow Execution Failed',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/WorkflowError' } }
              }
            }
          }
        }
      },
      '/admin/config': {
        get: {
          summary: 'Get Loaded Configuration',
          description: 'Returns the currently loaded services and workflows from registry.yaml.',
          tags: ['Admin'],
          responses: {
            '200': {
              description: 'Configuration Data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { type: 'array', items: { type: 'object' } }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/admin/logs': {
        get: {
          summary: 'View Server Logs',
          description: 'Returns the last N lines of the server log file.',
          tags: ['Admin'],
          parameters: [
            {
              in: 'query',
              name: 'lines',
              schema: { type: 'integer', default: 100 },
              description: 'Number of lines to retrieve'
            }
          ],
          responses: {
            '200': {
              description: 'Log Content',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { type: 'array', items: { type: 'string' } },
                      meta: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}