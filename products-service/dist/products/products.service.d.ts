import { OnModuleInit } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Counter } from 'prom-client';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { ProductMaterial } from './entities/product-material.entity';
export declare class ProductsService implements OnModuleInit {
    private productsRepository;
    private materialsRepository;
    private readonly productsCreatedCounter;
    private readonly stockUpdatesCounter;
    private readonly logger;
    constructor(productsRepository: Repository<Product>, materialsRepository: Repository<ProductMaterial>, productsCreatedCounter: Counter<string>, stockUpdatesCounter: Counter<string>, logger: PinoLogger);
    onModuleInit(): Promise<void>;
    createMaterial(productId: number, description: string, index: number): ProductMaterial;
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(category?: string): Promise<Product[]>;
    findOne(id: number): Promise<Product>;
    updateStock(id: number, quantityToDeduct: number): Promise<Product>;
}
