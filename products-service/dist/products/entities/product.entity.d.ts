import { ProductMaterial } from './product-material.entity';
export declare class Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    height: number;
    width: number;
    depth: number;
    deliveryTime: string;
    brandColor: string;
    materials: ProductMaterial[];
}
