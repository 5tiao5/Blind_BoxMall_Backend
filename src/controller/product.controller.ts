import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put, Query
} from "@midwayjs/core";
import { ProductService } from '../service/product.service';
import { CreateProductDTO } from '../dto/create-product.dto';
import { UpdateProductDTO } from '../dto/update-product.dto';

@Controller('/product')
export class ProductController {
  @Inject()
  productService: ProductService;

  @Post('/create')
  async create(@Body() data: CreateProductDTO) {
    const result = await this.productService.createProductWithBlindBoxes(data);
    return { success: true, data: result };
  }
  @Get('/:id')
  async getProductDetail(@Param('id') id: number) {
    const result = await this.productService.getProduct(id);
    return { success: true, data: result };
  }
  @Post('/delete/:id')
  async deleteProduct(@Param('id') id: number) {
    return this.productService.deleteProduct(id);
  }
  @Put('/update')
  async updateProduct(@Body() dto: UpdateProductDTO) {
    return this.productService.updateProduct(dto);
  }
  @Get('/all')
  async getAll() {
    return { success: true, data: await this.productService.findAll() };
  }
  @Get('/search')
  async search(@Query('keyword') keyword: string) {
    return this.productService.searchProduct(keyword);
  }
}
