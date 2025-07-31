import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { ProductsService } from 'src/products/products.service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { GeminiResponseDto } from './dto/create-gemini.dto';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenAI;

  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  // --------------------------
  // CORE/CENTRALIZED METHODS
  // --------------------------

  private getWebsiteContext(): string {
    return `
      You are "GrocerGenie", the friendly AI assistant for GrocerMart online supermarket. 
      Our store offers fresh produce, pantry staples, dairy, and household items.
      
      Key information:
      - Store hours: 8am-9pm daily (hours may vary by store)
      - Multiple stores from different owners available
      - Delivery available for all orders
      - Current promotions: 10% off organic produce this week (check store listings)
      - New arrivals: Seasonal fruits, artisanal cheeses (availability varies by store)
      
      Your personality:
      - Always friendly and approachable
      - Use emojis sparingly to add warmth 😊
      - Keep responses concise but helpful
      - For product questions, mention if items are in stock
      - For sensitive topics, politely direct to customer service
    `;
  }

  private getUnauthenticatedResponse(prompt: string): string {
    return `
      ${this.getWebsiteContext()}
      
      The user is not logged in but asking about our store.
      Question: ${prompt}
      
      Respond helpfully while encouraging them to sign up for personalized recommendations.
      Example: "I'd be happy to help! By the way, if you create an account, I can give you personalized recommendations based on your preferences. 😊"
    `;
  }
  private isSimpleAcknowledgment(prompt: string): boolean {
    const acknowledgments = [
      'thanks',
      'thank you',
      'ok',
      'okay',
      'got it',
      'appreciate it',
      'cool',
      'great',
      'awesome',
    ];
    return acknowledgments.some((ack) =>
      prompt.toLowerCase().includes(ack.toLowerCase()),
    );
  }

  async generateText(
    userId: number | null,
    prompt: string,
  ): Promise<GeminiResponseDto> {
    try {
      // Basic input validation
      if (!prompt || prompt.trim().length < 2) {
        return {
          text: 'Please ask me a question about our products or services!',
          products: [],
        };
      }

      // For unauthenticated users
      if (!userId) {
        const response = await this.genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: this.getUnauthenticatedResponse(prompt) }],
            },
          ],
        });
        return {
          text: response.text ?? "I'd be happy to help with that!",
          products: [],
        };
      }

      // Check for specific question types
      if (this.isPreferenceQuestion(prompt)) {
        return this.handlePreferenceRequest(userId);
      }

      if (this.isRestockQuestion(prompt)) {
        return this.generateSmartSuggestionsResponse(userId);
      }

      if (this.isOrderRelatedPrompt(prompt)) {
        return this.handleOrderRelatedRequest(userId, prompt);
      }
      if (this.isSimpleAcknowledgment(prompt)) {
        return {
          text: "You're welcome! Is there anything else I can help you with? 😊",
          products: [], // No products for acknowledgments
        };
      }

      // Default handling for other queries
      return this.handleGeneralRequest(userId, prompt);
    } catch (error) {
      console.error('Error generating text:', error);
      return {
        text: "Sorry, I'm having trouble answering that right now. Please try again later or contact our customer service.",
        products: [],
      };
    }
  }

  private isPreferenceQuestion(prompt: string): boolean {
    const preferenceKeywords = [
      'preference',
      'what i like',
      'my favorites',
      'usual items',
    ];
    return preferenceKeywords.some((keyword) =>
      prompt.toLowerCase().includes(keyword.toLowerCase()),
    );
  }

  private isRestockQuestion(prompt: string): boolean {
    const restockKeywords = [
      'restock',
      'need to buy',
      'should I buy',
      'running low',
    ];
    return restockKeywords.some((keyword) =>
      prompt.toLowerCase().includes(keyword.toLowerCase()),
    );
  }

  private async handlePreferenceRequest(
    userId: number,
  ): Promise<GeminiResponseDto> {
    const preferences = await this.getUserPreferences(userId);
    const products =
      await this.productService.getProductsByCategories(preferences);

    const preferenceText =
      preferences.length > 0
        ? `Based on your order history, your top preferences are: ${preferences.join(', ')}.`
        : "We're still learning your preferences. Keep shopping and we'll make better recommendations!";

    return {
      text: preferenceText,
      products: products.slice(0, 3).map((p) => ({
        id: p.id,
        name: p.product_name,
        imageUrl: p.product_image,
      })),
    };
  }

  private async generateSmartSuggestionsResponse(
    userId: number,
  ): Promise<GeminiResponseDto> {
    const orders = await this.getUserOrders(userId);
    if (orders.length === 0) {
      return {
        text: "You haven't made any purchases yet. As you shop with us, I'll learn your habits and make smart suggestions!",
        products: [],
      };
    }

    const { suggestions, frequentProducts } =
      await this.analyzePurchasePatterns(orders);

    if (suggestions.length === 0) {
      return {
        text: "Your shopping looks up to date! Based on your usual purchases, you don't seem to need anything right now.",
        products: [],
      };
    }

    const prompt = `
      ${this.getWebsiteContext()}
      
      User's purchase history analysis shows these items might need restocking:
      ${suggestions.join('\n')}
      
      Generate a friendly response that:
      1. Starts with a warm greeting
      2. Lists 2-3 most important items to consider
      3. Offers to help with reordering
      4. Ends with an encouraging note
    `;

    const response = await this.genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return {
      text: response.text ?? suggestions.slice(0, 3).join('\n'),
      products: frequentProducts.slice(0, 3).map((p) => ({
        id: p.id,
        name: p.product_name,
        imageUrl: p.product_image,
      })),
    };
  }

  // gemini.service.ts

  private async handleGeneralRequest(
    userId: number,
    prompt: string,
  ): Promise<GeminiResponseDto> {
    const preferences = await this.getUserPreferences(userId);
    const products =
      await this.productService.getProductsByCategories(preferences);

    const finalPrompt = `
    ${this.getWebsiteContext()}
    
    User preferences: ${preferences.join(', ') || 'No preferences yet'}
    User question: ${prompt}
    
    Respond with a helpful answer. Only include specific product recommendations if:
    1. The user explicitly asks for products
    2. You're suggesting alternatives
    3. They ask about availability
    Otherwise, just provide a helpful response without product details.
  `;

    const response = await this.genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
    });

    const responseText = response.text ?? 'Let me check that for you!';

    // Only return products if the response mentions specific items
    const shouldIncludeProducts = this.isProductRelatedResponse(responseText);

    return {
      text: responseText,
      products: shouldIncludeProducts
        ? products.slice(0, 3).map((p) => ({
            id: p.id,
            name: p.product_name,
            imageUrl: p.product_image,
          }))
        : [],
    };
  }

  private isProductRelatedResponse(text: string): boolean {
    const productKeywords = [
      'recommend',
      'suggest',
      'try',
      'available',
      'product',
      'item',
      'here are',
      'options',
    ];
    return productKeywords.some((keyword) =>
      text.toLowerCase().includes(keyword.toLowerCase()),
    );
  }

  public isOrderRelatedPrompt(prompt: string): boolean {
    const orderKeywords = [
      'order',
      'purchase',
      'buy',
      'bought',
      'history',
      'previous order',
      'track order',
    ];
    return orderKeywords.some((keyword) =>
      prompt.toLowerCase().includes(keyword.toLowerCase()),
    );
  }

  private async handleOrderRelatedRequest(
    userId: number,
    prompt: string,
  ): Promise<GeminiResponseDto> {
    const orders = await this.getUserOrders(userId);

    if (orders.length === 0) {
      return {
        text: "You haven't placed any orders yet. When you do, I'll be able to help you track them and reorder items!",
        products: [],
      };
    }

    const lastOrder = orders[0];
    const products =
      lastOrder.products?.map((p) => ({
        id: p.id,
        name: p.product_name,
        imageUrl: p.product_image,
      })) || [];

    const orderDate = new Date(lastOrder.created_at).toLocaleDateString();
    const productNames = products.map((p) => p.name).join(', ');

    let responseText = '';
    if (this.isAskingForOrderStatus(prompt)) {
      responseText = `Hello there! 😊 Your most recent order from ${orderDate} is being processed. `;
    } else if (this.isAskingForLastOrderProducts(prompt)) {
      responseText = `Here are the items from your last order on ${orderDate}: `;
    } else {
      // Generic order response
      responseText = `Regarding your order from ${orderDate}: `;
    }

    // Generate AI response with context
    const aiPrompt = `
    ${this.getWebsiteContext()}
    
    User's last order details:
    - Date: ${orderDate}
    - Products: ${productNames}
    
    User question: ${prompt}
    
    Please respond:
    1. Start with a friendly greeting
    2. Answer the specific question
    3. Mention the products from their last order
    4. Keep it concise (1-2 sentences)
  `;

    const aiResponse = await this.genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: aiPrompt }] }],
    });

    return {
      text: aiResponse.text ?? responseText,
      products: products.slice(0, 3), // Return max 3 products for display
    };
  }

  private isAskingForOrderStatus(prompt: string): boolean {
    const keywords = ['where is', 'status', 'track', 'location', 'when will'];
    return keywords.some((k) => prompt.toLowerCase().includes(k));
  }

  private isAskingForLastOrderProducts(prompt: string): boolean {
    const keywords = [
      'what was',
      'what did i order',
      'last order',
      'previous order',
      'what products',
    ];
    return keywords.some((k) => prompt.toLowerCase().includes(k));
  }
  // --------------------------
  // AUTHENTICATED USER METHODS
  // --------------------------

  // private async handleAuthenticatedRequest(
  //   userId: number,
  //   prompt: string,
  // ): Promise<string> {
  //   const preferences = await this.getUserPreferences(userId);
  //   const products =
  //     await this.productService.getProductsByCategories(preferences);
  //   const productNames = products.map((p) => p.product_name).join(', ');

  //   const finalPrompt = `
  //     ${this.getWebsiteContext()}

  //     User preferences: ${preferences.join(', ') || 'No preferences yet'}
  //     Available products matching preferences: ${productNames || 'None'}

  //     User question: ${prompt}

  //     Respond with:
  //     1. Friendly greeting acknowledging their preferences if available at the start of the chat session
  //     2. Helpful answer to their question
  //     3. If recommending products, suggest 2-3 options max
  //     4. End with a friendly note or question
  //   `;

  //   const response = await this.genAI.models.generateContent({
  //     model: 'gemini-2.5-flash',
  //     contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
  //   });

  //   return response.text ?? 'Let me check that for you!';
  // }

  private async getUserPreferences(userId: number): Promise<string[]> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['orders', 'orders.products', 'orders.products.categories'],
      });

      if (!user) return [];

      const categoryCount: Record<string, number> = {};

      user.orders?.forEach((order) => {
        order.products?.forEach((product) => {
          product.categories?.forEach((category) => {
            if (category?.category_name) {
              categoryCount[category.category_name] =
                (categoryCount[category.category_name] || 0) + 1;
            }
          });
        });
      });

      const sorted = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
      return sorted.slice(0, 3).map(([category]) => category);
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return [];
    }
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    try {
      return await this.orderRepository.find({
        where: { customer: { id: userId } },
        relations: ['products', 'products.categories'],
        order: { created_at: 'DESC' },
        take: 5,
      });
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }

  async generateSmartShoppingList(
    userId: number,
  ): Promise<{ suggestions: string[]; products: any[] }> {
    try {
      const orders = await this.getUserOrders(userId);
      if (orders.length === 0) {
        return {
          suggestions: ['Start shopping to get personalized suggestions!'],
          products: [],
        };
      }

      const { frequentProducts } = await this.analyzePurchasePatterns(orders);
      const productNames = frequentProducts
        .map((p) => p.product_name)
        .join(', ');

      const prompt = `
        ${this.getWebsiteContext()}
        
        Based on a user's frequent purchases of these items:
        ${productNames}
        
        Generate:
        1. A short friendly explanation that these are their regularly purchased items
        2. A question asking if they want to add any to their cart
        3. A reminder that they can always modify the list
      `;

      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      return {
        suggestions: [
          response.text ?? 'Here are your regularly purchased items:',
          'Would you like to add any of these to your cart?',
        ],
        products: frequentProducts,
      };
    } catch (error) {
      console.error('Error generating smart list:', error);
      return {
        suggestions: [
          "We're having trouble generating your smart list. Please try again later.",
        ],
        products: [],
      };
    }
  }

  private async analyzePurchasePatterns(orders: Order[]): Promise<{
    suggestions: string[];
    frequentProducts: any[];
  }> {
    // Analyze purchase frequency
    const productFrequency: Record<
      string,
      { product: any; count: number; lastPurchased: Date }
    > = {};

    orders.forEach((order) => {
      order.products?.forEach((product) => {
        const productName = product.product_name;
        if (!productFrequency[productName]) {
          productFrequency[productName] = {
            product,
            count: 0,
            lastPurchased: order.created_at,
          };
        }
        productFrequency[productName].count += 1;
        if (order.created_at > productFrequency[productName].lastPurchased) {
          productFrequency[productName].lastPurchased = order.created_at;
        }
      });
    });

    // Find products that might need restocking
    const now = new Date();
    const suggestions: string[] = [];
    const frequentProducts: any[] = [];

    Object.entries(productFrequency).forEach(([productName, data]) => {
      const daysSinceLastPurchase = Math.floor(
        (now.getTime() - new Date(data.lastPurchased).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      // Simple heuristic: if purchased at least 3 times and average purchase interval is passed
      const averageInterval =
        orders.length > 1 ? Math.floor(30 / (data.count / orders.length)) : 30;

      if (data.count >= 3) {
        frequentProducts.push(data.product);

        if (daysSinceLastPurchase >= averageInterval) {
          suggestions.push(
            `You usually buy ${productName} every ~${averageInterval} days. It's been ${daysSinceLastPurchase} days since your last purchase. Want to restock?`,
          );
        }
      }
    });

    // Sort frequent products by count
    frequentProducts.sort((a, b) => {
      const countA = productFrequency[a.product_name]?.count || 0;
      const countB = productFrequency[b.product_name]?.count || 0;
      return countB - countA;
    });

    return {
      suggestions,
      frequentProducts: frequentProducts.slice(0, 10), // Return top 10
    };
  }
}
