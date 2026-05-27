"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
const nestjs_pino_1 = require("nestjs-pino");
const prom_client_1 = require("prom-client");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const product_material_entity_1 = require("./entities/product-material.entity");
const seed_data_1 = require("./seed-data");
let ProductsService = ProductsService_1 = class ProductsService {
    productsRepository;
    materialsRepository;
    productsCreatedCounter;
    stockUpdatesCounter;
    logger;
    constructor(productsRepository, materialsRepository, productsCreatedCounter, stockUpdatesCounter, logger) {
        this.productsRepository = productsRepository;
        this.materialsRepository = materialsRepository;
        this.productsCreatedCounter = productsCreatedCounter;
        this.stockUpdatesCounter = stockUpdatesCounter;
        this.logger = logger;
        this.logger.setContext(ProductsService_1.name);
    }
    async onModuleInit() {
        const count = await this.productsRepository.count();
        if (count > 0)
            return;
        this.logger.info({ event: 'seed_catalog_start', count: seed_data_1.SEED_PRODUCTS.length }, 'Catálogo vacío: cargando productos semilla...');
        for (const product of seed_data_1.SEED_PRODUCTS) {
            await this.create(product);
        }
        this.logger.info({ event: 'seed_catalog_loaded', count: seed_data_1.SEED_PRODUCTS.length }, 'Catálogo semilla cargado.');
    }
    createMaterial(productId, description, index) {
        return this.materialsRepository.create({
            productId,
            materialId: index + 1,
            description
        });
    }
    async create(createProductDto) {
        const { materials, ...productData } = createProductDto;
        const newProduct = this.productsRepository.create(productData);
        const savedProduct = await this.productsRepository.save(newProduct);
        const productMaterials = materials.map((description, index) => this.createMaterial(savedProduct.id, description, index));
        savedProduct.materials = await this.materialsRepository.save(productMaterials);
        this.productsCreatedCounter.inc();
        this.logger.info({ event: 'product_created', productId: savedProduct.id, category: savedProduct.category }, 'Producto creado');
        return savedProduct;
    }
    async findAll(category) {
        if (category)
            return this.productsRepository.find({ where: { category } });
        return this.productsRepository.find();
    }
    async findOne(id) {
        const product = await this.productsRepository.findOne({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException(`Producto con ID ${id} no encontrado`);
        return product;
    }
    async updateStock(id, quantityToDeduct) {
        const product = await this.findOne(id);
        if (product.stock < quantityToDeduct) {
            this.stockUpdatesCounter.inc({ result: 'insufficient' });
            this.logger.warn({ event: 'stock_update_failed', productId: id, requested: quantityToDeduct, available: product.stock }, 'Stock insuficiente para la actualización');
            throw new common_1.BadRequestException(`Stock actual: ${product.stock}, solicitado: ${quantityToDeduct}`);
        }
        product.stock -= quantityToDeduct;
        const updatedProduct = await this.productsRepository.save(product);
        this.stockUpdatesCounter.inc({ result: 'success' });
        this.logger.info({ event: 'stock_updated', productId: id, deducted: quantityToDeduct, remaining: updatedProduct.stock }, 'Stock actualizado');
        return updatedProduct;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = ProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_material_entity_1.ProductMaterial)),
    __param(2, (0, nestjs_prometheus_1.InjectMetric)('products_created_total')),
    __param(3, (0, nestjs_prometheus_1.InjectMetric)('products_stock_updates_total')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        prom_client_1.Counter,
        prom_client_1.Counter,
        nestjs_pino_1.PinoLogger])
], ProductsService);
//# sourceMappingURL=products.service.js.map