import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "../enum/roles.enum.js";
import { Order } from "../../orders/entities/order.entity.js";

@Entity({name : 'users',
    comment : 'stores user information'
})
export class User {
    @PrimaryGeneratedColumn()
    id : number;

    @Column({type : 'varchar' , length : 100 })
    name : string;

    @Column({ type : 'varchar',
        unique : true,
    })
    email : string;

    @Column({
        type : 'varchar',
    })
    password : string;

    @Column({
        type : 'enum',
        enum : UserRole,
    })
    role : UserRole

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

    // one usermay have many orders
    // the actual foreign key is maintained on the Order Side 
    // using @ManyToOne()
    @OneToMany(()=>Order , (order) => order.user )
    orders : Order[]

    

    

}