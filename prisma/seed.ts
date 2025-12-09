import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    code: "PROD-001",
    name: "Hydraulic oil 225",
    description: "SAC-branded hydraulic oil 20 L",
    category: "Lubricant",
    stock: 25,
    remaining: 25,
    unit: "L",
    cost: 1500,
    markup: 40,
    minStock: 5,
    sellingPrice: 2100,
    purchaseDate: new Date("2025-08-31"),
  },
  {
    code: "PROD-002",
    name: "T&T 300T Grease 20kg",
    description: "300 t grease 20 kg",
    category: "Lubricant",
    stock: 12,
    remaining: 12,
    unit: "KG",
    cost: 600,
    markup: 40,
    minStock: 3,
    sellingPrice: 840,
    purchaseDate: new Date("2025-08-31"),
  },
  {
    code: "PROD-003",
    name: "30 Amp blade type fuse",
    description: "30 Amp blade type fuse",
    category: "Parts",
    stock: 30,
    remaining: 30,
    unit: "unit",
    cost: 300,
    markup: 50,
    minStock: 10,
    sellingPrice: 450,
    purchaseDate: new Date("2025-08-31"),
  },
  {
    code: "PROD-004",
    name: "Amber indicator bulb",
    description: "Amber indicator replacement bulb 21 V",
    category: "Parts",
    stock: 65,
    remaining: 65,
    unit: "unit",
    cost: 700,
    markup: 50,
    minStock: 15,
    sellingPrice: 1050,
    purchaseDate: new Date("2025-08-31"),
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { code: product.code },
      create: product,
      update: product,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
