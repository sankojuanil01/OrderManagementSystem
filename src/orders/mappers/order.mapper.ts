import { Order } from "../entities/order.entity.js";

export class OrderMapper {
  static toResponse(order: Order) {
    return {
      id: order.id,
      total: order.total,
      status: order.status,

      user: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
      },

      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,

        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
        },
      })),

      created_at: order.created_at,
      updated_at: order.updated_at,



    };
  }
}