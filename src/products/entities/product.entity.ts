import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProductStatus } from "../enum/product-status.enum.js";
import { OrderItem } from "../../orders/entities/order-item.entity.js";
import { ModifierGroup } from "../../modifier/entities/modifier.group.entity.js";

@Entity('products')

@Index("idx_products_name",["name"])
@Index("idx_products_price", ["price"])
@Index("idx_products_status", ["status"])
@Index("idx_products_created_at", ["created_at"])
export class Product {


    @PrimaryGeneratedColumn()
    id : number;

    @Column({type : 'varchar' , length : 100, nullable : false})
    name : string;

    @Column({type : 'text',
      nullable : true
    })
    description : string | null;

    @Column({type : 'decimal' , precision : 10 , scale : 2})
    price : number;

    @Column({type : 'int'})
    stock : number;

    @Column({
  type: 'enum',
  enum: ProductStatus,
  default: ProductStatus.ACTIVE,
})
status: ProductStatus;

    @CreateDateColumn({
      name: 'created_at',
        type: 'timestamptz',
    })
    created_at : Date;

    @UpdateDateColumn({
      name: 'updated_at',
        type: 'timestamptz',
    })
    updated_at : Date;  

    // one product can appear in many orders 
    @OneToMany(()=> OrderItem ,
     (orderItem) => orderItem.product)
    orderItems :OrderItem[]

    @OneToMany(
        'ModifierGroup',
      (modifierGroup : ModifierGroup) => modifierGroup.product
    )
    modifiergroups : ModifierGroup[]

}