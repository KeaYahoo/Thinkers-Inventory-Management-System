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

export type Supplier = {
  id: number;
  name: string;
  contact: string;
  spares: string;
  location: string;
  specialty: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Vehicle = {
  id: number;
  regNumber: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type VehicleLog = {
  id: number;
  vehicleId: number;
  date: string;
  location: string;
  liters: number;
  cost: number;
  tripDetails?: string;
  createdAt?: string;
  updatedAt?: string;
  vehicle?: Vehicle;
};
