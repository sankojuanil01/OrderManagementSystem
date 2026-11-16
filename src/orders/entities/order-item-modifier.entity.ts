import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderItem } from "./order-item.entity.js";
import { Modifier } from "../../modifier/entities/modifier.entity.js";

@Entity({
    name : 'order_item_modifiers'
})
export class OrderItemModifier {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column()
    modifierName : string;

    @Column({
        type : 'numeric',
        precision : 12,
        scale : 2
    })
    modifierPrice : string;

    @ManyToOne('OrderItem', (orderItem: OrderItem) => orderItem.modifiers, {
  nullable: false,
  onDelete: 'CASCADE',
})
@JoinColumn({ name: 'order_item_id' })
orderItem!: OrderItem;

    @ManyToOne(() => Modifier, {
        nullable : true,
        onDelete : 'SET NULL'
    })
    modifier : Modifier;

    @CreateDateColumn({
        name : 'created_at',
        type : 'timestamptz'
    })
    createdAt : Date;
}