import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsService } from 'src/products/products.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenAI;

  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // Use .env for API key
  }
  private async getUserPreferences(userId: number): Promise<string[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['orders', 'orders.products', 'orders.products.categories'],
    });
    // console.log('user:', user);
    const categoryCount: Record<string, number> = {};

    user?.orders?.forEach((order) => {
      order?.products?.forEach((product) => {
        product?.categories?.forEach((category) => {
          if (category?.category_name) {
            categoryCount[category?.category_name] =
              (categoryCount[category?.category_name] || 0) + 1;
          }
        });
      });
    });

    const sorted = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
    const topCategories = sorted.slice(0, 3).map(([category]) => category); // Top 3 preferences

    return topCategories;
  }

  async generateText(userId: number, prompt: string) {
    try {
      const preferences = await this.getUserPreferences(userId);

      const products =
        await this.productService.getProductsByCategories(preferences); // You need to implement this method
      const productNames = products.map((p) => p.product_name).join(', ');

      const finalPrompt = `
User preferences: ${preferences.join(', ')}
Available products: ${productNames}
User query: ${prompt}
Please recommend a short and helpful list (no more than 5 items) using the available products only.
`;

      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
      });

      return response.text ?? '';
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }
}
