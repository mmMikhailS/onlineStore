import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  Query,
  SerializeOptions,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  promiseCreateProduct,
  promiseDeleteProduct,
  promiseGetAllMessages,
} from './utils/utils';
import { GetAllProductsResponseDto } from './dto/getAllProducts.response.dto';
import { CreateProductResponseDto } from './dto/createProduct.response.dto';
import { DeleteProductInterface } from './dto/deleteProduct.repository.dto';
import { GetAllProductsDto, SortOption } from './dto/getAllProducts.dto';

@Controller('products')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiTags('Product')
  @ApiOperation({
    summary:
      'get all  product ( mb with sort by category and (from greater to lesser)',
  })
  @SerializeOptions({ type: GetAllProductsResponseDto })
  @HttpCode(200)
  @Post('getAllProducts')
  async getAllProducts(
    @Query() query: GetAllProductsDto,
  ): Promise<GetAllProductsResponseDto> {
    const sortOptions: SortOption[] = query.sortOptions || [];

    const response: GetAllProductsResponseDto =
      await this.appService.promiseSendMessage<GetAllProductsResponseDto>(
        sortOptions,
        promiseGetAllMessages,
        'get-all-products',
      );

    if ('errorMessage' in response) {
      throw new BadRequestException(response.errorMessage);
    }
    return response;
  }

  @ApiTags('Product')
  @ApiOperation({ summary: 'create product' })
  @UseInterceptors(FileInterceptor('imageData'))
  @SerializeOptions({ type: CreateProductResponseDto })
  @HttpCode(200)
  @Post('createProduct')
  async createProduct(
    @UploadedFile() imageData: Express.Multer.File,
    @Body('name') name: string,
    @Body('description') description: string,
    @Body('type') type: string,
    @Body('amount') amount: string,
  ): Promise<CreateProductResponseDto> {
    const data = {
      product: {
        name,
        description,
        type,
        amount,
      },
      imageData,
    };
    const response: CreateProductResponseDto =
      await this.appService.promiseSendMessage<CreateProductResponseDto>(
        data,
        promiseCreateProduct,
        'create-product',
      );

    if ('errorMessage' in response) {
      throw new BadRequestException(response.errorMessage);
    }
    return response;
  }

  @ApiTags('Product')
  @ApiOperation({ summary: 'delete product' })
  @SerializeOptions({ type: DeleteProductInterface })
  @HttpCode(200)
  @Delete('deleteProduct')
  async deleteProduct(
    @Body('name') name: string,
  ): Promise<DeleteProductInterface> {
    const response: DeleteProductInterface =
      await this.appService.promiseSendMessage<DeleteProductInterface>(
        name,
        promiseDeleteProduct,
        'delete-product',
      );

    if ('errorMessage' in response) {
      throw new BadRequestException(response.errorMessage);
    }
    return response;
  }
}
