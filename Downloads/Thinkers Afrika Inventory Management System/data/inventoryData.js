export const inventoryData = [
    {
        id: 'PROD-001',
        name: 'Hydraulic Oil 225',
        description: 'SAC-branded hydraulic oil 20 L',
        category: 'Lubricant',
        stock: 25,
        remaining: 25,
        unit: 'L',
        cost: 1500,
        markup: 40,
        sellingPrice: Number((1500 * 1.4).toFixed(2)),
        minStock: 10,
        purchaseDate: '2024-01-12'
    },
    {
        id: 'PROD-002',
        name: 'T&T 300T Grease 20kg',
        description: 'Heavy-duty T&T 300T grease for industrial bearings',
        category: 'Lubricant',
        stock: 12,
        remaining: 12,
        unit: 'KG',
        cost: 600,
        markup: 35,
        sellingPrice: Number((600 * 1.35).toFixed(2)),
        minStock: 6,
        purchaseDate: '2024-01-18'
    },
    {
        id: 'PROD-003',
        name: '30A Blade Fuse',
        description: '30 Amp blade type fuse',
        category: 'Parts',
        stock: 30,
        remaining: 30,
        unit: 'unit',
        cost: 300,
        markup: 45,
        sellingPrice: Number((300 * 1.45).toFixed(2)),
        minStock: 15,
        purchaseDate: '2024-02-02'
    },
    {
        id: 'PROD-004',
        name: 'Amber Indicator Bulbs',
        description: 'Amber indicator replacement bulb 21 V',
        category: 'Parts',
        stock: 65,
        remaining: 65,
        unit: 'unit',
        cost: 700,
        markup: 30,
        sellingPrice: Number((700 * 1.3).toFixed(2)),
        minStock: 25,
        purchaseDate: '2024-02-10'
    }
];
