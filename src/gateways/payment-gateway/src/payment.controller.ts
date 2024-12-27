import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Req,
  SerializeOptions,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateOrderResponse } from './responses/createOrder.responses';
import { Request } from 'express';
import {
  addProductPromise,
  createOrderPromise,
  findCartPromise,
  findOrdersPromise,
  removeProductFromCartPromise,
  updateProductQuantityPromise,
} from './utils/utils';
import { PayloadInterface } from './interfaces/payload.interface';
import { ShippingAddressDto } from './dto/response/shippingAddress.Dto';
import { UpdateProductQuantityDto } from './dto/response/updateProductQuantity.dto';
import { RemoveProductFromOrderResponseDto } from './dto/removeProductFromOrder.response.dto';
import { FindOrderResponseDto } from './dto/findOrder.response.dto';
import { FindCartProductsResponseDto } from './dto/findCart.response.dto';
import { PushedProductsResponseDto } from './dto/addProductToOrder.response.type';
import { UpdateProductQuantityResponseDto } from './dto/updateProductQuantity.response.dto';
import { AddProductToOrderDto } from './dto/addProductToOrder.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly appService: PaymentService) {}

  @ApiTags('Payment')
  @ApiOperation({ summary: 'create order' })
  @CreateOrderResponse()
  @Post('createOrder')
  async createOrder(
    @Body('shippingAddress') shippingAddress: ShippingAddressDto,
    @Req() req: Request,
  ) {
    const { id }: PayloadInterface = req.payload;

    const response = await this.appService.promiseSendMessage<any>(
      {
        shippingAddress,
        userId: id,
      },
      createOrderPromise,
      'create-order',
    );

    if ('errorMessage' in response) {
      throw new BadRequestException(response.errorMessage);
    }
    return response;
  }

  @ApiTags('Payment')
  @ApiOperation({ summary: 'create order' })
  @CreateOrderResponse()
  @SerializeOptions({ type: PushedProductsResponseDto })
  @HttpCode(200)
  @Post('addProductToOrder')
  async addProductToOrder(
    @Body() dto: AddProductToOrderDto,
    @Req() req: Request,
  ): Promise<PushedProductsResponseDto> {
    const payload: PayloadInterface = req.payload;

    const response: PushedProductsResponseDto =
      await this.appService.promiseSendMessage<PushedProductsResponseDto>(
        {
          ...dto,
          userId: payload.id,
        },
        addProductPromise,
        'add-product',
      );
    if ('errorMessage' in response) {
      throw new BadRequestException(response.errorMessage);
    }
    return response;
  }

  @ApiTags('Payment')
  @ApiOperation({ summary: 'create order' })
  @CreateOrderResponse()
  @SerializeOptions({ type: FindCartProductsResponseDto })
  @HttpCode(200)
  @Get('findCart')
  async findCart(@Req() req: Request): Promise<FindCartProductsResponseDto> {
    const { id }: PayloadInterface = req.payload;

    const response: FindCartProductsResponseDto =
      await this.appService.promiseSendMessage<FindCartProductsResponseDto>(
        id,
        findCartPromise,
        'find-cart',
      );

    if ('errorMessage' in response) {
      throw new BadRequestException(response.errorMessage);
    }
    return response;
  }

  @ApiTags('Payment')
  @ApiOperation({ summary: 'create order' })
  @CreateOrderResponse()
  @SerializeOptions({ type: FindOrderResponseDto })
  @HttpCode(200)
  @Get('findOrders')
  async findOrders(@Req() req: Request): Promise<FindOrderResponseDto> {
    const { id }: PayloadInterface = req.payload;

    const response: FindOrderResponseDto =
      await this.appService.promiseSendMessage<FindOrderResponseDto>(
        id,
        findOrdersPromise,
        'find-orders',
      );

    if ('errorMessage' in response) {
      throw new BadRequestException(response.errorMessage);
    }
    return response;
  }

  @ApiTags('Payment')
  @ApiOperation({ summary: 'create order' })
  @SerializeOptions({ type: RemoveProductFromOrderResponseDto })
  @HttpCode(200)
  @Delete('removeProductFromOrder')
  async removeProductFromOrder(
    @Req() req: Request,
    @Body('productName') productName: string,
  ): Promise<RemoveProductFromOrderResponseDto> {
    const { id }: PayloadInterface = req.payload;
    const response: RemoveProductFromOrderResponseDto =
      await this.appService.promiseSendMessage<RemoveProductFromOrderResponseDto>(
        {
          userId: id,
          productName,
        },
        removeProductFromCartPromise,
        'product-from-cart',
      );

    if ('errorMessage' in response) {
      throw new BadRequestException(response.errorMessage);
    }
    return response;
  }

  @ApiTags('Payment')
  @ApiOperation({ summary: 'create order' })
  @SerializeOptions({ type: UpdateProductQuantityResponseDto })
  @HttpCode(200)
  @Post('updateProductQuantity')
  async updateProductQuantity(
    @Req() req: Request,
    @Body() data: UpdateProductQuantityDto,
  ): Promise<UpdateProductQuantityResponseDto> {
    const { id }: PayloadInterface = req.payload;

    const response: UpdateProductQuantityResponseDto =
      await this.appService.promiseSendMessage<UpdateProductQuantityResponseDto>(
        {
          ...data,
          userId: id,
        },
        updateProductQuantityPromise,
        'update-product-quantity',
      );

    if ('errorMessage' in response) {
      throw new BadRequestException(response.errorMessage);
    }
    return response;
  }
}
