import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<import("./entities/product.entity").Product>;
    findAll(category?: string): Promise<import("./entities/product.entity").Product[]>;
    findOne(id: number): Promise<import("./entities/product.entity").Product>;
    updateStock(id: number, quantity: number): Promise<import("./entities/product.entity").Product>;
}
