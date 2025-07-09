import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Grocery Delivery API')
    .setDescription(
      `
# 🛒 On-Demand Grocery Delivery API

A robust and scalable REST API for a modern grocery delivery platform. It's designed to connect customers with local stores for a seamless shopping and delivery experience, all managed through a comprehensive role-based system.
it has 2-factor authentication, role-based access control, and a user-friendly interface for customers, store owners, drivers, and administrators.
---

## 🌟 Features Overview

This API provides a suite of features organized into four distinct panels:

🔹 **Customer Panel** 
  • Secure user registration and profile management. 
  • Browse products, search, and filter by categories. 
  • Place and re-order items with a simple tap.  
  • Real-time order tracking from store to doorstep. 
  • Schedule deliveries and provide ratings/feedback.  

🔹 **Grocery Store Panel** 
  • Store registration and verification. 
  • Manage product listings, inventory, and taxes. 
  • View and manage incoming orders. 
  • Create and manage discounts and offers. 

🔹 **Driver Panel** 
  • Manage availability for deliveries. 
  • Receive and view order pickup and delivery requests.
  • Track earnings and manage payments. 

🔹 **Admin Panel** 
  • Full oversight of all customers, stores, and drivers. 
  • Authorize new users and stores. 
  • Manage all orders and platform-wide content.

---

## 🔐 Authentication Guide

This API uses **JWT Bearer tokens** for secure authentication.
  **How to Authenticate:**
1.  Send user credentials to the login endpoint to receive a JWT access token.
2.  Include the token in the \`Authorization\` header of your requests:
    \`Authorization: Bearer <your_token>\`
3.  Use the token to access protected endpoints based on your assigned role (Customer, Store Owner, Driver, Admin).
---
  ## 📡 API Quick Info

  - **Base URL**: \`http://localhost:3000/api\`
  - **Content-Type**: \`application/json\`
      `,
    )
    .setVersion('1.0')
    .setTermsOfService('https://groceryapp.com/terms')
    .setContact(
      'API Support',
      'https://groceryapp.com/support',
      'api-support@groceryapp.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Stores', 'Grocery store and product management')
    .addTag('Orders', 'Order placement and tracking endpoints')
    .addTag('Drivers', 'Driver-specific endpoints')
    .addTag('Products', 'Product management endpoints')
    .addTag('Categories', 'Product category management')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },'access-token', 
    )
    .build();

  // Assuming 'app' is your NestJS application instance
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
    },
    customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin-bottom: 20px; }
    .swagger-ui .info h1 { font-size: 24px; }
  `,
    customSiteTitle: 'Grocery Delivery API Documentation',
  });
  
  const configService = app.get(ConfigService);
  const PORT = configService.getOrThrow<number>('PORT');

  await app.listen(PORT);
}
bootstrap();
