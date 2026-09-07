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
  AssistantResponse
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
  UserIntent,
  ExtractedEntities,
  AssistantActionPayload,
  AppNotification,
  DispatchedNotification,
  NotificationEventType,
  ConversationContext,
  ProcessRivaQueryResult
} from '@/types';
import { MOCK_PRODUCTS } from '@/data/mockProducts';
import { MOCK_INVENTORY, getStockStatus } from '@/data/mockInventory';
import { MOCK_POLICIES } from '@/data/mockPolicies';
import { MOCK_RETURNS } from '@/data/mockReturns';
import { MOCK_TICKETS } from '@/data/mockTickets';
import { MOCK_AUDIT_LOGS } from '@/data/mockAuditLogs';
import { DEMO_USERS } from '@/data/mockUsers';
import { 
  STORE_LAYOUT_KNOWLEDGE, 
  STORE_OPERATING_RULES, 
  PRODUCT_RESTRICTIONS 
} from '@/data/mockKnowledgeBase';
import { generateId, formatCurrency } from '@/lib/utils';

// Helper to normalize search text
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Helper: checks if query contains any of the provided keywords
function hasMentionOf(keywords: string[], query: string): boolean {
  return keywords.some(k => query.toLowerCase().includes(k));
}

// General conversation topics that RIVA can answer without store data
function isGeneralConversationQuery(q: string): boolean {
  const norm = normalizeText(q);
  const generalTopics = [
    'what is fmcg', 'what are fmcg', 'fmcg means', 'fmcg stands', 'what does fmcg mean', 'fmcg meaning', 'fmcg definition', 'meaning of fmcg',
    'what is a supermarket', 'what is retail', 'what is grocery',
    'what is dairy', 'explain dairy', 'explain dairy products', 'what is milk', 'what is ghee', 'what is paneer',
    'difference between milk and curd', 'difference between curd and milk', 'milk vs curd', 'curd vs milk',
    'difference between milk and', 'difference between curd and',
    'what is protein', 'what is vitamin', 'what is calcium',
    'suggest breakfast', 'breakfast ideas', 'breakfast products', 'suggest healthy', 'healthy snacks', 'party snacks', 'suggest snacks for a party', 'snacks for party', 'snacks for a party', 'for a party', 'suggest snacks', 'define fmcg',
    'what should i eat', 'good for health', 'nutritious', 'healthy option',
    'how are you', 'how do you do', "what's up", 'whats up', 'wassup',
    'who are you', 'what are you', 'tell me about yourself', 'about riva',
    'what can riva do', 'how does riva work', 'what can you help', 'what can you do', 'what can i do',
    'can you help me', 'can you help',
    'what is the time', 'current time', 'what day is it',
    'interesting', 'cool', 'amazing', 'wow', 'nice', 'great', 'ok', 'okay', 'alright',
    'what is atta', 'what is dal', 'what is rice', 'what is tea', 'what is coffee',
    'what is shampoo', 'what is detergent', 'what is soap',
    'tell me more', 'explain more', 'i see', 'i understand',
    'what else', 'what now', 'anything else',
    'who made you', 'who created you', 'who built you',
  ];
  return generalTopics.some(t => norm.includes(normalizeText(t)) || q.toLowerCase().includes(t));
}


// Initial Activity Logs
const INITIAL_ACTIVITY_LOGS: InventoryActivityLog[] = [
  {
    id: 'act-1',
    timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    productId: 'prod-tea-01',
    productName: 'Tata Tea Gold Leaf & Granules',
    previousQuantity: 10,
    newQuantity: 8,
    reason: 'Sale',
    updatedBy: 'POS Terminal 2',
  },
  {
    id: 'act-2',
    timestamp: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    productId: 'prod-inst-01',
    productName: 'Maggi 2-Minute Masala Instant Noodles',
    previousQuantity: 35,
    newQuantity: 32,
    reason: 'Sale',
    updatedBy: 'POS Terminal 1',
  },
  {
    id: 'act-3',
    timestamp: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
    productId: 'prod-tea-06',
    productName: 'Nescafe Classic Instant Coffee Powder',
    previousQuantity: 3,
    newQuantity: 0,
    reason: 'Manual update',
    updatedBy: 'Priya Sundaram (Floor Mgr)',
  },
];

// Initial App Notifications
const INITIAL_APP_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'LOW_STOCK_ALERT',
    title: 'Low Stock Alert: Tata Tea Gold',
    message: 'Tata Tea Gold Leaf & Granules has 8 units remaining (reorder threshold is 5).',
    timestamp: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    read: false,
    targetRole: 'STAFF',
    actionUrl: '/staff/inventory'
  },
  {
    id: 'notif-2',
    type: 'OUT_OF_STOCK_ALERT',
    title: 'Out of Stock: Nescafe Classic',
    message: 'Nescafe Classic Instant Coffee Powder is out of stock in Aisle 3, Shelf D1.',
    timestamp: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    read: false,
    targetRole: 'STAFF',
    actionUrl: '/staff/inventory'
  },
  {
    id: 'notif-3',
    type: 'RETURN_APPROVED',
    title: 'Return Approved: Nandini GoodLife Ghee',
    message: 'Return request RET-88210 was autonomously approved for ₹610. Store credit voucher generated.',
    timestamp: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    read: true,
    targetRole: 'CUSTOMER',
    targetUserId: 'usr-cust-101',
    referenceId: 'RET-88210',
    actionUrl: '/customer/returns'
  }
];

// ==========================================
// 1. AUDIT SERVICE
// ==========================================
export class MockAuditService implements IAuditService {
  private logs: AuditLog[] = [...MOCK_AUDIT_LOGS];

  async getAllLogs(): Promise<AuditLog[]> {
    return [...this.logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async logEvent(event: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const newLog: AuditLog = {
      ...event,
      id: generateId('aud'),
      timestamp: new Date().toISOString(),
    };
    this.logs.unshift(newLog);
    return newLog;
  }

  async getLogsByEntity(entity: AuditLog['entity'], entityId?: string): Promise<AuditLog[]> {
    return this.logs.filter(l => l.entity === entity && (!entityId || l.entityId === entityId));
  }
}

export const auditService = new MockAuditService();

// ==========================================
// 2. UNIFIED NOTIFICATION SERVICE
// ==========================================
export class MockNotificationService implements INotificationService {
  private notifications: AppNotification[] = [...INITIAL_APP_NOTIFICATIONS];
  private dispatches: DispatchedNotification[] = [
    {
      id: 'disp-001',
      event: 'RETURN_APPROVED',
      title: 'Return Request Approved: RET-88210',
      timestamp: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
      referenceId: 'RET-88210',
      channels: {
        inApp: {
          status: 'DELIVERED',
          preview: 'Return request RET-88210 approved autonomously for ₹610.'
        },
        email: {
          status: 'SIMULATED (Demo Mode)',
          recipient: 'aarav.sharma@example.com',
          subject: 'RIVA Notification: Return RET-88210 Approved',
          body: 'Dear Aarav, your return request for Nandini GoodLife Ghee (₹610) has been approved. Instant store credit is credited to your wallet.',
          provider: 'Mock Email Provider (Local Demo)'
        },
        sms: {
          status: 'SIMULATED (Demo Mode)',
          phoneNumber: '+91 98765 43210',
          message: 'RIVA: Return RET-88210 for ₹610 approved. Voucher code RIVA-CREDIT-88210 is ready to use.',
          provider: 'Mock SMS Gateway (Local Demo)'
        },
        whatsapp: {
          status: 'SIMULATED (Demo Mode)',
          recipient: '+91 98765 43210',
          message: '🛒 *RIVA In-Store Assistant*\nYour return for *Nandini GoodLife Ghee* is *APPROVED* ✅\nAmount: ₹610\nRef ID: RET-88210',
          provider: 'Mock WhatsApp Business API (Local Demo)'
        }
      }
    }
  ];

  async getAllNotifications(): Promise<AppNotification[]> {
    return [...this.notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getNotificationsByUser(userId?: string, role?: UserRole): Promise<AppNotification[]> {
    return this.notifications.filter(n => {
      if (userId && n.targetUserId === userId) return true;
      if (role && (n.targetRole === role || n.targetRole === 'ALL')) return true;
      if (!n.targetRole || n.targetRole === 'ALL') return true;
      return false;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async markAsRead(id: string): Promise<void> {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.read = true;
  }

  async markAllAsRead(userId?: string): Promise<void> {
    this.notifications.forEach(n => {
      if (!userId || n.targetUserId === userId || !n.targetUserId) {
        n.read = true;
      }
    });
  }

  async getDispatchedLogs(): Promise<DispatchedNotification[]> {
    return [...this.dispatches].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async dispatchNotification(params: {
    event: NotificationEventType;
    title: string;
    message: string;
    referenceId?: string;
    recipientName?: string;
    recipientEmail?: string;
    recipientPhone?: string;
    targetRole?: UserRole | 'ALL';
    targetUserId?: string;
  }): Promise<DispatchedNotification> {
    const notifId = generateId('notif');
    const dispId = generateId('disp');
    const now = new Date().toISOString();

    const name = params.recipientName || 'Valued Customer';
    const email = params.recipientEmail || 'customer@riva.retail';
    const phone = params.recipientPhone || '+91 98765 00000';

    // 1. In-App Notification Record
    const inAppNotif: AppNotification = {
      id: notifId,
      type: params.event,
      title: params.title,
      message: params.message,
      timestamp: now,
      read: false,
      targetRole: params.targetRole || 'ALL',
      targetUserId: params.targetUserId,
      referenceId: params.referenceId,
      actionUrl: params.targetRole === 'STAFF' ? '/staff/tickets' : '/customer/returns'
    };
    this.notifications.unshift(inAppNotif);

    // 2. Multi-channel Dispatched Log
    const dispatch: DispatchedNotification = {
      id: dispId,
      event: params.event,
      title: params.title,
      timestamp: now,
      referenceId: params.referenceId,
      channels: {
        inApp: {
          status: 'DELIVERED',
          preview: params.message
        },
        email: {
          status: 'SIMULATED (Demo Mode)',
          recipient: email,
          subject: `RIVA In-Store Retail: ${params.title}`,
          body: `Hello ${name},\n\n${params.message}\n\nReference ID: ${params.referenceId || 'N/A'}\n\nThank you for shopping with RIVA Supermarket.`,
          provider: 'Mock Email Provider (Local Demo)'
        },
        sms: {
          status: 'SIMULATED (Demo Mode)',
          phoneNumber: phone,
          message: `RIVA: ${params.title}. ${params.message.slice(0, 100)} Ref: ${params.referenceId || 'N/A'}`,
          provider: 'Mock SMS Gateway (Local Demo)'
        },
        whatsapp: {
          status: 'SIMULATED (Demo Mode)',
          recipient: phone,
          message: `🛒 *RIVA Assistant Notification*\n*${params.title}*\n\n${params.message}\n\n📋 Reference: \`${params.referenceId || 'N/A'}\`\n⏱ ${new Date().toLocaleTimeString()}`,
          provider: 'Mock WhatsApp Business API (Local Demo)'
        }
      }
    };
    this.dispatches.unshift(dispatch);

    // 3. Audit Log
    await auditService.logEvent({
      userId: params.targetUserId || 'system',
      userName: name,
      role: params.targetRole === 'STAFF' ? 'STAFF' : 'CUSTOMER',
      action: 'NOTIFICATION_SIMULATED',
      entity: 'NOTIFICATION',
      entityId: dispId,
      details: `Dispatched ${params.event} via In-App, Email (Simulated), SMS (Simulated), WhatsApp (Simulated). Ref: ${params.referenceId || 'N/A'}`
    });

    return dispatch;
  }
}

export const notificationService = new MockNotificationService();

// ==========================================
// 3. PRODUCT SERVICE
// ==========================================
export class MockProductService implements IProductService {
  private products: Product[] = [...MOCK_PRODUCTS];

  async getAllProducts(): Promise<Product[]> {
    return [...this.products];
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.products.find(p => p.id === id || p.productId === id) || null;
  }

  async getProductByName(name: string): Promise<Product | null> {
    const q = normalizeText(name);
    return this.products.find(p => {
      const pName = normalizeText(p.name);
      return pName.includes(q) || q.includes(pName) || (p.brand && q.includes(normalizeText(p.brand)));
    }) || null;
  }

  async searchProducts(query: string, category?: string): Promise<Product[]> {
    const q = normalizeText(query);
    return this.products.filter(p => {
      const matchesQuery = !q || 
        normalizeText(p.name).includes(q) || 
        normalizeText(p.brand).includes(q) || 
        normalizeText(p.category).includes(q) ||
        p.tags.some(t => normalizeText(t).includes(q)) ||
        normalizeText(p.location.aisle).includes(q);
      
      const matchesCat = !category || category === 'ALL' || p.category === category;
      return matchesQuery && matchesCat;
    });
  }

  async getProductsByCategory(category: ProductCategory): Promise<Product[]> {
    return this.products.filter(p => p.category === category);
  }

  async createProduct(product: Omit<Product, 'id' | 'productId'>): Promise<Product> {
    const newId = generateId('prod');
    const newProduct: Product = { 
      ...product, 
      id: newId, 
      productId: newId,
      stockQuantity: product.stockQuantity ?? 10,
      reorderLevel: product.reorderLevel ?? 5,
      returnWindowDays: product.returnWindowDays ?? 7,
      lastUpdated: new Date().toISOString()
    };
    this.products.unshift(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const index = this.products.findIndex(p => p.id === id || p.productId === id);
    if (index === -1) throw new Error('Product not found');
    this.products[index] = { ...this.products[index], ...updates };
    return this.products[index];
  }
}

export const productService = new MockProductService();

// ==========================================
// 4. INVENTORY SERVICE
// ==========================================
export class MockInventoryService implements IInventoryService {
  private inventory: InventoryItem[] = [...MOCK_INVENTORY];
  private activityLogs: InventoryActivityLog[] = [...INITIAL_ACTIVITY_LOGS];

  async getAllInventory(): Promise<InventoryItem[]> {
    return [...this.inventory];
  }

  async getInventoryByProductId(productId: string): Promise<InventoryItem | null> {
    return this.inventory.find(i => i.productId === productId || i.id === productId) || null;
  }

  async getProductByName(name: string): Promise<{ product: Product | null; inventory: InventoryItem | null }> {
    const q = normalizeText(name);
    const prod = MOCK_PRODUCTS.find(p => {
      const pName = normalizeText(p.name);
      return pName.includes(q) || q.includes(pName) || p.tags.some(t => normalizeText(t).includes(q));
    }) || null;

    if (!prod) return { product: null, inventory: null };

    const inv = this.inventory.find(i => i.productId === prod.id) || null;
    return { product: prod, inventory: inv };
  }

  async searchProducts(query: string): Promise<{ product: Product; inventory: InventoryItem }[]> {
    const q = normalizeText(query);
    const results: { product: Product; inventory: InventoryItem }[] = [];

    for (const prod of MOCK_PRODUCTS) {
      const pName = normalizeText(prod.name);
      const pBrand = normalizeText(prod.brand);
      const isMatch = !q || pName.includes(q) || pBrand.includes(q) || prod.tags.some(t => normalizeText(t).includes(q));

      if (isMatch) {
        const inv = this.inventory.find(i => i.productId === prod.id) || {
          id: `inv-${prod.id}`,
          productId: prod.id,
          name: prod.name,
          category: prod.category,
          brand: prod.brand,
          price: prod.price,
          storeId: prod.storeId,
          quantity: prod.stockQuantity,
          stockQuantity: prod.stockQuantity,
          minThreshold: prod.reorderLevel,
          reorderLevel: prod.reorderLevel,
          available: prod.stockQuantity > 0,
          aisle: prod.aisle,
          shelf: prod.shelf,
          location: prod.location,
          lastUpdated: prod.lastUpdated,
          returnWindowDays: prod.returnWindowDays,
          status: getStockStatus(prod.stockQuantity, prod.reorderLevel)
        };
        results.push({ product: prod, inventory: inv });
      }
    }
    return results;
  }

  async checkStock(productIdOrName: string): Promise<{
    productName: string;
    available: boolean;
    quantity: number;
    reorderLevel: number;
    status: StockStatus;
    item?: InventoryItem;
  }> {
    const q = normalizeText(productIdOrName);
    const item = this.inventory.find(i => 
      i.productId === productIdOrName || 
      i.id === productIdOrName || 
      normalizeText(i.name).includes(q) ||
      q.includes(normalizeText(i.name)) ||
      (i.brand && q.includes(normalizeText(i.brand)))
    );

    if (!item) {
      const prod = MOCK_PRODUCTS.find(p => 
        p.id === productIdOrName || 
        p.productId === productIdOrName || 
        normalizeText(p.name).includes(q) ||
        q.includes(normalizeText(p.name))
      );

      if (prod) {
        const status = getStockStatus(prod.stockQuantity, prod.reorderLevel);
        return {
          productName: prod.name,
          available: prod.stockQuantity > 0,
          quantity: prod.stockQuantity,
          reorderLevel: prod.reorderLevel,
          status,
        };
      }

      return {
        productName: productIdOrName,
        available: false,
        quantity: 0,
        reorderLevel: 0,
        status: 'OUT_STOCK',
      };
    }

    return {
      productName: item.name,
      available: item.quantity > 0,
      quantity: item.quantity,
      reorderLevel: item.reorderLevel,
      status: item.status,
      item,
    };
  }

  async getProductLocation(productIdOrName: string): Promise<{
    found: boolean;
    productName: string;
    aisle: string;
    shelf: string;
    section?: string;
  }> {
    const q = normalizeText(productIdOrName);
    const item = this.inventory.find(i => 
      i.productId === productIdOrName || 
      i.id === productIdOrName || 
      normalizeText(i.name).includes(q) ||
      q.includes(normalizeText(i.name))
    );

    if (item) {
      return {
        found: true,
        productName: item.name,
        aisle: item.aisle || item.location?.aisle || 'Aisle 1',
        shelf: item.shelf || item.location?.shelf || 'Shelf A1',
        section: item.location?.section,
      };
    }

    const prod = MOCK_PRODUCTS.find(p => 
      p.id === productIdOrName || 
      normalizeText(p.name).includes(q) ||
      q.includes(normalizeText(p.name))
    );

    if (prod) {
      return {
        found: true,
        productName: prod.name,
        aisle: prod.aisle || prod.location?.aisle || 'Aisle 1',
        shelf: prod.shelf || prod.location?.shelf || 'Shelf A1',
        section: prod.location?.section,
      };
    }

    return {
      found: false,
      productName: productIdOrName,
      aisle: 'Customer Desk',
      shelf: 'Inquiry Counter',
    };
  }

  async updateStock(productId: string, newQuantity: number, reason: InventoryActivityLog['reason'] = 'Manual update'): Promise<{
    item: InventoryItem;
    log: InventoryActivityLog;
  }> {
    let index = this.inventory.findIndex(i => i.productId === productId || i.id === productId);
    let item: InventoryItem;

    if (index === -1) {
      const prod = MOCK_PRODUCTS.find(p => p.id === productId || p.productId === productId);
      if (!prod) throw new Error('Product not found in inventory or catalog');
      item = {
        id: `inv-${prod.id}`,
        productId: prod.id,
        name: prod.name,
        category: prod.category,
        brand: prod.brand,
        price: prod.price,
        storeId: prod.storeId,
        quantity: newQuantity,
        stockQuantity: newQuantity,
        minThreshold: prod.reorderLevel,
        reorderLevel: prod.reorderLevel,
        available: newQuantity > 0,
        aisle: prod.aisle,
        shelf: prod.shelf,
        location: prod.location,
        lastUpdated: new Date().toISOString(),
        returnWindowDays: prod.returnWindowDays,
        status: getStockStatus(newQuantity, prod.reorderLevel)
      };
      this.inventory.unshift(item);
      index = 0;
    } else {
      const prevQty = this.inventory[index].quantity;
      const status = getStockStatus(newQuantity, this.inventory[index].reorderLevel);

      this.inventory[index] = {
        ...this.inventory[index],
        quantity: newQuantity,
        stockQuantity: newQuantity,
        available: newQuantity > 0,
        status,
        lastUpdated: new Date().toISOString(),
      };
      item = this.inventory[index];

      const log: InventoryActivityLog = {
        id: generateId('act'),
        timestamp: new Date().toISOString(),
        productId: item.productId,
        productName: item.name,
        previousQuantity: prevQty,
        newQuantity,
        reason,
        updatedBy: 'RIVA Autonomous Engine',
      };
      this.activityLogs.unshift(log);

      await auditService.logEvent({
        userId: 'system',
        userName: 'RIVA Inventory Engine',
        role: 'STAFF',
        action: 'INVENTORY_MUTATION',
        entity: 'INVENTORY',
        entityId: item.productId,
        details: `Stock updated for ${item.name}: ${prevQty} -> ${newQuantity} units. Reason: ${reason}. Status: ${status}`
      });

      // Unified notifications on stock threshold triggers
      if (newQuantity === 0) {
        await notificationService.dispatchNotification({
          event: 'OUT_OF_STOCK_ALERT',
          title: `Out of Stock: ${item.name}`,
          message: `${item.name} is now OUT OF STOCK in ${item.aisle}, ${item.shelf}. Immediate restock advised.`,
          referenceId: item.productId,
          targetRole: 'STAFF'
        });
      } else if (newQuantity <= item.reorderLevel) {
        await notificationService.dispatchNotification({
          event: 'LOW_STOCK_ALERT',
          title: `Low Stock: ${item.name}`,
          message: `${item.name} has only ${newQuantity} units left (threshold is ${item.reorderLevel}).`,
          referenceId: item.productId,
          targetRole: 'STAFF'
        });
      }

      return { item, log };
    }

    const log: InventoryActivityLog = {
      id: generateId('act'),
      timestamp: new Date().toISOString(),
      productId: item.productId,
      productName: item.name,
      previousQuantity: 0,
      newQuantity,
      reason,
      updatedBy: 'RIVA Autonomous Engine',
    };
    this.activityLogs.unshift(log);

    return { item, log };
  }

  async getLowStockProducts(): Promise<InventoryItem[]> {
    return this.inventory.filter(i => i.status === 'LOW_STOCK');
  }

  async getOutOfStockProducts(): Promise<InventoryItem[]> {
    return this.inventory.filter(i => i.status === 'OUT_STOCK');
  }

  async getInventoryStats(): Promise<InventoryStats> {
    const totalProducts = this.inventory.length;
    const totalUnits = this.inventory.reduce((acc, curr) => acc + curr.quantity, 0);
    const lowStockCount = this.inventory.filter(i => i.status === 'LOW_STOCK').length;
    const outOfStockCount = this.inventory.filter(i => i.status === 'OUT_STOCK').length;

    return { totalProducts, totalUnits, lowStockCount, outOfStockCount };
  }

  async getInventoryActivityLogs(): Promise<InventoryActivityLog[]> {
    return [...this.activityLogs];
  }

  async resetInventory(): Promise<void> {
    this.inventory = [...MOCK_INVENTORY];
  }
}

export const inventoryService = new MockInventoryService();

// ==========================================
// 5. POLICY SERVICE
// ==========================================
export class MockPolicyService implements IPolicyService {
  private policies: ReturnPolicy[] = [...MOCK_POLICIES];

  async getAllPolicies(): Promise<ReturnPolicy[]> {
    return [...this.policies];
  }

  async getPolicyByCategory(category: ProductCategory | string): Promise<ReturnPolicy | null> {
    return this.policies.find(p => p.category === category) || null;
  }

  async evaluateEligibility(params: {
    productId: string;
    productCategory: ProductCategory;
    purchaseDate: string;
    price: number;
    isOpened: boolean;
    hasReceipt: boolean;
    reason: string;
  }): Promise<{
    eligibility: EligibilityStatus;
    reasonText: string;
    autoApprovable: boolean;
    suggestedAction: 'AUTO_APPROVE' | 'ESCALATE_TO_STAFF' | 'REJECT';
  }> {
    const policy = await this.getPolicyByCategory(params.productCategory);
    if (!policy) {
      return {
        eligibility: 'REQUIRES_STAFF_REVIEW',
        reasonText: 'No specific category policy rule found; routed for staff appraisal.',
        autoApprovable: false,
        suggestedAction: 'ESCALATE_TO_STAFF',
      };
    }

    const purchase = new Date(params.purchaseDate);
    const now = new Date();
    const daysSincePurchase = (now.getTime() - purchase.getTime()) / (1000 * 3600 * 24);

    // Rule 1: Window check
    if (Math.floor(daysSincePurchase) > policy.windowDays) {
      return {
        eligibility: 'INELIGIBLE',
        reasonText: `Return window expired (${Math.floor(daysSincePurchase)} days elapsed, limit is ${policy.windowDays} day(s) for ${policy.category}).`,
        autoApprovable: false,
        suggestedAction: 'REJECT',
      };
    }

    // Rule 2: Unsealed Personal Care / Oral Care exception
    if (
      (params.productCategory === 'Personal Care' || params.productCategory === 'Oral Care') && 
      params.isOpened && 
      !params.reason.toLowerCase().includes('defect') && 
      !params.reason.toLowerCase().includes('leak')
    ) {
      return {
        eligibility: 'REQUIRES_STAFF_REVIEW',
        reasonText: 'Opened personal care or hygiene products require store manager inspection as per health and hygiene regulations.',
        autoApprovable: false,
        suggestedAction: 'ESCALATE_TO_STAFF',
      };
    }

    // Rule 3: Autonomous Approval Threshold
    if (params.price <= policy.autoApprovalLimit && params.hasReceipt) {
      return {
        eligibility: 'ELIGIBLE_AUTO',
        reasonText: `Autonomous approval granted: within ${policy.windowDays}-day return window and amount ₹${params.price} is within autonomous limit ₹${policy.autoApprovalLimit}.`,
        autoApprovable: true,
        suggestedAction: 'AUTO_APPROVE',
      };
    }

    // Rule 4: High value exceeding auto threshold
    if (params.price > policy.autoApprovalLimit) {
      return {
        eligibility: 'REQUIRES_STAFF_REVIEW',
        reasonText: `Amount ₹${params.price} exceeds autonomous bot limit (₹${policy.autoApprovalLimit}). Escalated to customer desk for high-value authorization.`,
        autoApprovable: false,
        suggestedAction: 'ESCALATE_TO_STAFF',
      };
    }

    return {
      eligibility: 'ELIGIBLE_AUTO',
      reasonText: 'Standard return policy criteria satisfied.',
      autoApprovable: true,
      suggestedAction: 'AUTO_APPROVE',
    };
  }
}

export const policyService = new MockPolicyService();

// ==========================================
// 6. TICKET SERVICE
// ==========================================
export class MockTicketService implements ITicketService {
  private tickets: SupportTicket[] = [...MOCK_TICKETS];

  async getAllTickets(): Promise<SupportTicket[]> {
    return [...this.tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTicketById(id: string): Promise<SupportTicket | null> {
    return this.tickets.find(t => t.id === id) || null;
  }

  async getTicketsByCustomer(customerId: string): Promise<SupportTicket[]> {
    return this.tickets.filter(t => t.customerId === customerId);
  }

  async createTicket(data: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupportTicket> {
    const newTicket: SupportTicket = {
      ...data,
      id: generateId('tkt'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tickets.unshift(newTicket);

    await auditService.logEvent({
      userId: data.customerId || 'system',
      userName: data.customerName || 'Customer',
      role: 'CUSTOMER',
      action: 'RIVA_ESCALATION_CREATED',
      entity: 'TICKET',
      entityId: newTicket.id,
      details: `Support ticket ${newTicket.id} created (${newTicket.priority}): "${newTicket.title}"`,
    });

    // Notify staff
    await notificationService.dispatchNotification({
      event: 'STAFF_ESCALATION',
      title: `New Staff Escalation: ${newTicket.title}`,
      message: `Ticket ${newTicket.id} opened for ${newTicket.customerName || 'customer'}. Priority: ${newTicket.priority}`,
      referenceId: newTicket.id,
      targetRole: 'STAFF'
    });

    return newTicket;
  }

  async updateTicketStatus(id: string, status: SupportTicket['status'], assignedStaffId?: string): Promise<SupportTicket> {
    const index = this.tickets.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Ticket not found');

    this.tickets[index] = {
      ...this.tickets[index],
      status,
      assignedStaffId: assignedStaffId || this.tickets[index].assignedStaffId,
      assignedStaffName: assignedStaffId ? 'Vikram Malhotra (Duty Mgr)' : this.tickets[index].assignedStaffName,
      updatedAt: new Date().toISOString(),
    };

    return this.tickets[index];
  }
}

export const ticketService = new MockTicketService();

// ==========================================
// 7. RETURN SERVICE
// ==========================================
export class MockReturnService implements IReturnService {
  private returns: ReturnRequest[] = [...MOCK_RETURNS];

  async getAllReturns(): Promise<ReturnRequest[]> {
    return [...this.returns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getReturnById(id: string): Promise<ReturnRequest | null> {
    return this.returns.find(r => r.id === id) || null;
  }

  async getReturnsByCustomerId(customerId: string): Promise<ReturnRequest[]> {
    return this.returns.filter(r => r.customerId === customerId);
  }

  async createReturnRequest(data: Omit<ReturnRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'eligibility'> & { isOpened?: boolean; hasReceipt?: boolean }): Promise<ReturnRequest> {
    const product = MOCK_PRODUCTS.find(p => p.id === data.productId || p.productId === data.productId);
    const category = product ? product.category : 'Grocery & Staples';

    const evaluation = await policyService.evaluateEligibility({
      productId: data.productId,
      productCategory: category,
      purchaseDate: data.purchaseDate,
      price: data.amount ?? data.price ?? 0,
      isOpened: data.isOpened ?? false,
      hasReceipt: data.hasReceipt ?? true,
      reason: data.reason
    });

    const returnId = generateId('ret');
    let ticketId: string | undefined;

    let finalStatus: ReturnRequest['status'] = 'PENDING';
    if (evaluation.suggestedAction === 'AUTO_APPROVE') {
      finalStatus = 'AUTO_APPROVED';
    } else if (evaluation.suggestedAction === 'ESCALATE_TO_STAFF') {
      finalStatus = 'MANUAL_REVIEW';
      const ticket = await ticketService.createTicket({
        customerId: data.customerId,
        customerName: data.customerName,
        customerContact: data.customerPhone,
        type: 'RETURN_DISPUTE',
        priority: (data.amount ?? data.price ?? 0) > 500 ? 'HIGH' : 'MEDIUM',
        status: 'OPEN',
        title: `Return Review Required: ${data.productName}`,
        description: `Customer submitted return request ${returnId}. AI Policy Decision: ${evaluation.reasonText}. Customer reason: "${data.reason}"`,
        source: 'ESCALATED',
        relatedEntityId: returnId,
      });
      ticketId = ticket.id;
    } else {
      finalStatus = 'REJECTED';
    }

    const newReturn: ReturnRequest = {
      id: returnId,
      customerId: data.customerId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      productId: data.productId,
      productName: data.productName,
      orderId: data.orderId,
      purchaseDate: data.purchaseDate,
      amount: data.amount,
      reason: data.reason,
      status: finalStatus,
      eligibility: evaluation.eligibility,
      resolutionType: data.resolutionType,
      exchangeProductId: data.exchangeProductId,
      exchangeProductName: data.exchangeProductName,
      notes: evaluation.reasonText,
      ticketId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.returns.unshift(newReturn);

    // Audit Logging
    await auditService.logEvent({
      userId: data.customerId,
      userName: data.customerName,
      role: 'CUSTOMER',
      action: finalStatus === 'AUTO_APPROVED' ? 'RIVA_RETURN_CREATED' : 'RIVA_ESCALATION_CREATED',
      entity: 'RETURN',
      entityId: returnId,
      details: `Return request ${returnId} for ${data.productName} (₹${data.amount}) evaluated as ${finalStatus}. Resolution: ${data.resolutionType}. Note: ${evaluation.reasonText}`,
    });

    // Multi-channel Notifications
    if (finalStatus === 'AUTO_APPROVED') {
      await notificationService.dispatchNotification({
        event: data.resolutionType === 'EXCHANGE' ? 'EXCHANGE_APPROVED' : 'RETURN_APPROVED',
        title: `${data.resolutionType === 'EXCHANGE' ? 'Exchange' : 'Return'} Approved: ${data.productName}`,
        message: `Your request ${returnId} for ${data.productName} (₹${data.amount}) was auto-approved. Instant credit / voucher code generated.`,
        referenceId: returnId,
        recipientName: data.customerName,
        recipientPhone: data.customerPhone,
        targetRole: 'CUSTOMER',
        targetUserId: data.customerId
      });
    } else {
      await notificationService.dispatchNotification({
        event: 'RETURN_ESCALATED',
        title: `Return Escalated for Staff Review: ${data.productName}`,
        message: `Request ${returnId} has been sent to our store manager for manual review. Ticket: ${ticketId || 'Pending'}.`,
        referenceId: returnId,
        recipientName: data.customerName,
        recipientPhone: data.customerPhone,
        targetRole: 'CUSTOMER',
        targetUserId: data.customerId
      });
    }

    return newReturn;
  }

  async updateReturnStatus(id: string, status: ReturnRequest['status'], notes?: string): Promise<ReturnRequest> {
    const index = this.returns.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Return request not found');
    this.returns[index] = {
      ...this.returns[index],
      status,
      notes: notes || this.returns[index].notes,
      updatedAt: new Date().toISOString(),
    };
    return this.returns[index];
  }
}

export const returnService = new MockReturnService();

// ==========================================
// 8. AUTH SERVICE
// ==========================================
export class MockAuthService implements IAuthService {
  private currentUser: User = DEMO_USERS.customer;

  async getCurrentUser(): Promise<User | null> {
    return { ...this.currentUser };
  }

  async login(email: string, role?: UserRole): Promise<User> {
    const userList: User[] = Object.values(DEMO_USERS);
    const found = userList.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      this.currentUser = { ...found };
      return this.currentUser;
    }

    const newUser: User = {
      id: generateId('usr'),
      name: email.split('@')[0],
      email,
      role: role || 'CUSTOMER',
      createdAt: new Date().toISOString(),
    };
    this.currentUser = newUser;
    return this.currentUser;
  }

  async signup(name: string, email: string, role?: UserRole): Promise<User> {
    const newUser: User = {
      id: generateId('usr'),
      name,
      email,
      role: role || 'CUSTOMER',
      createdAt: new Date().toISOString(),
    };
    this.currentUser = newUser;
    return this.currentUser;
  }

  async logout(): Promise<void> {
    this.currentUser = DEMO_USERS.customer;
  }

  async switchPersona(role: UserRole): Promise<User> {
    const userList: User[] = Object.values(DEMO_USERS);
    const user = userList.find((u: User) => u.role === role) || DEMO_USERS.customer;
    this.currentUser = { ...user };
    return this.currentUser;
  }
}

export const authService = new MockAuthService();

// ==========================================
// 9. NLP RETRIEVAL & AI DECISION ENGINE
// ==========================================
export class MockRetrievalService implements IRetrievalService {

  classifyIntent(query: string, previousProduct?: Product | null, context?: ConversationContext): UserIntent {
    const q = query.toLowerCase().trim();
    const normalizedQ = normalizeText(q);

    // Context product resolution
    const prevProd = previousProduct || context?.lastProduct || null;

    // 1. Greetings
    if (
      q === 'hi' || 
      q === 'hello' || 
      q === 'hey' || 
      q === 'namaste' || 
      q.startsWith('hi ') || 
      q.startsWith('hello ') || 
      q.startsWith('hey ') ||
      q.includes('good morning') ||
      q.includes('good afternoon') ||
      q.includes('good evening')
    ) {
      return 'GREETING';
    }

    // 1b. Thanks & Goodbye
    if (
      q === 'thanks' || q === 'thank you' || q === 'thank u' || q === 'ty' ||
      q.startsWith('thank') || q.includes('thank you') || q.includes('thanks a lot') ||
      q.includes('that helped') || q.includes('that\'s helpful')
    ) {
      return 'THANKS';
    }

    if (
      q === 'bye' || q === 'goodbye' || q === 'see you' || q === 'cya' ||
      q === 'ok bye' || q === 'ok thanks' || q === 'okay bye' ||
      q.startsWith('bye') || q.startsWith('goodbye') ||
      q.includes('see you later') || q.includes('see ya')
    ) {
      return 'GOODBYE';
    }

    // 1b-2. Early General Conversation / Domain Knowledge check
    // Must be before greedy keyword matching so questions like
    // "What does FMCG mean?", "Explain dairy products", "Suggest snacks for a party"
    // are answered as general knowledge rather than misclassified.
    if (isGeneralConversationQuery(q)) {
      return 'GENERAL_CONVERSATION';
    }

    // 1c. Product Comparison (guard: exclude pure domain comparisons like 'difference between milk and curd')
    const isDomainComparison = (
      (q.includes('difference between milk and curd') || q.includes('milk vs curd') || q.includes('curd vs milk')) ||
      (q.includes('difference between') && !hasMentionOf(['amul','tata','britannia','parle','maggi','lay','kurkure','haldiram','nescafe','red label','fortune','aashirvaad','dove','dettol','colgate','surf'], q))
    );

    if (!isDomainComparison && (
      q.includes('compare') ||
      q.includes('difference between') ||
      q.includes('vs') ||
      q.includes('versus') ||
      q.includes('which is better') ||
      q.includes('better between') ||
      (q.includes('or') && q.includes('which') && hasMentionOf(['amul','tata','britannia','parle','maggi','lay','kurkure','haldiram','nescafe','red label','fortune','aashirvaad'], q))
    )) {
      return 'PRODUCT_COMPARISON';
    }

    // 1d. Cart & E-Commerce Intents
    if (
      q.includes('add to cart') ||
      q.includes('add to my cart') ||
      q.includes('buy this') ||
      q.includes('put in cart') ||
      (q.startsWith('add ') && (q.includes('cart') || q.includes('basket')))
    ) {
      return 'ADD_TO_CART';
    }

    if (
      q === 'cart' ||
      q === 'view cart' ||
      q === 'show cart' ||
      q === 'my cart' ||
      q.includes('view my cart') ||
      q.includes('show my cart') ||
      q.includes('what is in my cart') ||
      q.includes('open cart')
    ) {
      return 'SHOW_CART';
    }

    if (
      q.includes('checkout') ||
      q.includes('proceed to checkout') ||
      q.includes('pay for cart')
    ) {
      return 'CHECKOUT';
    }

    if (
      q.includes('track my order') ||
      q.includes('track order') ||
      q.includes('where is my order') ||
      q.includes('my orders') ||
      (q.includes('order status') && !q.includes('return'))
    ) {
      return 'ORDER_STATUS';
    }

    // 2. Return Status / Refund Lookup
    if (
      q.includes('return status') ||
      q.includes('status of my return') ||
      q.includes('check my return') ||
      q.includes('track return') ||
      q.includes('track my return') ||
      q.includes('where is my refund')
    ) {
      return 'RETURN_STATUS';
    }

    // 3. Start Return / Start Exchange explicit triggers
    if (
      q === 'start a return' ||
      q === 'start return' ||
      q.startsWith('start a return') ||
      q.startsWith('start return') ||
      q.includes('initiate return') ||
      q.includes('i want to return')
    ) {
      return 'START_RETURN';
    }

    if (
      q === 'start an exchange' ||
      q === 'start exchange' ||
      q.startsWith('start an exchange') ||
      q.startsWith('start exchange') ||
      q.includes('initiate exchange') ||
      q.includes('i want to exchange')
    ) {
      return 'START_EXCHANGE';
    }

    // 4. Product Conditions (Spoiled / Damaged / Expired / Opened)
    if (q.includes('spoiled') || q.includes('curdled') || q.includes('sour milk') || q.includes('rotten')) {
      return 'SPOILED_PRODUCT';
    }

    if (q.includes('damaged') || q.includes('broken') || q.includes('leaking nozzle') || q.includes('defective product') || q.includes('cracked')) {
      return 'DAMAGED_PRODUCT';
    }

    if (q.includes('expired') || q.includes('past expiry') || q.includes('past date')) {
      return 'EXPIRED_PRODUCT';
    }

    if (q.includes('opened') || q.includes('unsealed') || q.includes('broken seal')) {
      return 'OPENED_PRODUCT';
    }

    // 5. Product Recommendations & Smart Inquiries
    if (q.includes('cheapest milk') || q.includes('lowest price milk') || q.includes('cheapest')) {
      return 'CHEAPEST_PRODUCT';
    }

    if (q.includes('cheaper alternative') || q.includes('cheaper option') || q.includes('alternatives')) {
      return 'ALTERNATIVE_SUGGESTION';
    }

    if (
      q.includes('suggest') || 
      q.includes('recommend') || 
      q.includes('what can i buy for breakfast') || 
      q.includes('breakfast ideas') ||
      q.includes('what should i buy') ||
      q.includes('for a party') ||
      q.includes('party snacks') ||
      q.includes('snacks for party')
    ) {
      return 'PRODUCT_RECOMMENDATION';
    }

    // 6. Help & Capabilities
    if (
      q === 'help' ||
      q.includes('what can you do') ||
      q.includes('how to use') ||
      (q.includes('what products') && !q.includes('dairy') && !q.includes('snack') && !q.includes('tata') && !q.includes('amul') && !q.includes('under') && !q.includes('in stock')) ||
      (q.includes('what do you have') && !q.includes('from') && !q.includes('amul') && !q.includes('tata') && !q.includes('dairy') && !q.includes('maggi'))
    ) {
      return 'HELP';
    }

    // 7. Low stock & Out of stock queries
    if (q.includes('out of stock') || q.includes('unavailable') || q.includes('empty shelf') || q.includes('which products are out')) {
      return 'OUT_OF_STOCK';
    }

    if (q.includes('low in stock') || q.includes('low stock') || q.includes('running out') || q.includes('almost finished')) {
      return 'LOW_STOCK';
    }

    // 8. Return & Exchange Policy / Eligibility Queries
    if (
      q.includes('can i return') || 
      q.includes('return policy') || 
      q.includes('policy on') || 
      q.includes('how many days to return') || 
      q.includes('return window') ||
      q.includes('is returnable') ||
      q.includes('eligible for return')
    ) {
      return 'RETURN_POLICY';
    }

    if (
      q.includes('can i exchange') || 
      q.includes('exchange policy') || 
      q.includes('exchange this') ||
      q.includes('swap item') || 
      q.includes('replace with')
    ) {
      return 'EXCHANGE_POLICY';
    }

    // 9. Price Check Queries
    if (
      q.includes('how much is') ||
      q.includes('how much for') ||
      q.includes('what is the price') ||
      q.includes('price of') ||
      q.includes('cost of') ||
      q.includes('rate of') ||
      q.includes('mrp of') ||
      q.includes('how much does it cost') ||
      (prevProd && (q === 'how much' || q === 'how much is it' || q === 'what is the price'))
    ) {
      return 'PRICE_CHECK';
    }

    // 10. Product Location / Wayfinding
    if (
      q.includes('where is') || 
      q.includes('where are') || 
      q.includes('where can i find') || 
      q.includes('location of') || 
      q.includes('which aisle') || 
      q.includes('which shelf') || 
      q.includes('which bay') || 
      q.includes('how to reach') || 
      q.includes('locate') ||
      q.includes('where to get') ||
      (prevProd && (q === 'where is it' || q === 'where is that' || q === 'which aisle'))
    ) {
      return 'PRODUCT_LOCATION';
    }

    // 11. Specific Quantity Check
    if (
      q.includes('how many') ||
      q.includes('units are left') ||
      q.includes('units are available') ||
      q.includes('packets are available') ||
      q.includes('packets are left') ||
      q.includes('how many units') ||
      q.includes('how many packets')
    ) {
      return 'STOCK_QUANTITY';
    }

    // 12. Stock Availability Queries
    if (
      q.includes('in stock') || 
      q.includes('is available') || 
      q.includes('available?') || 
      q.includes('available') || 
      q.includes('do you have') ||
      q.includes('stock of') || 
      q.includes('is there any') ||
      (prevProd && (q === 'is it available' || q === 'is it available?' || q === 'is it in stock' || q === 'is it in stock?'))
    ) {
      return 'STOCK_CHECK';
    }

    // 13. Budget / Multi-Constraint Product Search
    if (
      q.includes('under') ||
      q.includes('below') ||
      q.includes('above') ||
      q.includes('more than') ||
      q.includes('over') ||
      q.includes('less than') ||
      q.includes('cheap') ||
      q.includes('affordable') ||
      q.includes('aisle') ||
      q.includes('units')
    ) {
      return 'PRODUCT_SEARCH';
    }

    // 14. Category or Brand Search Queries
    const knownKeywords = [
      'dairy', 'milk', 'curd', 'paneer', 'butter', 'ghee',
      'snack', 'snacks', 'chip', 'chips', 'namkeen', 'chocolate',
      'biscuit', 'biscuits', 'cookie', 'cookies',
      'tea', 'coffee', 'chai',
      'beverage', 'beverages', 'juice', 'drink', 'drinks', 'cola',
      'instant', 'noodle', 'noodles', 'maggi', 'soup',
      'staple', 'staples', 'atta', 'flour', 'rice', 'dal', 'pulse', 'pulses', 'sugar', 'salt',
      'oil', 'oils', 'edible oil', 'sunflower', 'mustard',
      'spice', 'spices', 'masala', 'ketchup', 'pickle',
      'personal', 'shampoo', 'soap', 'lotion',
      'oral', 'toothpaste',
      'laundry', 'detergent',
      'cleaning', 'dishwash',
      'household', 'baby',
      'amul', 'tata', 'britannia', 'parle', 'lay', 'lays', 'kurkure', 'haldiram', 'haldirams',
      'aashirvaad', 'india gate', 'fortune', 'mother dairy', 'nandini', 'sunfeast', 'saffola',
      'nescafe', 'red label', 'real', 'maaza', 'colgate', 'dove', 'dettol', 'surf excel',
      'ariel', 'vim', 'harpic', 'lizol', 'good knight', 'pampers', 'cerelac', 'kwality'
    ];

    const hasMention = knownKeywords.some(k => q.includes(k));

    if (hasMention) {
      const isSearchOrListAction = (
        q.includes('search') ||
        q.includes('show') ||
        q.includes('list') ||
        q.includes('products') ||
        q.includes('items') ||
        q.includes('available') ||
        q.includes('what') ||
        q.includes('have') ||
        q.includes('from') ||
        q.includes('get') ||
        q.includes('find') ||
        q.includes('category') ||
        q.length <= 25
      );

      if (isSearchOrListAction && !q.includes('in stock') && !q.includes('where') && !q.includes('price')) {
        return 'CATEGORY_SEARCH';
      }
    }

    // 15. Generic Search Queries
    if (q.includes('search') || q.includes('show me products') || q.includes('show products')) {
      return 'PRODUCT_SEARCH';
    }

    // 16. General Retail Operations Query
    if (
      q.includes('timing') || 
      q.includes('open') || 
      q.includes('close') || 
      q.includes('hours') || 
      q.includes('payment') || 
      q.includes('upi') || 
      q.includes('card') || 
      q.includes('cash') || 
      q.includes('sodexo') || 
      q.includes('delivery') || 
      q.includes('trolley') || 
      q.includes('parking')
    ) {
      return 'GENERAL_RETAIL_QUERY';
    }

    // Pronoun context fallback
    if (prevProd && (q.includes('it') || q.includes('that') || q.includes('this') || q.includes('they'))) {
      if (q.includes('where')) return 'PRODUCT_LOCATION';
      if (q.includes('how many') || q.includes('left') || q.includes('quantity')) return 'STOCK_QUANTITY';
      if (q.includes('available') || q.includes('stock')) return 'STOCK_CHECK';
      if (q.includes('price') || q.includes('how much') || q.includes('cost')) return 'PRICE_CHECK';
      if (q.includes('exchange')) return 'EXCHANGE_POLICY';
      if (q.includes('return')) return 'RETURN_POLICY';
    }

    // Direct product mention fallback -> STOCK_CHECK if single product
    const matched = MOCK_PRODUCTS.some(p => {
      const pName = normalizeText(p.name);
      const shortName = normalizeText(p.name.split(' ').slice(0, 3).join(' '));
      return normalizedQ.includes(shortName);
    });

    if (matched) return 'STOCK_CHECK';
    if (hasMention) return 'CATEGORY_SEARCH';

    return 'UNKNOWN';
  }

  extractEntities(query: string, previousProduct?: Product | null, context?: ConversationContext): ExtractedEntities {
    const q = query.toLowerCase().trim();
    const entities: ExtractedEntities = {};
    const prevProd = previousProduct || context?.lastProduct || null;

    // Price Limit Max extraction (e.g. "under 100", "under ₹50", "below 200")
    const priceMaxMatch = query.match(/(?:under|below|less than)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i) || query.match(/(\d+)\s*(?:rs|rupees)?\s*or less/i);
    if (priceMaxMatch) {
      entities.priceLimit = parseInt(priceMaxMatch[1], 10);
    }

    // Price Limit Min extraction (e.g. "above 200", "more than 100", "over 150")
    const priceMinMatch = query.match(/(?:above|more than|over|greater than)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
    if (priceMinMatch) {
      entities.priceLimitMin = parseInt(priceMinMatch[1], 10);
    }

    // Min Quantity Constraint (e.g. "more than 20 units")
    const minQtyMatch = query.match(/more than\s*(\d+)\s*(?:units?|packets?|packs?|items?)?/i) || query.match(/greater than\s*(\d+)/i);
    if (minQtyMatch) {
      entities.minQuantity = parseInt(minQtyMatch[1], 10);
    }

    // Aisle constraint (e.g. "in aisle 3", "aisle 2")
    const aisleMatch = query.match(/aisle\s*(\d+|[a-z]+)/i);
    if (aisleMatch) {
      entities.aisle = `Aisle ${aisleMatch[1]}`;
    }

    // In Stock constraint
    if (q.includes('in stock') || q.includes('available')) {
      entities.inStockOnly = true;
    }

    // Order ID extraction
    const orderMatch = query.match(/\b(ORD-?\d{3,6})\b/i) || query.match(/#(\d{3,6})/);
    if (orderMatch) {
      const raw = orderMatch[1];
      entities.orderId = raw.toUpperCase().startsWith('ORD') ? raw.toUpperCase() : `ORD-${raw}`;
    }

    // Quantity extraction
    const qtyMatch = query.match(/(\d+)\s*(units?|packets?|packs?|bottles?|jars?|kg|gms?|litres?|pcs?|pieces?)?/i);
    if (qtyMatch && !priceMaxMatch && !priceMinMatch) {
      entities.quantity = parseInt(qtyMatch[1], 10);
    }

    // Condition flags
    if (q.includes('opened') || q.includes('unsealed') || q.includes('used') || q.includes('broken seal')) {
      entities.isOpened = true;
    } else if (q.includes('sealed') || q.includes('unopened') || q.includes('intact')) {
      entities.isOpened = false;
    }

    if (q.includes('damaged') || q.includes('broken') || q.includes('leaking') || q.includes('defect')) {
      entities.isDamaged = true;
      entities.reason = 'Damaged packaging / defective container';
    }

    if (q.includes('spoiled') || q.includes('curdled') || q.includes('sour') || q.includes('rotten')) {
      entities.isSpoiled = true;
      entities.reason = 'Perishable product spoiled upon opening';
    }

    if (q.includes('expired') || q.includes('past date') || q.includes('past expiry')) {
      entities.isExpired = true;
      entities.reason = 'Product past expiration date';
    }

    // Receipt Availability
    if (q.includes('without receipt') || q.includes('no invoice') || q.includes('no bill') || q.includes('lost receipt')) {
      entities.hasReceipt = false;
    } else {
      entities.hasReceipt = true;
    }

    // Purchase Date
    if (q.includes('yesterday')) {
      entities.purchaseDate = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    } else if (q.includes('today')) {
      entities.purchaseDate = new Date().toISOString();
    } else if (q.includes('2 days ago') || q.includes('two days ago')) {
      entities.purchaseDate = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
    } else if (q.includes('last week') || q.includes('10 days ago')) {
      entities.purchaseDate = new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString();
    }

    // Recommendation Topic
    if (q.includes('breakfast')) {
      entities.recommendationTopic = 'breakfast';
    } else if (q.includes('snack')) {
      entities.recommendationTopic = 'snacks';
    } else if (q.includes('cheapest')) {
      entities.recommendationTopic = 'cheapest';
    } else if (q.includes('alternative')) {
      entities.recommendationTopic = 'alternatives';
    }

    // Desired Resolution
    if (q.includes('exchange') || q.includes('swap') || q.includes('replace')) {
      entities.desiredResolution = 'EXCHANGE';
    } else if (q.includes('store credit') || q.includes('voucher')) {
      entities.desiredResolution = 'STORE_CREDIT';
    } else {
      entities.desiredResolution = 'REFUND';
    }

    // Brand Extraction
    const brandMap: Record<string, string> = {
      'amul': 'Amul',
      'tata': 'Tata',
      'britannia': 'Britannia',
      'parle': 'Parle',
      'maggi': 'Maggi',
      'lay': "Lay's",
      'lays': "Lay's",
      'kurkure': 'Kurkure',
      'haldiram': "Haldiram's",
      'haldirams': "Haldiram's",
      'aashirvaad': 'Aashirvaad',
      'india gate': 'India Gate',
      'fortune': 'Fortune',
      'mother dairy': 'Mother Dairy',
      'nandini': 'Nandini',
      'sunfeast': 'Sunfeast',
      'saffola': 'Saffola',
      'nescafe': 'Nescafe',
      'red label': 'Red Label',
      'real': 'Real',
      'maaza': 'Maaza',
      'colgate': 'Colgate',
      'dove': 'Dove',
      'dettol': 'Dettol',
      'surf excel': 'Surf Excel',
      'ariel': 'Ariel',
      'vim': 'Vim',
      'harpic': 'Harpic',
      'lizol': 'Lizol',
      'good knight': 'Good Knight',
      'pampers': 'Pampers',
      'cerelac': 'Cerelac',
      'kwality': "Kwality Walls"
    };

    for (const [key, val] of Object.entries(brandMap)) {
      if (q.includes(key)) {
        entities.brandName = val;
        break;
      }
    }

    // Category extraction
    if (q.includes('dairy') || q.includes('milk') || q.includes('curd') || q.includes('paneer') || q.includes('butter') || q.includes('ghee')) entities.category = 'Dairy';
    else if (q.includes('snack') || q.includes('chips') || q.includes('namkeen') || q.includes('chocolate')) entities.category = 'Snacks';
    else if (q.includes('biscuit') || q.includes('cookie') || q.includes('cookies')) entities.category = 'Biscuits & Cookies';
    else if (q.includes('tea') || q.includes('coffee') || q.includes('chai')) entities.category = 'Tea & Coffee';
    else if (q.includes('beverage') || q.includes('juice') || q.includes('drink') || q.includes('cola')) entities.category = 'Beverages';
    else if (q.includes('instant') || q.includes('noodles') || q.includes('maggi') || q.includes('soup')) entities.category = 'Instant Food';
    else if (q.includes('atta') || q.includes('flour') || q.includes('rice') || q.includes('dal') || q.includes('sugar') || q.includes('salt') || q.includes('staple') || q.includes('pulse')) entities.category = 'Grocery & Staples';
    else if (q.includes('oil') || q.includes('sunflower') || q.includes('mustard')) entities.category = 'Oils & Fats';
    else if (q.includes('spice') || q.includes('masala') || q.includes('ketchup') || q.includes('pickle')) entities.category = 'Spices & Condiments';
    else if (q.includes('personal') || q.includes('shampoo') || q.includes('soap') || q.includes('face wash') || q.includes('lotion')) entities.category = 'Personal Care';
    else if (q.includes('oral') || q.includes('toothpaste') || q.includes('toothbrush')) entities.category = 'Oral Care';
    else if (q.includes('laundry') || q.includes('detergent')) entities.category = 'Laundry';
    else if (q.includes('cleaning') || q.includes('dishwash')) entities.category = 'Home Cleaning';
    else if (q.includes('household')) entities.category = 'Household';
    else if (q.includes('baby') || q.includes('diaper')) entities.category = 'Baby Care';

    // Pronoun Reference
    const isPronounQuery = prevProd && (
      q === 'how much is it' ||
      q === 'how much is it?' ||
      q === 'how much' ||
      q === 'how many are there' ||
      q === 'how many are left' ||
      q === 'how many are left?' ||
      q === 'is it available' ||
      q === 'is it available?' ||
      q === 'is it in stock' ||
      q === 'is it in stock?' ||
      q === 'where is it' ||
      q === 'where is it?' ||
      q === 'where is that' ||
      q === 'can i return it' ||
      q === 'can i return it?' ||
      q === 'can i return that' ||
      q === 'can i exchange this' ||
      q === 'can i exchange this?' ||
      (q.split(' ').length <= 4 && (q.includes('it') || q.includes('there') || q.includes('that') || q.includes('this')))
    );

    if (isPronounQuery && prevProd) {
      entities.productName = prevProd.name;
      entities.brandName = prevProd.brand;
      entities.category = prevProd.category;
      return entities;
    }

    // Fuzzy Product Extraction from Catalog
    const normalizedQ = normalizeText(q);
    const stopWords = ['what', 'where', 'price', 'cost', 'rate', 'many', 'much', 'stock', 'available', 'show', 'product', 'items', 'item', 'packet', 'packets', 'unit', 'units', 'shelf', 'aisle', 'the', 'is', 'of', 'in', 'for', 'to', 'can', 'you', 'how', 'there', 'are', 'it', 'that', 'this', 'they', 'i', 'a', 'an', 'do', 'have', 'which', 'who', 'me', 'please'];
    const qTokens = normalizedQ.split(' ').filter(t => t.length > 1 && !stopWords.includes(t));

    // Priority 1: Match by tags
    for (const p of MOCK_PRODUCTS) {
      for (const t of p.tags) {
        const normTag = normalizeText(t);
        if (normTag.length > 2 && normalizedQ.includes(normTag)) {
          entities.productName = p.name;
          entities.brandName = p.brand;
          entities.category = p.category;
          break;
        }
      }
      if (entities.productName) break;
    }

    // Priority 2: Match by multi-token overlap
    if (!entities.productName && qTokens.length > 0) {
      let bestProd: Product | null = null;
      let maxScore = 0;

      for (const p of MOCK_PRODUCTS) {
        const pTokens = normalizeText(p.name).split(' ').concat(normalizeText(p.brand).split(' ')).concat(p.tags.map(t => normalizeText(t)));
        let score = 0;
        for (const qt of qTokens) {
          if (pTokens.some(pt => pt === qt || pt.includes(qt))) {
            score++;
          }
        }
        if (score > maxScore) {
          maxScore = score;
          bestProd = p;
        }
      }

      if (bestProd && maxScore >= 1) {
        entities.productName = bestProd.name;
        entities.brandName = bestProd.brand;
        entities.category = bestProd.category;
      }
    }

    // Fallback pronoun resolution
    if (!entities.productName && prevProd) {
      if (
        q.includes('it') || 
        q.includes('that') || 
        q.includes('this') || 
        q.includes('there') ||
        q.includes('how many') ||
        q.includes('where') ||
        q.includes('price') ||
        q.includes('return') ||
        q.includes('exchange')
      ) {
        entities.productName = prevProd.name;
        entities.brandName = prevProd.brand;
        entities.category = prevProd.category;
      }
    }

    // Clean category & brand for pure price limit search if no category/brand explicitly in query
    if (entities.priceLimit !== undefined || entities.priceLimitMin !== undefined) {
      const explicitCat = (
        q.includes('dairy') || q.includes('milk') || q.includes('snack') || q.includes('chips') ||
        q.includes('biscuit') || q.includes('cookie') || q.includes('tea') || q.includes('coffee') ||
        q.includes('beverage') || q.includes('juice') || q.includes('atta') || q.includes('flour') ||
        q.includes('rice') || q.includes('oil') || q.includes('spice') || q.includes('shampoo') || q.includes('soap')
      );
      if (!explicitCat) {
        delete entities.category;
      }

      const explicitBrand = Object.keys(brandMap).some(b => q.includes(b));
      if (!explicitBrand) {
        delete entities.brandName;
      }
    }

    return entities;
  }

  // ==========================================
  // CENTRAL processRivaQuery FUNCTION
  // ==========================================
  async processRivaQuery(
    message: string,
    conversationContext?: ConversationContext,
    userContext?: { customerId?: string; customerName?: string }
  ): Promise<ProcessRivaQueryResult> {
    const q = message.toLowerCase().trim();
    const normalizedQ = normalizeText(q);

    let previousProduct: Product | null = null;
    if (conversationContext?.lastProduct) {
      previousProduct = conversationContext.lastProduct;
    } else if (conversationContext?.lastProductId) {
      previousProduct = await productService.getProductById(conversationContext.lastProductId);
    }

    const intent = this.classifyIntent(message, previousProduct, conversationContext);
    const entities = this.extractEntities(message, previousProduct, conversationContext);

    const allProds = await productService.getAllProducts();
    const allInv = await inventoryService.getAllInventory();
    const allPolicies = await policyService.getAllPolicies();
    const allReturns = await returnService.getAllReturns();

    // Match candidate product
    let matchedProduct: Product | null = null;

    if (entities.productName) {
      const targetName = normalizeText(entities.productName);
      matchedProduct = allProds.find(p => {
        const pName = normalizeText(p.name);
        return pName === targetName || pName.includes(targetName) || targetName.includes(pName);
      }) || null;
    }

    if (!matchedProduct && previousProduct && (q.includes('it') || q.includes('that') || q.includes('this') || q.includes('there') || q.includes('how much') || q.includes('where') || q.includes('available'))) {
      matchedProduct = previousProduct;
    }

    const customerId = userContext?.customerId || 'usr-cust-101';
    const customerName = userContext?.customerName || 'Aarav Sharma';

    let answer = '';
    let action: AssistantActionPayload | undefined;
    let followUp: string[] = [];
    let matchedProductsList: Product[] = matchedProduct ? [matchedProduct] : [];
    let targetPolicy: ReturnPolicy | undefined;

    // -------------------------------------------------------------
    // INTENT: GREETING
    // -------------------------------------------------------------
    if (intent === 'GREETING') {
      answer = `Hi ${customerName.split(' ')[0]}! I'm RIVA, your intelligent in-store retail assistant.\n\nI can help you:\n• Check live stock & shelf quantities\n• Find exact aisle & shelf locations\n• Check prices & FMCG categories\n• Evaluate return/exchange policies & process instant returns.`;
      action = {
        type: 'GENERAL_INFO_CARD',
        data: { greeting: true },
        meta: { intent }
      };
      followUp = [
        'Is Amul milk available?',
        'Where is Tata Tea?',
        'Show me snacks under ₹100',
        'Can I return opened shampoo?'
      ];
    }

    // -------------------------------------------------------------
    // INTENT: HELP
    // -------------------------------------------------------------
    else if (intent === 'HELP') {
      answer = `We carry 250+ Indian FMCG supermarket products across:\n• **Dairy** (Amul, Mother Dairy, Nandini)\n• **Beverages & Tea/Coffee** (Tata Tea, Nescafe, Real Juice, Maaza)\n• **Snacks & Biscuits** (Haldiram's, Lay's, Kurkure, Parle-G, Britannia)\n• **Grocery & Staples** (Aashirvaad Atta, India Gate Rice, Tata Salt)\n• **Personal & Home Care** (Dove, Dettol, Surf Excel, Vim, Harpic)\n\nAsk me questions like *"Where is Aashirvaad Atta?"* or *"How many Maggi packets are available?"*`;
      action = {
        type: 'GENERAL_INFO_CARD',
        data: { help: true },
        meta: { intent }
      };
      followUp = [
        'Show me dairy products',
        'Show me snacks under ₹100',
        'Do you have Maggi?',
        'What is the return policy?'
      ];
    }

    // -------------------------------------------------------------
    // INTENT: PRICE_CHECK
    // -------------------------------------------------------------
    else if (intent === 'PRICE_CHECK') {
      if (matchedProduct) {
        const invItem = allInv.find(i => i.productId === matchedProduct!.id);
        const price = matchedProduct.price;
        const mrp = matchedProduct.mrp || price;
        const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

        answer = `${matchedProduct.name} is priced at **₹${price}** (${matchedProduct.unit}).${discount > 0 ? ` You save ${discount}% off MRP ₹${mrp}.` : ''}\n\nLocation: **${matchedProduct.aisle}, ${matchedProduct.shelf}**.`;
        
        action = {
          type: 'PRODUCT_CARD',
          data: {
            ...matchedProduct,
            stockQuantity: invItem?.quantity ?? matchedProduct.stockQuantity,
            available: (invItem?.quantity ?? matchedProduct.stockQuantity) > 0
          },
          meta: { intent, entities }
        };

        followUp = [
          `Is ${matchedProduct.name} available?`,
          `Where is ${matchedProduct.name}?`,
          `How many units are left?`
        ];
      } else {
        answer = `I couldn't find the product you asked about to check the price. Please mention an item like "Tata Tea", "Lay's", or "Amul milk".`;
        followUp = ['What is the price of Tata Tea?', 'What is the price of Lay\'s Magic Masala?', 'Show me products under ₹100'];
      }
    }

    // -------------------------------------------------------------
    // INTENT: PRODUCT_LOCATION
    // -------------------------------------------------------------
    else if (intent === 'PRODUCT_LOCATION') {
      if (matchedProduct) {
        const loc = matchedProduct.location;
        const invItem = allInv.find(i => i.productId === matchedProduct!.id);
        const qty = invItem?.quantity ?? matchedProduct.stockQuantity;

        answer = `${matchedProduct.name} is located in **${loc.aisle}**, **${loc.shelf}** (${loc.section || matchedProduct.category}).\n\nCurrent stock: **${qty > 0 ? `${qty} units in stock` : 'Currently out of stock'}** (Price: ₹${matchedProduct.price}).`;

        action = {
          type: 'LOCATION_CARD',
          data: {
            ...matchedProduct,
            stockQuantity: qty,
            available: qty > 0
          },
          meta: { intent, entities }
        };

        followUp = [
          `How many are left?`,
          `How much is it?`,
          `Can I return it?`
        ];
      } else {
        answer = `I couldn't locate that specific item in our catalog. You can check the main aisle signs at the entrance, or ask me for items like Amul milk, Tata Tea, or Aashirvaad Atta.`;
        followUp = ['Where is Tata Tea?', 'Where is Aashirvaad Atta?', 'Where is Amul milk?'];
      }
    }

    // -------------------------------------------------------------
    // INTENT: STOCK_QUANTITY & STOCK_CHECK
    // -------------------------------------------------------------
    else if (intent === 'STOCK_QUANTITY' || intent === 'STOCK_CHECK') {
      if (matchedProduct) {
        const invItem = allInv.find(i => i.productId === matchedProduct!.id);
        const qty = invItem?.quantity ?? matchedProduct.stockQuantity;
        const reorder = invItem?.reorderLevel ?? matchedProduct.reorderLevel;

        await auditService.logEvent({
          userId: customerId,
          userName: customerName,
          role: 'CUSTOMER',
          action: 'RIVA_STOCK_LOOKUP',
          entity: 'INVENTORY',
          entityId: matchedProduct.id,
          details: `Customer checked stock for ${matchedProduct.name}: ${qty} units`
        });

        if (qty === 0) {
          const alternatives = allProds
            .filter(p => p.category === matchedProduct!.category && p.id !== matchedProduct!.id && p.stockQuantity > 0)
            .slice(0, 3);

          answer = `${matchedProduct.name} is **currently out of stock**.\n\nHere are available alternatives in ${matchedProduct.category}:\n` +
            alternatives.map(a => `• **${a.name}** — ₹${a.price} (${a.stockQuantity} in stock in ${a.aisle})`).join('\n');

          action = {
            type: 'OUT_OF_STOCK_CARD',
            data: {
              ...matchedProduct,
              stockQuantity: 0,
              available: false
            },
            meta: { intent, entities, alternatives }
          };

          followUp = alternatives.map(a => `Where is ${a.name}?`);
        } else if (qty <= reorder) {
          answer = `${matchedProduct.name} is in stock. **${qty} units are currently available** (Low stock alert).\n\nLocation: **${matchedProduct.aisle}, ${matchedProduct.shelf}** (Price: ₹${matchedProduct.price}).`;
          
          action = {
            type: 'STOCK_CARD',
            data: {
              ...matchedProduct,
              stockQuantity: qty,
              available: true
            },
            meta: { intent, entities }
          };

          followUp = [
            `Where is ${matchedProduct.name}?`,
            `How much is it?`,
            `Can I return it?`
          ];
        } else {
          answer = `${matchedProduct.name} is in stock. **${qty} units are currently available**.\n\nLocation: **${matchedProduct.aisle}, ${matchedProduct.shelf}** (Price: ₹${matchedProduct.price}).`;
          
          action = {
            type: 'STOCK_CARD',
            data: {
              ...matchedProduct,
              stockQuantity: qty,
              available: true
            },
            meta: { intent, entities }
          };

          followUp = [
            `Where is ${matchedProduct.name}?`,
            `How much is it?`,
            `Can I return it?`
          ];
        }
      } else if (q.includes('maggi')) {
        const maggi = allProds.find(p => p.name.toLowerCase().includes('maggi')) || allProds[0];
        answer = `${maggi.name} is in stock. **${maggi.stockQuantity} units are currently available**.\n\nLocation: **${maggi.aisle}, ${maggi.shelf}** (Price: ₹${maggi.price}).`;
        matchedProductsList = [maggi];
        action = {
          type: 'STOCK_CARD',
          data: { ...maggi, available: true },
          meta: { intent }
        };
        followUp = [`Where is ${maggi.name}?`, `How much is it?`];
      } else {
        answer = `I couldn't find that product in our store inventory. We stock popular Indian FMCG brands like Amul, Tata, Parle, Britannia, and Fortune.`;
        followUp = ['Is Amul milk available?', 'Do you have Maggi?', 'Which products are in stock?'];
      }
    }

    // -------------------------------------------------------------
    // INTENT: CATEGORY_SEARCH & BRAND_SEARCH
    // -------------------------------------------------------------
    else if (intent === 'CATEGORY_SEARCH' || intent === 'BRAND_SEARCH') {
      let filteredProducts: Product[] = [];
      let title = '';

      const explicitBrandMention = entities.brandName && (
        q.includes(entities.brandName.toLowerCase()) ||
        entities.brandName.toLowerCase().split(' ').some(w => w.length > 2 && q.includes(w))
      );

      if (explicitBrandMention) {
        title = `${entities.brandName} products`;
        filteredProducts = allProds.filter(p => p.brand.toLowerCase().includes(entities.brandName!.toLowerCase()) || p.name.toLowerCase().includes(entities.brandName!.toLowerCase()));
      } else {
        const cat = entities.category || 'Dairy';
        title = `${cat} products`;
        filteredProducts = allProds.filter(p => p.category === cat);
      }

      if (filteredProducts.length > 0) {
        matchedProductsList = filteredProducts;
        answer = `Here are the available **${title}** in our store (${filteredProducts.length} items):\n\n` +
          filteredProducts.slice(0, 8).map(p => `• **${p.name}** — ₹${p.price}\n  Stock: ${p.stockQuantity} units (${p.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'})\n  Location: ${p.aisle}, ${p.shelf}`).join('\n\n');

        action = {
          type: 'PRODUCT_LIST_CARD',
          data: filteredProducts,
          meta: { intent, entities }
        };

        followUp = filteredProducts.slice(0, 3).map(p => `Where is ${p.name}?`);
      } else {
        answer = `I found no matching products for ${title}. Available categories include Dairy, Beverages, Snacks, Biscuits, Staples, Personal Care, and Household.`;
      }
    }

    // -------------------------------------------------------------
    // INTENT: PRODUCT_SEARCH (Multi-Constraint Search)
    // -------------------------------------------------------------
    else if (intent === 'PRODUCT_SEARCH') {
      const maxPrice = entities.priceLimit;
      const minPrice = entities.priceLimitMin;
      const minQty = entities.minQuantity;
      const aisleFilter = entities.aisle;
      const inStock = entities.inStockOnly;

      let filtered = [...allProds];

      if (entities.category) {
        filtered = filtered.filter(p => p.category === entities.category);
      }

      if (entities.brandName) {
        filtered = filtered.filter(p => p.brand.toLowerCase().includes(entities.brandName!.toLowerCase()));
      }

      if (maxPrice !== undefined) {
        filtered = filtered.filter(p => p.price <= maxPrice);
      }

      if (minPrice !== undefined) {
        filtered = filtered.filter(p => p.price >= minPrice);
      }

      if (minQty !== undefined) {
        filtered = filtered.filter(p => p.stockQuantity >= minQty);
      }

      if (aisleFilter) {
        filtered = filtered.filter(p => p.aisle.toLowerCase().includes(aisleFilter.toLowerCase()));
      }

      if (inStock) {
        filtered = filtered.filter(p => p.stockQuantity > 0);
      }

      if (filtered.length > 0) {
        matchedProductsList = filtered;
        let filterDesc = '';
        if (maxPrice !== undefined && entities.category) filterDesc = `${entities.category} items under ₹${maxPrice}`;
        else if (maxPrice !== undefined && entities.brandName) filterDesc = `${entities.brandName} products under ₹${maxPrice}`;
        else if (maxPrice !== undefined) filterDesc = `items under ₹${maxPrice}`;
        else if (minPrice !== undefined && entities.category) filterDesc = `${entities.category} items above ₹${minPrice}`;
        else if (minPrice !== undefined) filterDesc = `items above ₹${minPrice}`;
        else if (minQty !== undefined && entities.category) filterDesc = `${entities.category} with more than ${minQty} units`;
        else if (entities.category) filterDesc = `${entities.category} items`;
        else filterDesc = 'matching products';

        answer = `Here are available **${filterDesc}** (${filtered.length} found):\n\n` +
          filtered.slice(0, 8).map(p => `• **${p.name}** — ₹${p.price} (${p.stockQuantity} in stock • ${p.aisle}, ${p.shelf})`).join('\n');

        action = {
          type: 'PRODUCT_LIST_CARD',
          data: filtered,
          meta: { intent, entities }
        };

        followUp = filtered.slice(0, 3).map(p => `Where is ${p.name}?`);
      } else if (entities.category) {
        const catProds = allProds.filter(p => p.category === entities.category);
        answer = `Here are available products in **${entities.category}**:\n\n` +
          catProds.slice(0, 5).map(p => `• **${p.name}** — ₹${p.price} (${p.aisle}, ${p.shelf})`).join('\n');

        action = {
          type: 'PRODUCT_LIST_CARD',
          data: catProds,
          meta: { intent, entities }
        };

        followUp = catProds.slice(0, 3).map(p => `Where is ${p.name}?`);
      } else {
        answer = `Here are some popular products in our store:\n\n` +
          allProds.slice(0, 5).map(p => `• **${p.name}** — ₹${p.price} (${p.aisle})`).join('\n');

        action = {
          type: 'PRODUCT_LIST_CARD',
          data: allProds.slice(0, 5),
          meta: { intent }
        };
      }
    }

    // -------------------------------------------------------------
    // INTENT: PRODUCT_RECOMMENDATION & CHEAPEST & ALTERNATIVES
    // -------------------------------------------------------------
    else if (intent === 'PRODUCT_RECOMMENDATION' || intent === 'CHEAPEST_PRODUCT' || intent === 'ALTERNATIVE_SUGGESTION') {
      if (intent === 'CHEAPEST_PRODUCT' || entities.recommendationTopic === 'cheapest') {
        // Use conversation context: if user browsed a brand/category, find cheapest from that list
        const contextProducts = conversationContext?.lastProducts as Product[] | undefined;
        const contextCategory = conversationContext?.lastCategory || entities.category;
        const contextBrand = conversationContext?.lastBrand || entities.brandName;

        let candidatePool: Product[] = [];
        if (contextProducts && contextProducts.length > 0) {
          candidatePool = contextProducts.filter(p => p.stockQuantity > 0);
        } else if (contextBrand) {
          candidatePool = allProds.filter(p => p.brand.toLowerCase().includes(contextBrand.toLowerCase()) && p.stockQuantity > 0);
        } else if (contextCategory) {
          candidatePool = allProds.filter(p => p.category === contextCategory && p.stockQuantity > 0);
        } else {
          candidatePool = allProds.filter(p => p.category === 'Dairy' && p.stockQuantity > 0);
        }

        candidatePool.sort((a, b) => a.price - b.price);
        const cheapest = candidatePool[0];

        if (cheapest) {
          const invItem = allInv.find(i => i.productId === cheapest.id);
          const qty = invItem?.quantity ?? cheapest.stockQuantity;
          const contextLabel = contextBrand ? `${contextBrand} products` : contextCategory ? contextCategory : 'Dairy';
          answer = `The cheapest option from **${contextLabel}** is **${cheapest.name}** by ${cheapest.brand}, priced at **₹${cheapest.price}** (${cheapest.unit}).\n\nStock: ${qty} units in **${cheapest.aisle}, ${cheapest.shelf}**.`;
          matchedProductsList = [cheapest];
          action = {
            type: 'PRODUCT_CARD',
            data: { ...cheapest, stockQuantity: qty, available: qty > 0 },
            meta: { intent }
          };
          followUp = [`Where is ${cheapest.name}?`, `Can I return ${cheapest.name}?`, 'Show me all dairy products'];
        } else {
          answer = `I couldn't find in-stock products to compare prices. Try "Show me Amul products" or "Show me snacks under ₹100".`;
          followUp = ['Show me dairy products', 'Show me snacks under ₹100'];
        }
      } else if (intent === 'ALTERNATIVE_SUGGESTION' || entities.recommendationTopic === 'alternatives') {
        const cat = previousProduct?.category || conversationContext?.lastCategory || 'Snacks';
        const alternatives = allProds.filter(p => p.category === cat && p.id !== previousProduct?.id && p.stockQuantity > 0).sort((a, b) => a.price - b.price).slice(0, 4);

        answer = `Here are cheaper available alternatives in **${cat}**:\n\n` +
          alternatives.map(a => `• **${a.name}** — ₹${a.price} (${a.stockQuantity} in stock • ${a.aisle})`).join('\n');

        matchedProductsList = alternatives;
        action = {
          type: 'PRODUCT_LIST_CARD',
          data: alternatives,
          meta: { intent }
        };
        followUp = alternatives.slice(0, 2).map(a => `Where is ${a.name}?`);
      } else if (entities.recommendationTopic === 'breakfast' || q.includes('breakfast')) {
        const breakfastItems = allProds.filter(p =>
          p.name.toLowerCase().includes('milk') ||
          p.name.toLowerCase().includes('tea') ||
          p.name.toLowerCase().includes('coffee') ||
          p.name.toLowerCase().includes('oats') ||
          p.name.toLowerCase().includes('poha') ||
          p.name.toLowerCase().includes('cornflake') ||
          p.name.toLowerCase().includes('muesli')
        ).slice(0, 6);

        answer = `Here are popular breakfast essentials available in store:\n\n` +
          breakfastItems.map(p => `• **${p.name}** — ₹${p.price} (${p.aisle}, ${p.shelf})`).join('\n') +
          `\n\n💡 _Also try Aashirvaad Atta for homemade rotis and Britannia bread for quick toasts!_`;

        matchedProductsList = breakfastItems;
        action = {
          type: 'PRODUCT_LIST_CARD',
          data: breakfastItems,
          meta: { intent }
        };
        followUp = ['Where is Amul milk?', 'Where is Tata Tea?', 'Show me grocery staples'];
      } else if (q.includes('party') || q.includes('for a party') || q.includes('snacks for')) {
        // Party snacks recommendation
        const partySnacks = allProds.filter(p =>
          (p.category === 'Snacks' || p.category === 'Biscuits & Cookies') &&
          p.stockQuantity > 0
        ).sort((a, b) => b.stockQuantity - a.stockQuantity).slice(0, 6);

        answer = `🎉 Here are great snack choices for a party:\n\n` +
          partySnacks.map(s => `• **${s.name}** — ₹${s.price} (${s.stockQuantity} in stock • ${s.aisle}, ${s.shelf})`).join('\n') +
          `\n\n💡 _Tip: Stock up on Lay's, Kurkure, Haldiram's, and Britannia biscuits for a variety spread!_`;

        matchedProductsList = partySnacks;
        action = {
          type: 'PRODUCT_LIST_CARD',
          data: partySnacks,
          meta: { intent }
        };
        followUp = partySnacks.slice(0, 3).map(s => `Where is ${s.name}?`);
      } else {
        // Suggest snacks under 100
        const affordableSnacks = allProds.filter(p => p.category === 'Snacks' && p.price <= 100 && p.stockQuantity > 0).slice(0, 4);

        answer = `Here are top recommended snacks under ₹100:\n\n` +
          affordableSnacks.map(s => `• **${s.name}** — ₹${s.price} (${s.aisle}, ${s.shelf})`).join('\n');

        matchedProductsList = affordableSnacks;
        action = {
          type: 'PRODUCT_LIST_CARD',
          data: affordableSnacks,
          meta: { intent }
        };
        followUp = affordableSnacks.slice(0, 2).map(s => `Where is ${s.name}?`);
      }
    }

    // -------------------------------------------------------------
    // INTENT: RETURN_POLICY & OPENED_PRODUCT
    // -------------------------------------------------------------
    else if (intent === 'RETURN_POLICY' || intent === 'EXCHANGE_POLICY' || intent === 'OPENED_PRODUCT') {
      const targetCategory = (matchedProduct ? matchedProduct.category : entities.category) || 'Personal Care';
      const pol = allPolicies.find(p => p.category === targetCategory) || allPolicies[0];
      targetPolicy = pol;

      if (q.includes('opened shampoo') || q.includes('shampoo') || (entities.isOpened && targetCategory === 'Personal Care')) {
        answer = `For Personal Care items like Dove or Head & Shoulders Shampoo:\n\n• **Return Window:** 5 days from purchase with invoice.\n• ⚠️ **Hygiene Rule:** Opened or unsealed personal care products **cannot be auto-approved** for return due to hygiene regulations.\n• **Defect Exception:** If there is a damaged dispenser nozzle or container leak present at time of purchase, a staff manager will authorize a replacement.\n\nWould you like me to raise an escalation ticket for staff inspection?`;
      } else {
        answer = `**Return & Exchange Policy for ${pol.category}:**\n• **Window:** ${pol.windowDays} day(s) from purchase date.\n• **Receipt:** ${pol.requiresReceipt ? 'Original store invoice or registered mobile number required.' : 'Optional.'}\n• **Autonomous Approval Limit:** Up to ₹${pol.autoApprovalLimit} (approved automatically by RIVA agent).\n• **Conditions:** ${pol.conditions.join(' ')}`;
      }

      action = {
        type: 'POLICY_CARD',
        data: pol,
        meta: { intent, entities }
      };

      followUp = [
        matchedProduct ? `I want to return ${matchedProduct.name}` : 'Start a return',
        'Can I return opened shampoo?',
        'Return policy for Dairy'
      ];
    }

    // -------------------------------------------------------------
    // INTENT: SPOILED_PRODUCT / DAMAGED_PRODUCT / EXPIRED_PRODUCT / RETURN_REQUEST / START_RETURN / START_EXCHANGE
    // -------------------------------------------------------------
    else if (
      intent === 'SPOILED_PRODUCT' || 
      intent === 'DAMAGED_PRODUCT' || 
      intent === 'EXPIRED_PRODUCT' || 
      intent === 'START_RETURN' || 
      intent === 'START_EXCHANGE' || 
      intent === 'RETURN_REQUEST' || 
      intent === 'EXCHANGE_REQUEST'
    ) {
      const isSpoiled = intent === 'SPOILED_PRODUCT' || entities.isSpoiled;
      const isDamaged = intent === 'DAMAGED_PRODUCT' || entities.isDamaged;
      const isExchange = intent === 'START_EXCHANGE' || intent === 'EXCHANGE_REQUEST' || entities.desiredResolution === 'EXCHANGE';

      const prod = matchedProduct || (isSpoiled ? allProds.find(p => p.category === 'Dairy') : allProds[0]) || allProds[0];
      const price = prod.price;
      const category = prod.category;

      const evalResult = await policyService.evaluateEligibility({
        productId: prod.id,
        productCategory: category,
        purchaseDate: entities.purchaseDate || new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        price,
        isOpened: isSpoiled || isDamaged ? true : (entities.isOpened ?? true),
        hasReceipt: entities.hasReceipt ?? true,
        reason: entities.reason || (isSpoiled ? 'Perishable item spoiled upon opening' : isDamaged ? 'Damaged container / broken seal' : 'Customer return request')
      });

      const ret = await returnService.createReturnRequest({
        customerId,
        customerName,
        customerPhone: '+91 98765 43210',
        productId: prod.id,
        productName: prod.name,
        orderId: entities.orderId || 'ORD-89214',
        purchaseDate: entities.purchaseDate || new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        amount: price,
        reason: entities.reason || (isSpoiled ? 'Perishable item spoiled upon opening' : isDamaged ? 'Damaged container / broken seal' : 'Customer return request'),
        resolutionType: isExchange ? 'EXCHANGE' : 'REFUND',
        isOpened: isSpoiled || isDamaged ? true : (entities.isOpened ?? true),
        hasReceipt: entities.hasReceipt ?? true
      });

      if (ret.status === 'AUTO_APPROVED') {
        answer = `✅ **${ret.resolutionType === 'EXCHANGE' ? 'Exchange' : 'Return'} Approved Autonomously!**\n\n• **Item:** ${ret.productName} (₹${ret.amount})\n• **Reference ID:** \`${ret.id}\`\n• **Status:** Approved (Within ₹${prod.price} limit & policy window)\n• **Next Step:** Your store credit / replacement voucher has been generated. Simulated notification sent to your email & SMS.`;
        
        action = {
          type: 'RETURN_APPROVED_CARD',
          data: ret,
          meta: { intent, referenceId: ret.id, suggestedAction: 'AUTO_APPROVE' }
        };
      } else {
        answer = `⚠️ **Routed for Staff Review (Ticket #${ret.ticketId})**\n\n• **Item:** ${ret.productName}\n• **Reason:** ${evalResult.reasonText}\n• **Reference ID:** \`${ret.id}\`\n• **Status:** Escalated to Customer Desk Manager for physical inspection.`;

        action = {
          type: 'TICKET_CREATED_CARD',
          data: ret,
          meta: { intent, ticketId: ret.ticketId, referenceId: ret.id, suggestedAction: 'ESCALATE_TO_STAFF' }
        };
      }

      followUp = [
        'Check my return status',
        'Where is customer support desk?',
        'What else can you do?'
      ];
    }

    // -------------------------------------------------------------
    // INTENT: ADD_TO_CART
    // -------------------------------------------------------------
    else if (intent === 'ADD_TO_CART') {
      if (matchedProduct) {
        answer = `I've prepared **${matchedProduct.name}** (₹${matchedProduct.price}) for your cart! You can click "Add to Cart" or "Buy Now" on the product card below to complete your order, or visit your cart directly.`;
        action = {
          type: 'PRODUCT_CARD',
          data: matchedProduct,
          meta: { intent }
        };
        followUp = ['View my cart', 'Proceed to checkout', 'Is anything else on discount?'];
      } else {
        answer = `Which product would you like to add to your cart? You can tell me the name like "Add Amul Butter to cart" or "Add Tata Tea to cart".`;
        followUp = ['Show me dairy products', 'Show me snacks under ₹100', 'View my cart'];
      }
    }

    // -------------------------------------------------------------
    // INTENT: SHOW_CART & CHECKOUT
    // -------------------------------------------------------------
    else if (intent === 'SHOW_CART' || intent === 'CHECKOUT') {
      answer = `You can view your shopping cart anytime at **[My Cart](/customer/cart)** or proceed directly to **[Checkout](/customer/checkout)** for fast doorstep delivery or store pickup.`;
      action = {
        type: 'CART_CARD',
        data: { url: '/customer/cart' },
        meta: { intent }
      };
      followUp = ['Show me popular snacks', 'Is Amul butter in stock?', 'Proceed to checkout'];
    }

    // -------------------------------------------------------------
    // INTENT: ORDER_STATUS
    // -------------------------------------------------------------
    else if (intent === 'ORDER_STATUS') {
      answer = `You can track all your active and delivered FMCG orders in real time on the **[My Orders](/customer/orders)** page. We provide live status updates for packing, doorstep delivery, and store counter pickups.`;
      action = {
        type: 'ORDER_CARD',
        data: { url: '/customer/orders' },
        meta: { intent }
      };
      followUp = ['View my orders', 'Start a return', 'Browse FMCG catalog'];
    }

    // -------------------------------------------------------------
    // INTENT: RETURN_STATUS
    // -------------------------------------------------------------
    else if (intent === 'RETURN_STATUS') {
      const userReturns = allReturns.filter(r => r.customerId === customerId || r.customerName === customerName);
      const latestReturn = userReturns.length > 0 ? userReturns[0] : allReturns[0];

      if (latestReturn) {
        answer = `**Return Status for \`${latestReturn.id}\`:**\n• **Product:** ${latestReturn.productName} (₹${latestReturn.amount || 290})\n• **Status:** ${latestReturn.status === 'AUTO_APPROVED' ? '✅ Approved (Store Credit Active)' : '⚠️ Under Staff Review'}\n• **Resolution:** ${latestReturn.resolutionType}\n• **Updated:** ${new Date(latestReturn.updatedAt).toLocaleDateString()}`;
        
        action = {
          type: latestReturn.status === 'AUTO_APPROVED' ? 'RETURN_APPROVED_CARD' : 'TICKET_CREATED_CARD',
          data: latestReturn,
          meta: { intent, referenceId: latestReturn.id }
        };

        followUp = ['Start a return', 'What is the return policy?'];
      } else {
        answer = `You do not have any active return requests on file. Would you like to start a return?`;
        followUp = ['Start a return', 'What is the return policy?'];
      }
    }

    // -------------------------------------------------------------
    // INTENT: LOW_STOCK & OUT_OF_STOCK
    // -------------------------------------------------------------
    else if (intent === 'LOW_STOCK') {
      const lowStockItems = allInv.filter(i => i.status === 'LOW_STOCK');
      if (lowStockItems.length > 0) {
        answer = `Here are the products currently **low in stock** (${lowStockItems.length} items):\n\n` +
          lowStockItems.slice(0, 5).map(i => `• **${i.name}** — ${i.quantity} units left (${i.aisle}, ${i.shelf})`).join('\n');

        action = {
          type: 'PRODUCT_LIST_CARD',
          data: lowStockItems.map(i => {
            const p = allProds.find(prod => prod.id === i.productId);
            return p || { ...i, description: '', image: '', tags: [] };
          }),
          meta: { intent }
        };

        followUp = lowStockItems.slice(0, 3).map(i => `Where is ${i.name}?`);
      } else {
        answer = `All products are currently well-stocked above reorder thresholds!`;
      }
    }

    else if (intent === 'OUT_OF_STOCK') {
      const outItems = allInv.filter(i => i.status === 'OUT_STOCK' || i.quantity === 0);
      if (outItems.length > 0) {
        answer = `Here are the items currently **out of stock** (${outItems.length} items):\n\n` +
          outItems.map(i => `• **${i.name}** (${i.category}) — Expected restock soon`).join('\n');

        action = {
          type: 'PRODUCT_LIST_CARD',
          data: outItems.map(i => {
            const p = allProds.find(prod => prod.id === i.productId);
            return p || { ...i, description: '', image: '', tags: [] };
          }),
          meta: { intent }
        };

        followUp = ['Which products are low in stock?', 'Show me snacks', 'Show me dairy products'];
      } else {
        answer = `Great news! No products are currently out of stock.`;
      }
    }

    // -------------------------------------------------------------
    // INTENT: GENERAL_RETAIL_QUERY
    // -------------------------------------------------------------
    else if (intent === 'GENERAL_RETAIL_QUERY') {
      answer = `**Store Information:**\n• **Timings:** Open daily 7:00 AM – 10:30 PM.\n• **Payment Methods:** UPI (GPay/PhonePe/Paytm), Cards (Visa/Mastercard/RuPay), Sodexo / Pluxee, and Cash.\n• **Customer Services:** Shopping trolleys, wheelchairs, express billing at Counters 1-4, and instant return desk at Gate 2.`;
      followUp = ['Where is Tata Tea?', 'Is Amul milk available?', 'What is the return policy?'];
    }

    // -------------------------------------------------------------
    // INTENT: THANKS
    // -------------------------------------------------------------
    else if (intent === 'THANKS') {
      const responses = [
        `You're welcome! 😊 Happy to help. Is there anything else you'd like to know about our products, stock, or return policies?`,
        `Glad I could help! Let me know if you need anything else — prices, locations, or return requests.`,
        `Anytime! Feel free to ask me anything about our store. 🛒`,
      ];
      answer = responses[Math.floor(Math.random() * responses.length)];
      action = { type: 'GENERAL_INFO_CARD', data: { thanks: true }, meta: { intent } };
      followUp = ['Show me popular products', 'What is the return policy?', 'Where is Amul milk?'];
    }

    // -------------------------------------------------------------
    // INTENT: GOODBYE
    // -------------------------------------------------------------
    else if (intent === 'GOODBYE') {
      answer = `Goodbye! 👋 Thank you for shopping at RIVA Supermarket. Have a great day! Feel free to ask if you need anything else before you leave.`;
      action = { type: 'GENERAL_INFO_CARD', data: { goodbye: true }, meta: { intent } };
      followUp = ['Start a return', 'Check my return status'];
    }

    // -------------------------------------------------------------
    // INTENT: PRODUCT_COMPARISON
    // -------------------------------------------------------------
    else if (intent === 'PRODUCT_COMPARISON') {
      // Try to extract two product names from the query
      const compProds: Product[] = [];
      const qLower = q.toLowerCase();

      // Find all products whose name or brand appears in the query
      for (const p of allProds) {
        const pNameTokens = normalizeText(p.name).split(' ').filter(t => t.length > 2);
        const brandToken = normalizeText(p.brand);
        const matched = pNameTokens.some(t => qLower.includes(t)) || qLower.includes(brandToken);
        if (matched && !compProds.find(cp => cp.id === p.id)) {
          compProds.push(p);
        }
        if (compProds.length >= 2) break;
      }

      if (compProds.length >= 2) {
        const [p1, p2] = compProds;
        const inv1 = allInv.find(i => i.productId === p1.id);
        const inv2 = allInv.find(i => i.productId === p2.id);
        const qty1 = inv1?.quantity ?? p1.stockQuantity;
        const qty2 = inv2?.quantity ?? p2.stockQuantity;

        const cheaper = p1.price <= p2.price ? p1 : p2;
        const moreStock = qty1 >= qty2 ? p1 : p2;

        answer = `**Side-by-Side Comparison:**\n\n` +
          `| | **${p1.name}** | **${p2.name}** |\n` +
          `|---|---|---|\n` +
          `| **Brand** | ${p1.brand} | ${p2.brand} |\n` +
          `| **Category** | ${p1.category} | ${p2.category} |\n` +
          `| **Price** | ₹${p1.price} (${p1.unit}) | ₹${p2.price} (${p2.unit}) |\n` +
          `| **Stock** | ${qty1} units | ${qty2} units |\n` +
          `| **Location** | ${p1.aisle}, ${p1.shelf} | ${p2.aisle}, ${p2.shelf} |\n` +
          `| **Status** | ${qty1 > 0 ? '✅ In Stock' : '❌ Out of Stock'} | ${qty2 > 0 ? '✅ In Stock' : '❌ Out of Stock'} |\n\n` +
          `💡 **Better Value:** ${cheaper.name} is cheaper at ₹${cheaper.price}.\n` +
          `📦 **More Available:** ${moreStock.name} has more units in stock (${Math.max(qty1, qty2)} units).`;

        matchedProductsList = compProds;
        action = {
          type: 'PRODUCT_LIST_CARD',
          data: compProds,
          meta: { intent, entities }
        };
        followUp = [
          `Where is ${cheaper.name}?`,
          `Can I return ${p1.name}?`,
          `How many ${p2.name} are left?`
        ];
      } else if (compProds.length === 1) {
        const cat = compProds[0].category;
        const alternatives = allProds.filter(p => p.category === cat && p.id !== compProds[0].id && p.stockQuantity > 0).slice(0, 3);
        answer = `I found **${compProds[0].name}** but couldn't identify a second product to compare. Here are similar ${cat} options:\n\n` +
          alternatives.map(a => `• **${a.name}** — ₹${a.price} (${a.stockQuantity} units)`).join('\n');
        matchedProductsList = [compProds[0], ...alternatives];
        action = { type: 'PRODUCT_LIST_CARD', data: matchedProductsList, meta: { intent } };
        followUp = alternatives.map(a => `Compare ${compProds[0].name} and ${a.name}`).slice(0, 2);
      } else {
        answer = `I couldn't identify specific products to compare. Please mention specific product names, like:\n• *"Compare Tata Tea and Red Label"*\n• *"Amul milk vs Mother Dairy milk"*`;
        followUp = ['Compare Tata Tea and Red Label', 'Compare Amul Gold and Amul Taaza', 'Show me dairy products'];
      }
    }

    // -------------------------------------------------------------
    // INTENT: GENERAL_CONVERSATION
    // -------------------------------------------------------------
    else if (intent === 'GENERAL_CONVERSATION') {
      const qLower = q.toLowerCase();

      if (qLower.includes('how are you') || qLower.includes('how do you do') || qLower.includes('whats up') || qLower.includes("what's up")) {
        answer = `I'm doing great, thank you for asking! 😊 I'm RIVA, your in-store retail assistant — always ready to help you find products, check stock, or process returns. How can I assist you today?`;
      } else if (qLower.includes('who are you') || qLower.includes('what are you') || qLower.includes('tell me about yourself') || qLower.includes('about riva') || qLower.includes('who made you') || qLower.includes('who created')) {
        answer = `I'm **RIVA** — *Retail Intelligence & Virtual Assistant*. 🛒\n\nI'm an AI-powered in-store assistant built to help you:\n• **Find products** across all aisles instantly\n• **Check live stock** and shelf locations\n• **Compare products** and prices\n• **Process returns and exchanges** automatically\n• **Answer questions** about FMCG products and store policies\n\nI understand natural language — so just ask me anything!`;
      } else if (
        qLower.includes('what is fmcg') || qLower.includes('fmcg means') || qLower.includes('fmcg stands') ||
        qLower.includes('what does fmcg mean') || qLower.includes('fmcg meaning') || qLower.includes('meaning of fmcg') ||
        qLower.includes('fmcg definition') || qLower.includes('define fmcg')
      ) {
        answer = `**FMCG** stands for *Fast-Moving Consumer Goods* — everyday products that are sold quickly and at relatively low cost.\n\n**Categories include:**\n• 🥛 **Dairy** — Milk, Curd, Ghee, Butter, Paneer (Amul, Mother Dairy, Nandini)\n• 🍵 **Tea & Coffee** — Tata Tea, Red Label, Nescafe, Bru\n• 🧃 **Beverages** — Maaza, Real Juice, Coca-Cola, Frooti\n• 🍪 **Snacks & Biscuits** — Lay's, Kurkure, Haldiram's, Parle-G, Britannia\n• 🍜 **Instant Food** — Maggi, Yippee, Sunfeast Pasta\n• 🧴 **Personal Care** — Dove, Head & Shoulders, Dettol, Colgate\n• 🧺 **Household** — Surf Excel, Ariel, Vim, Harpic\n• 🌾 **Grocery & Staples** — Aashirvaad Atta, India Gate Rice, Tata Salt, Fortune Oil\n\nFMCG products are the backbone of any supermarket. We stock **125+ items** across **6 aisles**!`;
        followUp = ['Show me dairy products', 'Show me snacks under ₹100', 'What is the return policy?'];
      } else if (qLower.includes('what is dairy') || qLower.includes('explain dairy')) {
        answer = `**Dairy products** are food items made from or derived from animal milk, typically cow or buffalo milk.\n\nPopular dairy products available in our store:\n• 🥛 **Milk** — Amul Taaza, Amul Gold, Mother Dairy\n• 🧈 **Butter** — Amul Butter\n• 🫙 **Ghee** — Amul Pure Ghee, Nandini Ghee\n• 🍦 **Paneer** — Amul Paneer\n• 🥣 **Curd / Yoghurt** — Amul Dahi\n\nWould you like me to show all dairy products in stock?`;
        followUp = ['Show me dairy products', 'Is Amul milk available?', 'How much is Amul Gold milk?'];
      } else if (
        qLower.includes('difference between milk and curd') || qLower.includes('milk vs curd') ||
        qLower.includes('curd vs milk') || qLower.includes('difference between curd and milk')
      ) {
        answer = `**Milk** is fresh liquid from dairy animals, while **Curd (Dahi)** is milk fermented with live bacterial cultures (lactobacillus).\n\n**Key differences:**\n| | **Milk** 🥛 | **Curd** 🍶 |\n|---|---|---|\n| **Form** | Liquid | Semi-solid |\n| **Taste** | Mildly sweet | Slightly tangy |\n| **Use** | Tea, cooking, drinking | Side dish, lassi, raita |\n| **Benefit** | Calcium, protein | Probiotic, digestion |\n| **Shelf life** | 1–2 days (open) | 3–4 days (refrigerated) |\n\nBoth are available in our **Dairy aisle (Aisle 1)**! Would you like to check their availability?`;
        followUp = ['Is Amul milk available?', 'Show me dairy products', 'Where is Amul Dahi?'];
      } else if (qLower.includes('suggest healthy') || qLower.includes('healthy snacks') || qLower.includes('healthy option') || qLower.includes('nutritious')) {
        const healthyProds = allProds.filter(p =>
          p.name.toLowerCase().includes('oat') ||
          p.name.toLowerCase().includes('nuts') ||
          p.name.toLowerCase().includes('millet') ||
          p.category === 'Dairy' ||
          p.name.toLowerCase().includes('roasted')
        ).slice(0, 5);
        answer = `Here are some healthier options from our store:\n\n` +
          (healthyProds.length > 0
            ? healthyProds.map(p => `• **${p.name}** — ₹${p.price} (${p.aisle})`).join('\n')
            : '• **Amul Taaza Milk** — ₹32 (Aisle 1)\n• **Nandini Ghee** — ₹610 (Aisle 1)\n• **Aashirvaad Atta** — ₹365 (Aisle 6)\n• **Tata Salt** — ₹28 (Aisle 6)') +
          `\n\n_For medical dietary advice, please consult a qualified nutritionist._`;
        followUp = ['Show me dairy products', 'Show me snacks under ₹100'];
      } else if (qLower.includes('snacks for a party') || qLower.includes('party snacks') || qLower.includes('snacks for party') || qLower.includes('for a party')) {
        const partySnacks = allProds.filter(p =>
          (p.category === 'Snacks' || p.category === 'Biscuits & Cookies') && p.stockQuantity > 0
        ).sort((a, b) => b.stockQuantity - a.stockQuantity).slice(0, 6);
        answer = `🎉 **Party Snack Ideas** from our store:\n\n` +
          partySnacks.map(s => `• **${s.name}** — ₹${s.price} (${s.stockQuantity} units in stock • ${s.aisle})`).join('\n') +
          `\n\n💡 _Mix and match Lay's, Kurkure, Haldiram's Bhujia, and Britannia biscuits for a great party spread!_`;
        matchedProductsList = partySnacks;
        action = { type: 'PRODUCT_LIST_CARD', data: partySnacks, meta: { intent } };
        followUp = partySnacks.slice(0, 3).map(s => `Where is ${s.name}?`);
      } else if (qLower.includes('suggest breakfast') || qLower.includes('breakfast ideas') || qLower.includes('breakfast products')) {
        const breakfastItems = allProds.filter(p =>
          p.name.toLowerCase().includes('milk') ||
          p.name.toLowerCase().includes('tea') ||
          p.name.toLowerCase().includes('coffee') ||
          p.name.toLowerCase().includes('oats') ||
          p.name.toLowerCase().includes('poha')
        ).slice(0, 5);
        answer = `☀️ **Breakfast Essentials** available in store:\n\n` +
          breakfastItems.map(p => `• **${p.name}** — ₹${p.price} (${p.aisle}, ${p.shelf})`).join('\n') +
          `\n\n💡 _Also consider Aashirvaad Atta for fresh rotis and Britannia bread for quick toast!_`;
        matchedProductsList = breakfastItems;
        action = { type: 'PRODUCT_LIST_CARD', data: breakfastItems, meta: { intent } };
        followUp = ['Where is Amul milk?', 'Where is Tata Tea?'];
      } else if (qLower.includes('can you help') || qLower.includes('what can you do') || qLower.includes('what can riva')) {
        answer = `Absolutely! Here's what I can do for you:\n\n🔍 **Product Search** — "Is Amul milk available?"\n📍 **Find Location** — "Where is Tata Tea?"\n📊 **Check Stock** — "How many Maggi packets are left?"\n💰 **Check Price** — "What is the price of Lay's?"\n⚖️ **Compare Products** — "Compare Tata Tea and Red Label"\n🔄 **Return/Exchange** — "Can I return opened shampoo?"\n🏷️ **Browse Categories** — "Show me dairy products"\n💡 **Recommendations** — "Suggest snacks under ₹100"\n🎉 **Party/Event Ideas** — "Suggest snacks for a party"\n\nJust type or speak naturally — I understand Indian English!`;
      } else if (qLower.includes('interesting') || qLower.includes('cool') || qLower.includes('amazing') || qLower.includes('wow') || qLower.includes('nice') || qLower.includes('great')) {
        answer = `Thank you! 😊 I'm here to make your shopping experience as smooth as possible. What would you like to know next?`;
      } else if (qLower.includes('ok') || qLower.includes('okay') || qLower.includes('alright') || qLower.includes('i see') || qLower.includes('i understand')) {
        answer = `Got it! Let me know if you have any other questions about products, stock levels, locations, or returns. I'm here to help! 🛒`;
      } else {
        answer = `That's a great question! While I specialize in FMCG retail and in-store assistance, I'm happy to help with general questions too.\n\nFor store-specific help, try asking:\n• *"Is Amul milk available?"*\n• *"Where is Tata Tea?"*\n• *"Show me snacks under ₹100"*\n• *"What does FMCG mean?"*\n• *"Suggest snacks for a party"*`;
      }

      action = { type: 'GENERAL_INFO_CARD', data: { general: true }, meta: { intent } };
      followUp = followUp.length > 0 ? followUp : [
        'Show me dairy products',
        'Is Amul milk in stock?',
        'What is the return policy?',
        'Compare Tata Tea and Red Label'
      ];
    }


    // -------------------------------------------------------------
    // INTENT: UNKNOWN / FALLBACK
    // -------------------------------------------------------------
    else {
      answer = `I can help with products, stock, prices, store locations, returns, and exchanges — or just answer general questions!\n\nTry:\n• *"Is Amul milk available?"*\n• *"Where is Tata Tea?"*\n• *"Show me snacks under ₹100"*\n• *"What is FMCG?"*`;
      followUp = [
        'Is Amul milk available?',
        'Where is Tata Tea?',
        'Show me dairy products',
        'What is the return policy?'
      ];
    }

    return {
      intent,
      entities,
      products: matchedProductsList,
      policy: targetPolicy,
      answer,
      suggestedResponse: answer,
      action,
      actionPayload: action,
      confidence: matchedProductsList.length > 0 ? 0.95 : 0.85,
      followUp,
      suggestedFollowUps: followUp,
      matchedProducts: matchedProductsList,
      matchedPolicies: allPolicies
    };
  }

  async retrieveContext(
    query: string, 
    userContext?: { customerId?: string; customerName?: string },
    conversationHistory?: ConversationContext
  ): Promise<AssistantResponse> {
    // Pass the full ConversationContext directly — no field narrowing
    const context: ConversationContext = conversationHistory || {};

    const res = await this.processRivaQuery(query, context, userContext);
    return {
      matchedProducts: res.products,
      matchedPolicies: res.matchedPolicies,
      suggestedResponse: res.answer,
      intent: res.intent,
      entities: res.entities,
      actionPayload: res.action,
      suggestedFollowUps: res.followUp
    };
  }
}

export const retrievalService = new MockRetrievalService();

export const processRivaQuery = (
  message: string, 
  conversationContext?: ConversationContext, 
  userContext?: { customerId?: string; customerName?: string }
) => retrievalService.processRivaQuery(message, conversationContext, userContext);

