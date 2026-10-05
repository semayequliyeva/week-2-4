// Mehsul ve satis melumatlarinin interfeys strukturu
export interface ProductRecord {
  id: string;
  productName: string;
  category: string;
  region: string;
  price: number;
  quantity: number;
  revenue: number;
}

// Cedvel ucun test melumatlari (mock data)
export const MOCK_PRODUCTS: ProductRecord[] = [
  { id: '1', productName: 'Laptop Pro 15', category: 'Electronics', region: 'North', price: 1200, quantity: 5, revenue: 6000 },
  { id: '2', productName: 'Wireless Mouse', category: 'Electronics', region: 'South', price: 25, quantity: 40, revenue: 1000 },
  { id: '3', productName: 'Mechanical Keyboard', category: 'Electronics', region: 'North', price: 100, quantity: 15, revenue: 1500 },
  { id: '4', productName: 'Cotton T-Shirt', category: 'Clothing', region: 'East', price: 20, quantity: 100, revenue: 2000 },
  { id: '5', productName: 'Denim Jeans', category: 'Clothing', region: 'West', price: 50, quantity: 30, revenue: 1500 },
  { id: '6', productName: 'Winter Jacket', category: 'Clothing', region: 'North', price: 150, quantity: 10, revenue: 1500 },
  { id: '7', productName: 'Coffee Maker', category: 'Home', region: 'South', price: 80, quantity: 20, revenue: 1600 },
  { id: '8', productName: 'Air Purifier', category: 'Home', region: 'East', price: 200, quantity: 8, revenue: 1600 },
  { id: '9', productName: 'Desk Lamp', category: 'Home', region: 'West', price: 35, quantity: 25, revenue: 875 },
  { id: '10', productName: 'Gaming Monitor', category: 'Electronics', region: 'East', price: 300, quantity: 12, revenue: 3600 },
  { id: '11', productName: 'Running Shoes', category: 'Clothing', region: 'South', price: 90, quantity: 18, revenue: 1620 },
  { id: '12', productName: 'Smart Vacuum', category: 'Home', region: 'North', price: 250, quantity: 6, revenue: 1500 },
];