import { InventoryItem, StockStatus } from '@/types';
import { MOCK_PRODUCTS } from './mockProducts';

export function getStockStatus(qty: number, reorder: number): StockStatus {
  if (qty === 0) return 'OUT_STOCK';
  if (qty <= reorder) return 'LOW_STOCK';
  return 'IN_STOCK';
}

export const MOCK_INVENTORY: InventoryItem[] = MOCK_PRODUCTS.map((p, idx) => {
  const status = getStockStatus(p.stockQuantity, p.reorderLevel);
  return {
    id: `inv-${idx + 1}`,
    productId: p.id,
    name: p.name,
    category: p.category,
    brand: p.brand,
    price: p.price,
    storeId: p.storeId,
    quantity: p.stockQuantity,
    stockQuantity: p.stockQuantity,
    minThreshold: p.reorderLevel,
    reorderLevel: p.reorderLevel,
    available: p.stockQuantity > 0,
    aisle: p.aisle,
    shelf: p.shelf,
    location: p.location,
    lastUpdated: p.lastUpdated,
    returnWindowDays: p.returnWindowDays,
    batchNumber: `BAT-${p.sku.split('-')[1] || 'IND'}-${100 + idx}`,
    status,
  };
});
