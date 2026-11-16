import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModifierGroup } from './entities/modifier.group.entity.js';
import { Modifier } from './entities/modifier.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { ModifierController } from './modifier.controller.js';
import { ModifierService } from './modifier.service.js';

@Module({

    imports : [
        TypeOrmModule.forFeature([
            ModifierGroup,
            Modifier,
            Product
        ]),
    ],
    controllers : [ModifierController],
    providers : [ModifierService],
    exports : [ModifierService]
})
export class ModifierModule {}
