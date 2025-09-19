import swaggerJsDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IELTS Registration API',
      version: '1.0.0',
      description: 'API documentation for IELTS Registration System',
      contact: {
        name: 'API Support',
        email: 'support@pretest-uzbekistan.uz'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://pretest-registration.onrender.com/api'
          : `http://localhost:${process.env.PORT || 8000}/api`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        },
        adminAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Admin JWT token'
        }
      },
      schemas: {
        Registration: {
          type: 'object',
          required: ['fullName', 'email', 'phone', 'passportSeries', 'birthDate', 'examDate', 'examTime'],
          properties: {
            _id: {
              type: 'string',
              description: 'Auto-generated ID'
            },
            fullName: {
              type: 'string',
              description: 'Full name of the candidate'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address'
            },
            phone: {
              type: 'string',
              description: 'Phone number'
            },
            passportSeries: {
              type: 'string',
              description: 'Passport series number'
            },
            birthDate: {
              type: 'string',
              format: 'date',
              description: 'Date of birth'
            },
            examDate: {
              type: 'string',
              format: 'date',
              description: 'Exam date'
            },
            examTime: {
              type: 'string',
              enum: ['09:00', '14:00'],
              description: 'Exam time slot'
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'completed', 'failed'],
              default: 'pending',
              description: 'Payment status'
            },
            transactionId: {
              type: 'string',
              description: 'Payment transaction ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Registration date'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              default: false
            },
            message: {
              type: 'string'
            },
            error: {
              type: 'string'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              default: true
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'object'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Registration',
        description: 'Registration management endpoints'
      },
      {
        name: 'Payment',
        description: 'Payment processing endpoints'
      },
      {
        name: 'Admin',
        description: 'Admin management endpoints'
      },
      {
        name: 'Health',
        description: 'Health check endpoint'
      }
    ]
  },
  apis: ['./routes/*.js', './server.js']
};

const swaggerSpecs = swaggerJsDoc(swaggerOptions);

export default swaggerSpecs;