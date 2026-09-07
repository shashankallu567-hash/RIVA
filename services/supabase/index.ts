/**
 * RIVA Supabase Service Layer
 * Drop-in replacement for services/mock/index.ts
 * Exports identical interface so StoreContext requires zero changes.
 */
import {
  IProductService,
  IInventoryService,
  IPolicyService,
  IReturnService,
  ITicketService,
  IAuditService,
  IAuthService,
  IRetrievalService,
  INotificationService,
  InventoryStats,
  AssistantResponse,
} from '../interfaces';
import {
  Product,
  InventoryItem,
  ReturnPolicy,
  ReturnRequest,
  SupportTicket,
  AuditLog,
  User,
  UserRole,
  ProductCategory,
  EligibilityStatus,
  InventoryActivityLog,
  StockStatus,
  AppNotification,
  DispatchedNotification,
  NotificationEventType,
  ConversationContext,
  ProcessRivaQueryResult,
} from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase';

// ── Lazy import to avoid SSR issues ──────────────────────────
let _supabaseAdmin: any = null;
async function getAdmin() {
  if (_supabaseAdmin) return _supabaseAdmin;
  const { supabaseAdmin } = await import('@/lib/supabase');
  _supabaseAdmin = supabaseAdmin;
  return _supabaseAdmin;
}

// ── Fallback imports (used when Supabase is not configured) ──
import {
  productService as mockProductService,
  inventoryService as mockInventoryService,
  policyService as mockPolicyService,
  returnService as mockReturnService,
  ticketService as mockTicketService,
  auditService as mockAuditService,
  notificationService as mockNotificationService,
  retrievalService as mockRetrievalService,
} from '../mock';

// ── Helpers ──────────────────────────────────────────────────
function mapDbProductToProduct(row: any): Product {
  return {
    id: row.id,
    productId: row.id,
    sku: row.sku || row.id,
    name: row.name,
    brand: row.brand,
    category: row.category as ProductCategory,
    price: Number(row.price),
    mrp: row.mrp ? Number(row.mrp) : Number(row.price) * 1.05,
    unit: row.unit,
    description: row.description || '',
    image: row.image_url || getCategoryFallbackImage(row.category),
    storeId: row.store_id || 'store-blr-01',
    location: {
      aisle: row.aisle || 'Aisle 1',
      section: row.category || 'General',
      shelf: row.shelf || 'Shelf A1',
    },
    aisle: row.aisle || 'Aisle 1',
    shelf: row.shelf || 'Shelf A1',
    stockQuantity: row.stock_quantity ?? 0,
    stock: row.stock_quantity ?? 0,
    availability: row.availability || 'IN_STOCK',
    store: row.store || 'RIVA Store Bangalore',
    returnPolicy: row.return_policy || '7 days return',
    exchangePolicy: row.exchange_policy || '7 days exchange',
    shelfLife: row.shelf_life || '',
    expiryInformation: row.expiry_required ? 'Check expiry date before purchase' : undefined,
    reorderLevel: row.reorder_level || 10,
    lastUpdated: row.updated_at || new Date().toISOString(),
    returnWindowDays: row.return_window_days || 7,
    barcode: row.barcode,
    tags: row.tags || [],
    isVeg: row.is_veg !== undefined ? row.is_veg : true,
  };
}

function mapDbInventoryToItem(row: any, product?: Product): InventoryItem {
  const qty = Number(row.stock_quantity ?? 0);
  const minThreshold = Number(row.min_threshold ?? 10);
  const status: StockStatus =
    qty === 0 ? 'OUT_STOCK' : qty <= minThreshold ? 'LOW_STOCK' : 'IN_STOCK';
  return {
    id: row.id,
    productId: row.product_id,
    name: product?.name || row.product_id,
    category: (product?.category || 'Grocery & Staples') as ProductCategory,
    brand: product?.brand || '',
    price: product?.price || 0,
    storeId: 'store-blr-01',
    quantity: qty,
    stockQuantity: qty,
    minThreshold,
    reorderLevel: product?.reorderLevel || 10,
    available: qty > 0,
    aisle: row.aisle || product?.aisle || 'Aisle 1',
    shelf: row.shelf || product?.shelf || 'Shelf A1',
    location: {
      aisle: row.aisle || 'Aisle 1',
      section: product?.category || 'General',
      shelf: row.shelf || 'Shelf A1',
    },
    lastUpdated: row.updated_at || new Date().toISOString(),
    returnWindowDays: product?.returnWindowDays || 7,
    batchNumber: row.batch_number,
    expiryDate: row.expiry_date,
    status,
  };
}

export function getCategoryFallbackImage(category: string): string {
  const map: Record<string, string> = {
    Dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
    Beverages: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&auto=format&fit=crop&q=80',
    'Tea & Coffee': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop&q=80',
    Snacks: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&auto=format&fit=crop&q=80',
    'Biscuits & Cookies': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop&q=80',
    'Instant Food': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80',
    'Personal Care': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&auto=format&fit=crop&q=80',
    'Oral Care': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&auto=format&fit=crop&q=80',
    Household: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=80',
    Laundry: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=80',
    'Home Cleaning': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&auto=format&fit=crop&q=80',
    'Grocery & Staples': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
    'Oils & Fats': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80',
    'Spices & Condiments': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80',
    'Baby Care': 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&auto=format&fit=crop&q=80',
    'Packaged Food': 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&auto=format&fit=crop&q=80',
    Bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
    'Frozen Food': 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&auto=format&fit=crop&q=80',
    'Fruits & Vegetables': 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&auto=format&fit=crop&q=80',
  };
  return map[category] || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80';
}

// ════════════════════════════════════════════════════════════
// PRODUCT SERVICE
// ════════════════════════════════════════════════════════════
export const productService: IProductService = {
  async getAllProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured()) return mockProductService.getAllProducts();
    try {
      const db = await getAdmin();
      const { data, error } = await db
        .from('products')
        .select('*, inventory(stock_quantity, availability, min_threshold)')
        .order('category')
        .limit(200);
      if (error || !data) throw error;
      return data.map((row: any) => {
        const inv = row.inventory?.[0];
        return mapDbProductToProduct({
          ...row,
          stock_quantity: inv?.stock_quantity ?? row.stock_quantity ?? 0,
          availability: inv?.availability ?? 'IN_STOCK',
        });
      });
    } catch (e) {
      console.error('[Supabase] getAllProducts fallback:', e);
      return mockProductService.getAllProducts();
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    if (!isSupabaseConfigured()) return mockProductService.getProductById(id);
    try {
      const db = await getAdmin();
      const { data, error } = await db
        .from('products')
        .select('*, inventory(stock_quantity, availability)')
        .eq('id', id)
        .single();
      if (error || !data) return null;
      const inv = data.inventory?.[0];
      return mapDbProductToProduct({ ...data, stock_quantity: inv?.stock_quantity ?? 0 });
    } catch {
      return mockProductService.getProductById(id);
    }
  },

  async getProductByName(name: string): Promise<Product | null> {
    if (!isSupabaseConfigured()) return mockProductService.getProductByName(name);
    try {
      const db = await getAdmin();
      const { data, error } = await db
        .from('products')
        .select('*, inventory(stock_quantity, availability)')
        .ilike('name', `%${name}%`)
        .limit(1)
        .single();
      if (error || !data) return null;
      return mapDbProductToProduct(data);
    } catch {
      return mockProductService.getProductByName(name);
    }
  },

  async searchProducts(query: string, category?: string): Promise<Product[]> {
    if (!isSupabaseConfigured()) return mockProductService.searchProducts(query, category);
    try {
      const db = await getAdmin();
      let q = db
        .from('products')
        .select('*, inventory(stock_quantity, availability, min_threshold)')
        .limit(20);
      if (query) {
        q = q.or(`name.ilike.%${query}%,brand.ilike.%${query}%,description.ilike.%${query}%`);
      }
      if (category) {
        q = q.eq('category', category);
      }
      const { data, error } = await q;
      if (error || !data) throw error;
      return data.map((row: any) => {
        const inv = row.inventory?.[0];
        return mapDbProductToProduct({ ...row, stock_quantity: inv?.stock_quantity ?? 0, availability: inv?.availability ?? 'IN_STOCK' });
      });
    } catch {
      return mockProductService.searchProducts(query, category);
    }
  },

  async getProductsByCategory(category: ProductCategory): Promise<Product[]> {
    if (!isSupabaseConfigured()) return mockProductService.getProductsByCategory(category);
    try {
      const db = await getAdmin();
      const { data, error } = await db
        .from('products')
        .select('*, inventory(stock_quantity, availability, min_threshold)')
        .eq('category', category)
        .limit(50);
      if (error || !data) throw error;
      return data.map((row: any) => {
        const inv = row.inventory?.[0];
        return mapDbProductToProduct({ ...row, stock_quantity: inv?.stock_quantity ?? 0, availability: inv?.availability ?? 'IN_STOCK' });
      });
    } catch {
      return mockProductService.getProductsByCategory(category);
    }
  },

  async createProduct(product: Omit<Product, 'id' | 'productId'>): Promise<Product> {
    if (!isSupabaseConfigured()) return mockProductService.createProduct(product);
    try {
      const db = await getAdmin();
      const id = 'prod-' + Math.random().toString(36).slice(2, 10);
      const { data, error } = await db
        .from('products')
        .insert({
          id,
          sku: product.sku || id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          description: product.description,
          price: product.price,
          mrp: product.mrp,
          unit: product.unit,
          image_url: product.image,
          aisle: product.aisle || product.location?.aisle,
          shelf: product.shelf || product.location?.shelf,
          store_id: product.storeId,
          return_window_days: product.returnWindowDays,
          reorder_level: product.reorderLevel,
          tags: product.tags,
          is_veg: product.isVeg,
        })
        .select()
        .single();
      if (error || !data) throw error;
      // create inventory row
      await db.from('inventory').insert({ product_id: id, stock_quantity: product.stockQuantity || 0, min_threshold: product.reorderLevel || 10 });
      return mapDbProductToProduct({ ...data, stock_quantity: product.stockQuantity || 0 });
    } catch {
      return mockProductService.createProduct(product);
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (!isSupabaseConfigured()) return mockProductService.updateProduct(id, updates);
    try {
      const db = await getAdmin();
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.brand) dbUpdates.brand = updates.brand;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.mrp !== undefined) dbUpdates.mrp = updates.mrp;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.image) dbUpdates.image_url = updates.image;
      if (updates.aisle) dbUpdates.aisle = updates.aisle;
      if (updates.shelf) dbUpdates.shelf = updates.shelf;
      dbUpdates.updated_at = new Date().toISOString();

      const { data, error } = await db.from('products').update(dbUpdates).eq('id', id).select().single();
      if (error || !data) throw error;
      if (updates.stockQuantity !== undefined) {
        await db.from('inventory').update({ stock_quantity: updates.stockQuantity, updated_at: new Date().toISOString() }).eq('product_id', id);
      }
      return mapDbProductToProduct(data);
    } catch {
      return mockProductService.updateProduct(id, updates);
    }
  },
};

// ════════════════════════════════════════════════════════════
// INVENTORY SERVICE
// ════════════════════════════════════════════════════════════
export const inventoryService: IInventoryService = {
  async getAllInventory(): Promise<InventoryItem[]> {
    if (!isSupabaseConfigured()) return mockInventoryService.getAllInventory();
    try {
      const db = await getAdmin();
      const { data, error } = await db
        .from('inventory')
        .select('*, products(id, name, brand, category, price, aisle, shelf, reorder_level, return_window_days)')
        .order('updated_at', { ascending: false });
      if (error || !data) throw error;
      return data.map((row: any) => {
        const p = row.products;
        const product = p ? mapDbProductToProduct({ ...p, stock_quantity: row.stock_quantity }) : undefined;
        return mapDbInventoryToItem(row, product);
      });
    } catch {
      return mockInventoryService.getAllInventory();
    }
  },

  async getInventoryByProductId(productId: string): Promise<InventoryItem | null> {
    if (!isSupabaseConfigured()) return mockInventoryService.getInventoryByProductId(productId);
    try {
      const db = await getAdmin();
      const { data, error } = await db
        .from('inventory')
        .select('*, products(*)')
        .eq('product_id', productId)
        .single();
      if (error || !data) return null;
      return mapDbInventoryToItem(data, mapDbProductToProduct(data.products));
    } catch {
      return mockInventoryService.getInventoryByProductId(productId);
    }
  },

  async getProductByName(name: string) {
    if (!isSupabaseConfigured()) return mockInventoryService.getProductByName(name);
    try {
      const db = await getAdmin();
      const { data } = await db.from('products').select('*, inventory(*)').ilike('name', `%${name}%`).limit(1).single();
      if (!data) return { product: null, inventory: null };
      const product = mapDbProductToProduct({ ...data, stock_quantity: data.inventory?.[0]?.stock_quantity ?? 0 });
      const inventory = data.inventory?.[0] ? mapDbInventoryToItem(data.inventory[0], product) : null;
      return { product, inventory };
    } catch {
      return mockInventoryService.getProductByName(name);
    }
  },

  async searchProducts(query: string) {
    if (!isSupabaseConfigured()) return mockInventoryService.searchProducts(query);
    try {
      const products = await productService.searchProducts(query);
      const db = await getAdmin();
      return await Promise.all(
        products.map(async (product) => {
          const { data } = await db.from('inventory').select('*').eq('product_id', product.id).single();
          const inventory = data ? mapDbInventoryToItem(data, product) : mapDbInventoryToItem({ product_id: product.id, stock_quantity: product.stockQuantity }, product);
          return { product, inventory };
        })
      );
    } catch {
      return mockInventoryService.searchProducts(query);
    }
  },

  async checkStock(productIdOrName: string) {
    if (!isSupabaseConfigured()) return mockInventoryService.checkStock(productIdOrName);
    try {
      const db = await getAdmin();
      const { data } = await db
        .from('inventory')
        .select('*, products(*)')
        .or(`product_id.eq.${productIdOrName},products.name.ilike.%${productIdOrName}%`)
        .limit(1)
        .single();
      if (data) {
        const qty = Number(data.stock_quantity ?? 0);
        const minT = Number(data.min_threshold ?? 10);
        const status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_STOCK' = qty === 0 ? 'OUT_STOCK' : qty <= minT ? 'LOW_STOCK' : 'IN_STOCK';
        return { productName: data.products?.name || productIdOrName, available: qty > 0, quantity: qty, reorderLevel: minT, status };
      }
    } catch {}
    return mockInventoryService.checkStock(productIdOrName);
  },

  async getProductLocation(productIdOrName: string) {
    if (!isSupabaseConfigured()) return mockInventoryService.getProductLocation(productIdOrName);
    try {
      const db = await getAdmin();
      const { data } = await db
        .from('products')
        .select('id, name, aisle, shelf, category')
        .or(`id.eq.${productIdOrName},name.ilike.%${productIdOrName}%,brand.ilike.%${productIdOrName}%`)
        .limit(1)
        .single();
      if (data) {
        return { found: true, productName: data.name, aisle: data.aisle || 'Aisle 1', shelf: data.shelf || 'Shelf A1', section: data.category };
      }
      return { found: false, productName: productIdOrName, aisle: '', shelf: '' };
    } catch {
      return mockInventoryService.getProductLocation(productIdOrName);
    }
  },

  async updateStock(productId: string, newQuantity: number, reason?: InventoryActivityLog['reason']) {
    if (!isSupabaseConfigured()) return mockInventoryService.updateStock(productId, newQuantity, reason);
    try {
      const db = await getAdmin();
      const avail = newQuantity === 0 ? 'OUT_STOCK' : newQuantity <= 10 ? 'LOW_STOCK' : 'IN_STOCK';
      const { data } = await db
        .from('inventory')
        .update({ stock_quantity: newQuantity, availability: avail, updated_at: new Date().toISOString() })
        .eq('product_id', productId)
        .select('*, products(*)')
        .single();
      const item = data ? mapDbInventoryToItem(data, mapDbProductToProduct({ ...data.products, stock_quantity: newQuantity })) : null;
      const log: InventoryActivityLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
        productId,
        productName: item?.name || productId,
        previousQuantity: 0,
        newQuantity,
        reason: reason || 'Manual update',
      };
      await db.from('audit_logs').insert({
        action: 'UPDATE_STOCK',
        entity: 'INVENTORY',
        entity_id: productId,
        details: `Stock updated to ${newQuantity} (${reason || 'Manual update'})`,
        user_id: 'system',
        user_name: 'RIVA System',
        role: 'STAFF',
      });
      return { item: item!, log };
    } catch {
      return mockInventoryService.updateStock(productId, newQuantity, reason);
    }
  },

  async getLowStockProducts(): Promise<InventoryItem[]> {
    if (!isSupabaseConfigured()) return mockInventoryService.getLowStockProducts();
    try {
      const db = await getAdmin();
      const { data } = await db.from('inventory').select('*, products(*)').eq('availability', 'LOW_STOCK');
      return (data || []).map((row: any) => mapDbInventoryToItem(row, row.products ? mapDbProductToProduct(row.products) : undefined));
    } catch {
      return mockInventoryService.getLowStockProducts();
    }
  },

  async getOutOfStockProducts(): Promise<InventoryItem[]> {
    if (!isSupabaseConfigured()) return mockInventoryService.getOutOfStockProducts();
    try {
      const db = await getAdmin();
      const { data } = await db.from('inventory').select('*, products(*)').eq('availability', 'OUT_STOCK');
      return (data || []).map((row: any) => mapDbInventoryToItem(row, row.products ? mapDbProductToProduct(row.products) : undefined));
    } catch {
      return mockInventoryService.getOutOfStockProducts();
    }
  },

  async getInventoryStats(): Promise<InventoryStats> {
    if (!isSupabaseConfigured()) return mockInventoryService.getInventoryStats();
    try {
      const db = await getAdmin();
      const { data } = await db.from('inventory').select('stock_quantity, availability, min_threshold');
      if (!data) throw new Error('no data');
      const totalProducts = data.length;
      const totalUnits = data.reduce((s: number, r: any) => s + Number(r.stock_quantity || 0), 0);
      const lowStockCount = data.filter((r: any) => r.availability === 'LOW_STOCK').length;
      const outOfStockCount = data.filter((r: any) => r.availability === 'OUT_STOCK').length;
      return { totalProducts, totalUnits, lowStockCount, outOfStockCount };
    } catch {
      return mockInventoryService.getInventoryStats();
    }
  },

  async getInventoryActivityLogs(): Promise<InventoryActivityLog[]> {
    if (!isSupabaseConfigured()) return mockInventoryService.getInventoryActivityLogs();
    try {
      const db = await getAdmin();
      const { data } = await db.from('audit_logs').select('*').eq('entity', 'INVENTORY').order('created_at', { ascending: false }).limit(50);
      return (data || []).map((row: any) => ({
        id: row.id,
        timestamp: row.created_at,
        productId: row.entity_id || '',
        productName: row.details?.split(' ')?.[0] || row.entity_id || '',
        previousQuantity: 0,
        newQuantity: 0,
        reason: (row.action === 'UPDATE_STOCK' ? 'Manual update' : 'Manual update') as InventoryActivityLog['reason'],
        updatedBy: row.user_name,
      }));
    } catch {
      return mockInventoryService.getInventoryActivityLogs();
    }
  },

  async resetInventory(): Promise<void> {
    return mockInventoryService.resetInventory();
  },
};

// ════════════════════════════════════════════════════════════
// POLICY SERVICE (uses mock — policies are static config)
// ════════════════════════════════════════════════════════════
export const policyService: IPolicyService = mockPolicyService;

// ════════════════════════════════════════════════════════════
// RETURN SERVICE
// ════════════════════════════════════════════════════════════
export const returnService: IReturnService = {
  async getAllReturns(): Promise<ReturnRequest[]> {
    if (!isSupabaseConfigured()) return mockReturnService.getAllReturns();
    try {
      const db = await getAdmin();
      const { data } = await db.from('returns').select('*').order('created_at', { ascending: false });
      return (data || []).map(mapDbReturn);
    } catch {
      return mockReturnService.getAllReturns();
    }
  },

  async getReturnById(id: string): Promise<ReturnRequest | null> {
    if (!isSupabaseConfigured()) return mockReturnService.getReturnById(id);
    try {
      const db = await getAdmin();
      const { data } = await db.from('returns').select('*').eq('id', id).single();
      return data ? mapDbReturn(data) : null;
    } catch {
      return mockReturnService.getReturnById(id);
    }
  },

  async getReturnsByCustomerId(customerId: string): Promise<ReturnRequest[]> {
    if (!isSupabaseConfigured()) return mockReturnService.getReturnsByCustomerId(customerId);
    try {
      const db = await getAdmin();
      const { data } = await db.from('returns').select('*').eq('customer_id', customerId).order('created_at', { ascending: false });
      return (data || []).map(mapDbReturn);
    } catch {
      return mockReturnService.getReturnsByCustomerId(customerId);
    }
  },

  async createReturnRequest(data: any): Promise<ReturnRequest> {
    if (!isSupabaseConfigured()) return mockReturnService.createReturnRequest(data);
    try {
      const db = await getAdmin();
      const id = 'RET-RIVA-' + Math.floor(100000 + Math.random() * 900000);
      const row = {
        id,
        order_id: data.orderId,
        product_id: data.productId,
        product_name: data.productName,
        category: data.category,
        brand: data.brand,
        price: data.price,
        amount: data.amount || data.price,
        purchase_date: data.purchaseDate,
        customer_id: data.customerId,
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        store_id: data.storeId || 'store-blr-01',
        reason: data.reason,
        condition: data.condition,
        has_receipt: data.hasReceipt !== false,
        is_opened: data.isOpened || false,
        status: 'PENDING',
        eligibility: 'ELIGIBLE_AUTO',
        resolution_type: data.resolutionType || 'REFUND',
        notes: data.notes,
        reference_number: id,
      };
      const { data: inserted } = await db.from('returns').insert(row).select().single();
      return mapDbReturn(inserted || row);
    } catch {
      return mockReturnService.createReturnRequest(data);
    }
  },

  async updateReturnStatus(id: string, status: ReturnRequest['status'], notes?: string): Promise<ReturnRequest> {
    if (!isSupabaseConfigured()) return mockReturnService.updateReturnStatus(id, status, notes);
    try {
      const db = await getAdmin();
      const { data } = await db.from('returns').update({ status, notes, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      return mapDbReturn(data);
    } catch {
      return mockReturnService.updateReturnStatus(id, status, notes);
    }
  },
};

function mapDbReturn(row: any): ReturnRequest {
  return {
    id: row.id,
    orderId: row.order_id || '',
    productId: row.product_id || '',
    productName: row.product_name || '',
    category: row.category,
    brand: row.brand,
    price: Number(row.price || 0),
    amount: Number(row.amount || row.price || 0),
    purchaseDate: row.purchase_date || new Date().toISOString(),
    customerId: row.customer_id || 'cust-demo-01',
    customerName: row.customer_name || 'Customer',
    customerPhone: row.customer_phone,
    storeId: row.store_id,
    reason: row.reason || '',
    condition: row.condition,
    hasReceipt: row.has_receipt !== false,
    isOpened: row.is_opened || false,
    status: row.status || 'PENDING',
    eligibility: row.eligibility || 'ELIGIBLE_AUTO',
    resolutionType: row.resolution_type || 'REFUND',
    notes: row.notes,
    ticketId: row.ticket_id,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

// ════════════════════════════════════════════════════════════
// TICKET SERVICE
// ════════════════════════════════════════════════════════════
export const ticketService: ITicketService = {
  async getAllTickets(): Promise<SupportTicket[]> {
    if (!isSupabaseConfigured()) return mockTicketService.getAllTickets();
    try {
      const db = await getAdmin();
      const { data } = await db.from('support_tickets').select('*').order('created_at', { ascending: false });
      return (data || []).map(mapDbTicket);
    } catch {
      return mockTicketService.getAllTickets();
    }
  },

  async getTicketById(id: string): Promise<SupportTicket | null> {
    if (!isSupabaseConfigured()) return mockTicketService.getTicketById(id);
    try {
      const db = await getAdmin();
      const { data } = await db.from('support_tickets').select('*').eq('id', id).single();
      return data ? mapDbTicket(data) : null;
    } catch {
      return mockTicketService.getTicketById(id);
    }
  },

  async getTicketsByCustomer(customerId: string): Promise<SupportTicket[]> {
    if (!isSupabaseConfigured()) return mockTicketService.getTicketsByCustomer(customerId);
    try {
      const db = await getAdmin();
      const { data } = await db.from('support_tickets').select('*').eq('customer_id', customerId);
      return (data || []).map(mapDbTicket);
    } catch {
      return mockTicketService.getTicketsByCustomer(customerId);
    }
  },

  async createTicket(data: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupportTicket> {
    if (!isSupabaseConfigured()) return mockTicketService.createTicket(data);
    try {
      const db = await getAdmin();
      const { data: inserted } = await db.from('support_tickets').insert({
        customer_id: data.customerId,
        customer_name: data.customerName,
        customer_contact: data.customerContact,
        type: data.type,
        priority: data.priority,
        status: data.status,
        title: data.title,
        description: data.description,
        source: data.source,
        assigned_staff_id: data.assignedStaffId,
        related_entity_id: data.relatedEntityId,
      }).select().single();
      return mapDbTicket(inserted);
    } catch {
      return mockTicketService.createTicket(data);
    }
  },

  async updateTicketStatus(id: string, status: SupportTicket['status'], assignedStaffId?: string): Promise<SupportTicket> {
    if (!isSupabaseConfigured()) return mockTicketService.updateTicketStatus(id, status, assignedStaffId);
    try {
      const db = await getAdmin();
      const { data } = await db.from('support_tickets').update({ status, assigned_staff_id: assignedStaffId, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      return mapDbTicket(data);
    } catch {
      return mockTicketService.updateTicketStatus(id, status, assignedStaffId);
    }
  },
};

function mapDbTicket(row: any): SupportTicket {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerContact: row.customer_contact,
    type: row.type || 'GENERAL_QUERY',
    priority: row.priority || 'MEDIUM',
    status: row.status || 'OPEN',
    title: row.title || '',
    description: row.description || '',
    source: row.source || 'MANUAL',
    assignedStaffId: row.assigned_staff_id,
    assignedStaffName: row.assigned_staff_name,
    relatedEntityId: row.related_entity_id,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

// ════════════════════════════════════════════════════════════
// AUDIT SERVICE
// ════════════════════════════════════════════════════════════
export const auditService: IAuditService = {
  async getAllLogs(): Promise<AuditLog[]> {
    if (!isSupabaseConfigured()) return mockAuditService.getAllLogs();
    try {
      const db = await getAdmin();
      const { data } = await db.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      return (data || []).map((row: any) => ({
        id: row.id,
        timestamp: row.created_at,
        userId: row.user_id || 'system',
        userName: row.user_name || 'System',
        role: (row.role || 'STAFF') as any,
        action: row.action || '',
        entity: (row.entity || 'ASSISTANT') as any,
        entityId: row.entity_id || '',
        details: row.details || '',
        ipAddress: row.ip_address,
      }));
    } catch {
      return mockAuditService.getAllLogs();
    }
  },

  async logEvent(event: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    if (!isSupabaseConfigured()) return mockAuditService.logEvent(event);
    try {
      const db = await getAdmin();
      const { data } = await db.from('audit_logs').insert({
        user_id: event.userId,
        user_name: event.userName,
        role: event.role,
        action: event.action,
        entity: event.entity,
        entity_id: event.entityId,
        details: event.details,
        ip_address: event.ipAddress,
      }).select().single();
      return { ...event, id: data?.id || 'aud-' + Date.now(), timestamp: data?.created_at || new Date().toISOString() };
    } catch {
      return mockAuditService.logEvent(event);
    }
  },

  async getLogsByEntity(entity: AuditLog['entity'], entityId?: string): Promise<AuditLog[]> {
    if (!isSupabaseConfigured()) return mockAuditService.getLogsByEntity(entity, entityId);
    try {
      const db = await getAdmin();
      let q = db.from('audit_logs').select('*').eq('entity', entity);
      if (entityId) q = q.eq('entity_id', entityId);
      const { data } = await q.order('created_at', { ascending: false });
      return (data || []).map((row: any) => ({
        id: row.id,
        timestamp: row.created_at,
        userId: row.user_id || '',
        userName: row.user_name || '',
        role: (row.role || 'STAFF') as any,
        action: row.action || '',
        entity: (row.entity || entity) as any,
        entityId: row.entity_id || '',
        details: row.details || '',
      }));
    } catch {
      return mockAuditService.getLogsByEntity(entity, entityId);
    }
  },
};

// ════════════════════════════════════════════════════════════
// NOTIFICATION SERVICE
// ════════════════════════════════════════════════════════════
export const notificationService: INotificationService = {
  async getAllNotifications(): Promise<AppNotification[]> {
    if (!isSupabaseConfigured()) return mockNotificationService.getAllNotifications();
    try {
      const db = await getAdmin();
      const { data } = await db.from('notifications').select('*').order('created_at', { ascending: false }).limit(50);
      return (data || []).map((row: any) => ({
        id: row.id,
        type: row.type as NotificationEventType,
        title: row.title,
        message: row.message,
        timestamp: row.created_at,
        read: row.read || false,
        targetRole: row.target_role,
        targetUserId: row.target_user_id,
        referenceId: row.reference_id,
        actionUrl: row.action_url,
      }));
    } catch {
      return mockNotificationService.getAllNotifications();
    }
  },

  async getNotificationsByUser(userId?: string, role?: UserRole): Promise<AppNotification[]> {
    return notificationService.getAllNotifications();
  },

  async markAsRead(id: string): Promise<void> {
    if (!isSupabaseConfigured()) return mockNotificationService.markAsRead(id);
    try {
      const db = await getAdmin();
      await db.from('notifications').update({ read: true }).eq('id', id);
    } catch {
      return mockNotificationService.markAsRead(id);
    }
  },

  async markAllAsRead(userId?: string): Promise<void> {
    if (!isSupabaseConfigured()) return mockNotificationService.markAllAsRead(userId);
    try {
      const db = await getAdmin();
      await db.from('notifications').update({ read: true }).eq('read', false);
    } catch {
      return mockNotificationService.markAllAsRead(userId);
    }
  },

  async getDispatchedLogs(): Promise<DispatchedNotification[]> {
    return mockNotificationService.getDispatchedLogs();
  },

  async dispatchNotification(params: any): Promise<DispatchedNotification> {
    if (!isSupabaseConfigured()) return mockNotificationService.dispatchNotification(params);
    try {
      const db = await getAdmin();
      await db.from('notifications').insert({
        type: params.event,
        title: params.title,
        message: params.message,
        target_role: params.targetRole || 'ALL',
        target_user_id: params.targetUserId,
        reference_id: params.referenceId,
        read: false,
      });
    } catch {}
    return mockNotificationService.dispatchNotification(params);
  },
};

// ════════════════════════════════════════════════════════════
// RETRIEVAL SERVICE (delegates to chat API — no change needed)
// ════════════════════════════════════════════════════════════
export const retrievalService: IRetrievalService = mockRetrievalService;

// ════════════════════════════════════════════════════════════
// AUTH SERVICE (mock — demo mode, no real auth)
// ════════════════════════════════════════════════════════════
export { authService } from '../mock';

// ════════════════════════════════════════════════════════════
// NAMED EXPORTS (compatibility with existing imports)
// ════════════════════════════════════════════════════════════
export { processRivaQuery } from '../mock';
