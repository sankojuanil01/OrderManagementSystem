import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Modifier } from "./modifier.entity.js";
import type { Product } from "../../products/entities/product.entity.js";

@Entity({
    name : 'modifier_groups', schema : 'order_management'
})
export class ModifierGroup {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({
        type : 'varchar',
        length : 100
    })
    name : string;

    @Column({
        type : 'boolean',
        default : false
    })
    isRequired : boolean;

    @Column({
        type : 'int',
        default : 0
    })
    minSelect : number;

    @Column({
        type : 'int',
        default : 0
    })
    maxSelect : number;

    @Column({
        type : 'boolean',
        default : true
    })
    isActive : boolean;

    @OneToMany(
         'Modifier',
        (modifier : Modifier) => modifier.group,
        {cascade : true}
    )
    modifiers! : Modifier[];

    @ManyToOne(
         'Product',
        (product : Product) => product.modifiergroups,
        {
            nullable : false,
            onDelete : 'CASCADE'
        }
    )
    @JoinColumn({name : 'product_id'})
    product! : Product

    @CreateDateColumn({
            name : 'created_at',
            type : 'timestamptz'
        })
        createdAt : Date;
    
        @UpdateDateColumn({
            name : 'updated_at',
            type : 'timestamptz'
        })
        updatedAt : Date
}