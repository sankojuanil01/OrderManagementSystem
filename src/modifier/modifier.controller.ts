import { Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ModifierService } from './modifier.service.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../users/enum/roles.enum.js';
import { CreateModifierDto } from './dto/create-modifier.dto.js';
import { CreateModifierGroupDto } from './dto/create-modifier-group.dto.js';

@Controller('modifier')
export class ModifierController {

    constructor(
        private readonly modifierService : ModifierService
    ){}

    @Post('groups')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    createGroup(
        @Body() createModifierGroupDto : CreateModifierGroupDto
    ){
        return this.modifierService.createGroup(createModifierGroupDto)
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    createModifier(
        @Body() createModifierDto : CreateModifierDto
    ){
        return this.modifierService.createModifier(createModifierDto)
    }

    @Get('products/:productId')
    getProductModifiers(
        @Param('productId' , ParseIntPipe) productId : number
    ){
        return this.modifierService.getProductModifiers(productId)
    }
}
