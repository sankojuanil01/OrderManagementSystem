import { PartialType } from "@nestjs/mapped-types";
import { CreateProductDto } from "./createProduct.dto.js";

export class PatchproductDto extends PartialType(CreateProductDto) {}