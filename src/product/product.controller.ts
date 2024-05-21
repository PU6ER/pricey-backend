import { Controller, Get, Query } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('/price')
  async getPerekrestokPrice(@Query('name') product: string) {
    return this.productService.getPerekrestokPrice(product);
  }
}
