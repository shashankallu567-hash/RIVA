export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  storeId?: string;
  createdAt: string;
}

export interface StoreLocation {
  aisle: string;
  section: string;
  shelf: string;
  bay?: string;
  floor?: string;
  coordinates?: { x: number; y: number };
}

export interface Store {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  address: string;
  contactNumber: string;
  isOpen: boolean;
  totalAisles: number;
}

export type ProductCategory = 
  | 'Dairy'
  | 'Beverages'
  | 'Tea & Coffee'
  | 'Snacks'
  | 'Biscuits & Cookies'
  | 'Instant Food'
  | 'Personal Care'
  | 'Oral Care'
  | 'Household'
  | 'Laundry'
  | 'Home Cleaning'
  | 'Grocery & Staples'
  | 'Oils & Fats'
  | 'Spices & Condiments'
  | 'Baby Care';

export interface Product {
  id: string;
  productId: string; // Direct ID alias for consistency
  sku: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number; // in INR ₹
  mrp?: number;
  unit: string; // e.g. "500 ml", "1 kg", "200 g"
  description: string;
  image: string;
  storeId: string;
  location: StoreLocation;
  aisle: string;
  shelf: string;
  stockQuantity: number;
  stock?: number; // Alias for convenience
  availability?: string; // "IN_STOCK" | "LOW_STOCK" | "OUT_STOCK"
  store?: string;
  returnPolicy?: string;
  exchangePolicy?: string;
  shelfLife?: string;
  expiryInformation?: string;
  packSize?: string;
  reorderLevel: number;
  lastUpdated: string;
  returnWindowDays: number;
  barcode?: string;
  tags: string[];
  isVeg?: boolean;
}

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_STOCK';

export interface InventoryItem {
  id: string;
  productId: string;
  name: string;
  category: ProductCategory;
  brand: string;
  price: number;
  storeId: string;
  quantity: number;
  stockQuantity: number;
  minThreshold: number;
  reorderLevel: number;
  available: boolean;
  aisle: string;
  shelf: string;
  location: StoreLocation;
  lastUpdated: string;
  returnWindowDays: number;
  batchNumber?: string;
  expiryDate?: string;
  status: StockStatus;
}

export interface InventoryActivityLog {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  previousQuantity: number;
  newQuantity: number;
  reason: 'Sale' | 'Manual update' | 'Restock' | 'Damaged write-off' | 'Inventory Audit' | 'Return / Restock';
  updatedBy?: string;
}

export interface ReturnPolicy {
  id: string;
  category: ProductCategory | 'ALL';
  windowDays: number;
  conditions: string[];
  requiresReceipt: boolean;
  exchangeAllowed: boolean;
  autoApprovalLimit: number; // Max amount in INR for autonomous RIVA agent approval
  allowOpenedReturns?: boolean;
  specialInstructions?: string;
  nonReturnableItems: string[];
  notes?: string;
}

export type ReturnStatus = 'PENDING' | 'AUTO_APPROVED' | 'MANUAL_REVIEW' | 'REJECTED' | 'COMPLETED' | 'APPROVED' | 'ESCALATED';
export type EligibilityStatus = 'ELIGIBLE_AUTO' | 'REQUIRES_STAFF_REVIEW' | 'REQUIRES_ESCALATION' | 'INELIGIBLE';

export interface ReturnRequest {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  category?: ProductCategory;
  brand?: string;
  price?: number;
  amount?: number;
  purchaseDate: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  storeId?: string;
  reason: string;
  condition?: 'SEALED' | 'OPENED_UNUSED' | 'OPENED_USED' | 'DEFECTIVE' | 'EXPIRED' | 'DAMAGED';
  hasReceipt?: boolean;
  isOpened?: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'COMPLETED' | 'AUTO_APPROVED' | 'MANUAL_REVIEW';
  eligibility: EligibilityStatus;
  resolutionType: 'REFUND' | 'EXCHANGE' | 'STORE_CREDIT';
  exchangeProductId?: string;
  exchangeProductName?: string;
  notes?: string;
  ticketId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRequest {
  id: string;
  returnRequestId: string;
  originalProductId: string;
  replacementProductId: string;
  priceDifference: number;
  status: 'PENDING' | 'APPROVED' | 'FULFILLED';
  createdAt: string;
}

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketSource = 'ASSISTANT' | 'MANUAL' | 'ESCALATED' | 'INVENTORY_ALERT';

export interface SupportTicket {
  id: string;
  customerId?: string;
  customerName?: string;
  customerContact?: string;
  type: 'RETURN_DISPUTE' | 'STOCK_OUT' | 'LOCATION_CONFUSION' | 'DAMAGED_ITEM' | 'GENERAL_QUERY';
  priority: TicketPriority;
  status: TicketStatus;
  title: string;
  description: string;
  source: TicketSource;
  assignedStaffId?: string;
  assignedStaffName?: string;
  relatedEntityId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  entity: 'RETURN' | 'INVENTORY' | 'TICKET' | 'PRODUCT' | 'POLICY' | 'ASSISTANT' | 'NOTIFICATION';
  entityId: string;
  details: string;
  ipAddress?: string;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export type UserIntent = 
  | 'GREETING'
  | 'GENERAL_CONVERSATION'
  | 'PRODUCT_SEARCH'
  | 'CATEGORY_SEARCH'
  | 'BRAND_SEARCH'
  | 'PRODUCT_COMPARISON'
  | 'STOCK_CHECK'
  | 'STOCK_QUANTITY'
  | 'PRODUCT_LOCATION'
  | 'LOCATION_CHECK'
  | 'PRICE_CHECK'
  | 'PRODUCT_DETAILS'
  | 'PRODUCT_RECOMMENDATION'
  | 'CHEAPEST_PRODUCT'
  | 'ALTERNATIVE_SUGGESTION'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'RETURN_POLICY'
  | 'EXCHANGE_POLICY'
  | 'RETURN_ELIGIBILITY'
  | 'EXCHANGE_ELIGIBILITY'
  | 'RETURN_REQUEST'
  | 'RETURN_CREATE'
  | 'EXCHANGE_REQUEST'
  | 'EXCHANGE_CREATE'
  | 'DAMAGED_PRODUCT'
  | 'EXPIRED_PRODUCT'
  | 'SPOILED_PRODUCT'
  | 'OPENED_PRODUCT'
  | 'ORDER_LOOKUP'
  | 'ORDER_STATUS'
  | 'ADD_TO_CART'
  | 'SHOW_CART'
  | 'REMOVE_FROM_CART'
  | 'CHECKOUT'
  | 'RETURN_STATUS'
  | 'START_RETURN'
  | 'START_EXCHANGE'
  | 'SUPPORT_TICKET'
  | 'HELP'
  | 'THANKS'
  | 'GOODBYE'
  | 'SUPPORT_ESCALATION'
  | 'GENERAL_RETAIL_QUERY'
  | 'UNKNOWN';

export interface ExtractedEntities {
  productName?: string;
  brandName?: string;
  category?: ProductCategory;
  quantity?: number;
  minQuantity?: number;
  orderId?: string;
  purchaseDate?: string;
  priceLimit?: number;
  priceLimitMin?: number;
  aisle?: string;
  shelf?: string;
  inStockOnly?: boolean;
  isOpened?: boolean;
  hasReceipt?: boolean;
  isDamaged?: boolean;
  isSpoiled?: boolean;
  isExpired?: boolean;
  reason?: string;
  desiredResolution?: 'REFUND' | 'EXCHANGE' | 'STORE_CREDIT';
  customerName?: string;
  customerPhone?: string;
  recommendationTopic?: 'breakfast' | 'snacks' | 'cheapest' | 'alternatives' | 'general';
}

export interface ConversationContext {
  lastProductId?: string;
  lastProduct?: Product | null;
  lastProducts?: Product[];
  lastCategory?: ProductCategory;
  lastBrand?: string;
  lastOrder?: string;
  lastReturn?: ReturnRequest;
  lastIntent?: UserIntent;
  lastFilters?: {
    category?: ProductCategory;
    brand?: string;
    maxPrice?: number;
    minPrice?: number;
    inStockOnly?: boolean;
    minQuantity?: number;
    aisle?: string;
  };
}

export type AssistantActionType = 
  | 'PRODUCT_CARD'
  | 'LOCATION_CARD'
  | 'STOCK_CARD'
  | 'PRICE_CARD'
  | 'PRODUCT_LIST_CARD'
  | 'COMPARISON_CARD'
  | 'OUT_OF_STOCK_CARD'
  | 'RETURN_APPROVED_CARD'
  | 'TICKET_CREATED_CARD'
  | 'POLICY_CARD'
  | 'GENERAL_INFO_CARD'
  | 'CART_CARD'
  | 'ORDER_CARD'
  | 'CHECK_STOCK'
  | 'SHOW_LOCATION'
  | 'INITIATE_RETURN'
  | 'CREATE_TICKET'
  | 'EXPLAIN_POLICY';

export interface AssistantActionPayload {
  type: AssistantActionType;
  data?: any;
  meta?: {
    intent: UserIntent;
    entities?: ExtractedEntities;
    referenceId?: string;
    ticketId?: string;
    suggestedAction?: 'AUTO_APPROVE' | 'ESCALATE_TO_STAFF' | 'REJECT';
    reasonText?: string;
    alternatives?: Product[];
  };
}

export interface ProcessRivaQueryResult {
  intent: UserIntent;
  entities: ExtractedEntities;
  products: Product[];
  policy?: ReturnPolicy;
  answer: string;
  suggestedResponse: string; // compatibility alias
  action?: AssistantActionPayload;
  actionPayload?: AssistantActionPayload; // compatibility alias
  confidence: number;
  followUp: string[];
  suggestedFollowUps: string[]; // compatibility alias
  matchedProducts: Product[]; // compatibility alias
  matchedPolicies: ReturnPolicy[]; // compatibility alias
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  actionPayload?: AssistantActionPayload;
  suggestedFollowUps?: string[];
}

export interface Conversation {
  id: string;
  customerId: string;
  storeId: string;
  messages: Message[];
  startedAt: string;
  endedAt?: string;
}

// ==========================================
// E-COMMERCE CART & ORDER TYPES
// ==========================================

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string;
}

export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'PACKING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'MOCK_UPI' | 'MOCK_CARD' | 'MOCK_COD' | 'MOCK_NETBANKING';
export type DeliveryType = 'HOME_DELIVERY' | 'STORE_PICKUP';

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  category: ProductCategory;
  price: number;
  mrp?: number;
  quantity: number;
  image: string;
  unit: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PAID' | 'PENDING';
  deliveryType: DeliveryType;
  deliveryAddress?: {
    street: string;
    city: string;
    pincode: string;
  };
  pickupStore?: string;
  createdAt: string;
  estimatedDelivery?: string;
}

// ==========================================
// UNIFIED NOTIFICATION SYSTEM TYPES
// ==========================================

export type NotificationEventType = 
  | 'RETURN_CREATED'
  | 'RETURN_APPROVED'
  | 'RETURN_ESCALATED'
  | 'EXCHANGE_CREATED'
  | 'EXCHANGE_APPROVED'
  | 'STAFF_ESCALATION'
  | 'LOW_STOCK_ALERT'
  | 'OUT_OF_STOCK_ALERT'
  | 'ORDER_UPDATE'
  | 'ADD_TO_CART'
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_STATUS_CHANGED';

export interface AppNotification {
  id: string;
  type: NotificationEventType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetRole?: UserRole | 'ALL';
  targetUserId?: string;
  referenceId?: string;
  actionUrl?: string;
}

export interface DispatchedNotification {
  id: string;
  event: NotificationEventType;
  title: string;
  timestamp: string;
  referenceId?: string;
  channels: {
    inApp: {
      status: 'DELIVERED';
      preview: string;
    };
    email: {
      status: 'SIMULATED (Demo Mode)' | 'SENT';
      recipient: string;
      subject: string;
      body: string;
      provider: 'Mock Email Provider (Local Demo)';
    };
    sms: {
      status: 'SIMULATED (Demo Mode)' | 'SENT';
      phoneNumber: string;
      message: string;
      provider: 'Mock SMS Gateway (Local Demo)';
    };
    whatsapp: {
      status: 'SIMULATED (Demo Mode)' | 'SENT';
      recipient: string;
      message: string;
      provider: 'Mock WhatsApp Business API (Local Demo)';
    };
  };
}
