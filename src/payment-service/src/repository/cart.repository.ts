import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductsCartInterface } from '../interfaces/productsCart.interface';
import { FindCartItemQuantityInterface } from '../interfaces/prisma/findCartItemQuantity.interface';
import { FindCartIdInterface } from '../interfaces/prisma/findCartId.interface';
import { FindCartProductsInterface } from '../interfaces/prisma/findCartProduct.interface';
import { CartItemIdInterface } from '../interfaces/cartItemId.interface';
import { ProductFromCartInterface } from '../interfaces/prisma/productFromCart.interface';
import { UpdateProductQuantityInterface } from '../interfaces/prisma/updateProductQuantity.interface';
import { FindProductsInterface } from '../interfaces/prisma/findProducts.interface';
import { ExistingProductInterface } from '../interfaces/prisma/existingProduct.interface';
import { UpdateProductQuantityCartInterface } from '../interfaces/prisma/updateProductQuantityCart.interface';
import { UpdateProductQuantityCartResponseInterface } from '../interfaces/prisma/updateProductQuantityCartResponse.interface';
import { IsAlreadyProductInCartDto } from '../interfaces/prisma/isAlreadyProductInCart.dto';
import { CartProductsFindUniqueInterface } from '../interfaces/CartProductsFindUnique.interface';
import { DeleteProductCartItemInterface } from '../interfaces/prisma/deleteProductCartItem.interface';
import { PushedProductsInterface } from '../interfaces/pushedProducts.interface';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async pushProduct(
    productName: string,
    quantity: number,
    userId: number,
  ): Promise<PushedProductsInterface> {
    try {
      const existingCart: ProductsCartInterface =
        await this.prisma.cart.findUnique({
          where: { userId },
          select: {
            id: true,
            cartItems: {
              select: {
                id: true,
                productId: true,
                products: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });

      const existingProduct: ExistingProductInterface =
        await this.prisma.product.findUnique({
          where: {
            name: productName,
          },
          select: { id: true },
        });
      if (!existingProduct) {
        throw new BadRequestException(
          `Product with name ${productName} does not exist.`,
        );
      }

      const cartItem: IsAlreadyProductInCartDto = existingCart.cartItems.find(
        (item: CartItemIdInterface): boolean =>
          existingProduct.id === item.productId ||
          item.products.name === productName,
      );

      if (cartItem) {
        return await this.prisma.cartItems.update({
          where: {
            id: cartItem.id,
          },
          data: {
            quantity,
          },
          select: {
            cartId: true,
            quantity: true,
            productId: true,
          },
        });
      } else {
        return await this.prisma.cartItems.create({
          data: {
            cartId: existingCart.id,
            quantity,
            productId: existingProduct.id,
          },
          select: {
            cartId: true,
            quantity: true,
            productId: true,
          },
        });
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async updateCart(userId: number): Promise<void> {
    await this.prisma.cart.deleteMany({
      where: { userId },
      data: {
        cartItems: [],
      },
    });
  }

  findCartId(userId: number): Promise<FindCartIdInterface> {
    return this.prisma.cart.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        cartItems: true,
      },
    });
  }

  async findCartProducts(userId: number): Promise<FindCartProductsInterface> {
    try {
      return await this.prisma.cart.findUnique({
        where: {
          userId,
        },
        select: {
          cartItems: {
            select: {
              id: true,
              updatedAt: true,
              quantity: true,
              cartId: true,
              products: {
                select: {
                  name: true,
                  amount: true,
                  inStock: true,
                  description: true,
                  type: true,
                  image: true,
                },
              },
            },
          },
        },
      });
    } catch (e) {
      throw e;
    }
  }

  findCartItemQuantity(name: string): Promise<FindCartItemQuantityInterface> {
    return this.prisma.cartItems.findFirst({
      where: {
        products: { name },
      },
      select: {
        quantity: true,
      },
    });
  }

  async findProducts(cartId: number): Promise<FindProductsInterface[]> {
    return this.prisma.cartItems
      .findMany({
        where: { cartId },
        select: {
          quantity: true,
          products: {
            select: {
              name: true,
              description: true,
              amount: true,
              inStock: true,
            },
          },
        },
      })
      .then((cartItems: FindProductsInterface[]): FindProductsInterface[] =>
        cartItems.map(
          (item: FindProductsInterface): FindProductsInterface => ({
            products: item.products,
            quantity: item.quantity,
          }),
        ),
      );
  }

  async deleteProductById(
    productName: string,
    userId: number,
  ): Promise<ProductFromCartInterface> {
    try {
      const existingCart: CartProductsFindUniqueInterface =
        await this.prisma.cart.findUnique({
          where: {
            userId,
          },
          select: {
            cartItems: {
              select: {
                id: true,
                products: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });

      if (!existingCart) {
        throw new BadRequestException(`Cart for user ${userId} not found.`);
      }

      const cartItem: DeleteProductCartItemInterface =
        existingCart.cartItems.find(
          (item: DeleteProductCartItemInterface) =>
            item.products.name === productName,
        );

      if (!cartItem) {
        throw new BadRequestException(
          `Product with name "${productName}" not found in cart.`,
        );
      }

      await this.prisma.cartItems.delete({
        where: {
          id: cartItem.id,
        },
      });

      return {
        id: cartItem.id,
        name: productName,
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async UpdateProductQuantity(
    productName: string,
    userId: number,
    quantity: number,
  ): Promise<UpdateProductQuantityInterface> {
    try {
      const cart: UpdateProductQuantityCartInterface =
        await this.prisma.cart.findUnique({
          where: {
            userId,
          },
          select: {
            id: true,
            cartItems: {
              select: {
                id: true,
                products: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });

      const itemForUpdate: UpdateProductQuantityCartResponseInterface =
        cart.cartItems.find(
          (item: UpdateProductQuantityCartResponseInterface): boolean =>
            item.products.name === productName,
        );

      return await this.prisma.cartItems.update({
        where: {
          id: itemForUpdate.id,
        },
        data: {
          quantity,
        },
      });
    } catch (e: any) {
      console.log(e);
      throw e;
    }
  }
}
