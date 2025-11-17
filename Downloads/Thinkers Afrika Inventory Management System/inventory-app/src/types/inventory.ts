export type Product = {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  stock: number;
  unit: string;
  cost: number;
  markup: number;
  minStock: number;
  remaining: number;
  sellingPrice: number;
  purchaseDate: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Consumption = {
  id: number;
  productId: number;
  quantity: number;
  type: string;
  consumer: string;
  date: string;
  product?: Product;
};
