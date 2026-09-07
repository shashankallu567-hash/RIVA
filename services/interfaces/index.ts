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
  UserIntent,
  ExtractedEntities,
  AssistantActionPayload,
  AppNotification,
  DispatchedNotification,
  NotificationEventType,
  ConversationContext,
  ProcessRivaQueryResult
} from '@/types';

export interface IProductService {
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  getProductByName(name: string): Promise<Product | null>;
  searchProducts(query: string, category?: string): Promise<Product[]>;
  getProductsByCategory(category: ProductCategory): Promise<Product[]>;
  createProduct(product: Omit<Product, 'id' | 'productId'>): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
}

export interface InventoryStats {
  totalProducts: number;
  totalUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface IInventoryService {
  getAllInventory(): Promise<InventoryItem[]>;
  getInventoryByProductId(productId: string): Promise<InventoryItem | null>;
  getProductByName(name: string): Promise<{ product: Product | null; inventory: InventoryItem | null }>;
  searchProducts(query: string): Promise<{ product: Product; inventory: InventoryItem }[]>;
  checkStock(productIdOrName: string): Promise<{
    productName: string;
    available: boolean;
    quantity: number;
    reorderLevel: number;
    status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_STOCK';
    item?: InventoryItem;
  }>;
  getProductLocation(productIdOrName: string): Promise<{
    found: boolean;
    productName: string;
    aisle: string;
    shelf: string;
    section?: string;
  }>;
  updateStock(productId: string, newQuantity: number, reason?: InventoryActivityLog['reason']): Promise<{
    item: InventoryItem;
    log: InventoryActivityLog;
  }>;
  getLowStockProducts(): Promise<InventoryItem[]>;
  getOutOfStockProducts(): Promise<InventoryItem[]>;
  getInventoryStats(): Promise<InventoryStats>;
  getInventoryActivityLogs(): Promise<InventoryActivityLog[]>;
  resetInventory(): Promise<void>;
}

export interface IPolicyService {
  getAllPolicies(): Promise<ReturnPolicy[]>;
  getPolicyByCategory(category: ProductCategory | string): Promise<ReturnPolicy | null>;
  evaluateEligibility(params: {
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
  }>;
}

export interface IReturnService {
  getAllReturns(): Promise<ReturnRequest[]>;
  getReturnById(id: string): Promise<ReturnRequest | null>;
  getReturnsByCustomerId(customerId: string): Promise<ReturnRequest[]>;
  createReturnRequest(data: Omit<ReturnRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'eligibility'> & { isOpened?: boolean; hasReceipt?: boolean }): Promise<ReturnRequest>;
  updateReturnStatus(id: string, status: ReturnRequest['status'], notes?: string): Promise<ReturnRequest>;
}

export interface ITicketService {
  getAllTickets(): Promise<SupportTicket[]>;
  getTicketById(id: string): Promise<SupportTicket | null>;
  getTicketsByCustomer(customerId: string): Promise<SupportTicket[]>;
  createTicket(data: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupportTicket>;
  updateTicketStatus(id: string, status: SupportTicket['status'], assignedStaffId?: string): Promise<SupportTicket>;
}

export interface IAuditService {
  getAllLogs(): Promise<AuditLog[]>;
  logEvent(event: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog>;
  getLogsByEntity(entity: AuditLog['entity'], entityId?: string): Promise<AuditLog[]>;
}

export interface IAuthService {
  getCurrentUser(): Promise<User | null>;
  login(email: string, role?: UserRole): Promise<User>;
  signup(name: string, email: string, role?: UserRole): Promise<User>;
  logout(): Promise<void>;
  switchPersona(role: UserRole): Promise<User>;
}

export interface AssistantResponse {
  matchedProducts: Product[];
  matchedPolicies: ReturnPolicy[];
  suggestedResponse: string;
  intent: UserIntent;
  entities: ExtractedEntities;
  actionPayload?: AssistantActionPayload;
  suggestedFollowUps?: string[];
}

export interface IRetrievalService {
  classifyIntent(query: string, previousProduct?: Product | null, context?: ConversationContext): UserIntent;
  extractEntities(query: string, previousProduct?: Product | null, context?: ConversationContext): ExtractedEntities;
  retrieveContext(
    query: string, 
    userContext?: { customerId?: string; customerName?: string },
    conversationHistory?: ConversationContext
  ): Promise<AssistantResponse>;
  processRivaQuery(
    message: string,
    conversationContext?: ConversationContext,
    userContext?: { customerId?: string; customerName?: string }
  ): Promise<ProcessRivaQueryResult>;
}

export interface INotificationService {
  getAllNotifications(): Promise<AppNotification[]>;
  getNotificationsByUser(userId?: string, role?: UserRole): Promise<AppNotification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId?: string): Promise<void>;
  getDispatchedLogs(): Promise<DispatchedNotification[]>;
  dispatchNotification(params: {
    event: NotificationEventType;
    title: string;
    message: string;
    referenceId?: string;
    recipientName?: string;
    recipientEmail?: string;
    recipientPhone?: string;
    targetRole?: UserRole | 'ALL';
    targetUserId?: string;
  }): Promise<DispatchedNotification>;
}
