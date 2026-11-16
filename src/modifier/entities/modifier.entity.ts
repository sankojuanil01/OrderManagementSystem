import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { ModifierGroup } from "./modifier.group.entity.js";

@Entity({ name : 'modifiers', schema : 'order_management'})
export class Modifier {

    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({
        type : 'varchar',
        length : 100
    })
    name : string;

    @Column({
        type : 'numeric',
        precision : 12,
        scale : 2,
        default : 0
    })
    priceAdjustment : string;

    @Column({
        name : 'is_active',
        type : 'boolean',
        default : true
    })
    isActive : boolean;

    @ManyToOne(
        'ModifierGroup',
        (modifierGroup : ModifierGroup) => modifierGroup.modifiers,
        {nullable : false}
    )
    @JoinColumn({
        name : 'modifier_group_id'
    })
    group! : ModifierGroup

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