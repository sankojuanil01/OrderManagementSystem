import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ModifierGroup } from './entities/modifier.group.entity.js';
import { Repository } from 'typeorm';
import { Modifier } from './entities/modifier.entity.js';
import { Product } from '../products/entities/product.entity.js';
import { CreateModifierGroupDto } from './dto/create-modifier-group.dto.js';
import { CreateModifierDto } from './dto/create-modifier.dto.js';

@Injectable()
export class ModifierService {

    constructor(
        @InjectRepository(ModifierGroup)
        private readonly groupRepository : Repository<ModifierGroup>,

        @InjectRepository(Modifier)
        private readonly modifierRepository : Repository<Modifier>,

        @InjectRepository(Product)
        private readonly productRepository : Repository<Product>
    ){}

    async createGroup(createModifierGroupDto : CreateModifierGroupDto){

        const product = await this.productRepository.findOne({
            where : {id : createModifierGroupDto.productId}
        });

        if(!product) {
            throw new NotFoundException('Product not found')
        }

        const minSelect = createModifierGroupDto.minSelect ?? 0;
        const maxSelect = createModifierGroupDto.maxSelect ?? 0;

        if(minSelect > maxSelect) {
            throw new BadRequestException('Minimum selection cannot exceed maximum selection')
        }

        const group = this.groupRepository.create({
            name : createModifierGroupDto.name,
            product,
            isRequired : createModifierGroupDto.isRequired ?? false,
            minSelect,
            maxSelect,
            isActive : createModifierGroupDto.isActive ?? true,
        })

        return this.groupRepository.save(group)
    }

    async createModifier(createModifierDto: CreateModifierDto) {
        const group = await this.groupRepository.findOne({
            where : {
                id : createModifierDto.groupId,
                isActive : true,
            },
        });

        if(!group) {
            throw new NotFoundException('Active modifier group not found')
        }

        const modifier = this.modifierRepository.create({
            name : createModifierDto.name,
            priceAdjustment : createModifierDto.priceAdjustment.toFixed(2),
            group,
            isActive : true,
        })
        return this.modifierRepository.save(modifier)
    }

    async getProductModifiers(productId : number){
        const product = await this.productRepository.findOne({
            where : {id : productId}
        })

        if(!product){
            throw new NotFoundException('product not found')
        }

        return this.groupRepository.find({
            where : {
                product : {id : productId},
                isActive : true
            },
            relations : {
                modifiers : true
            }
        })
    }


}
