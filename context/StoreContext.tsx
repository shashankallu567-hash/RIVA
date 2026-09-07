'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Product, 
  InventoryItem, 
  ReturnPolicy, 
  ReturnRequest, 
  SupportTicket, 
  AuditLog, 
  Store,
  InventoryActivityLog,
  StockStatus,
  AppNotification,
  DispatchedNotification,
  CartItem,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  DeliveryType,
  ConversationContext
} from '@/types';
import { 
  productService, 
  inventoryService, 
  policyService, 
  returnService, 
  ticketService, 
  auditService,
  retrievalService,
  notificationService
} from '@/services/mock';
import { AssistantResponse } from '@/services/interfaces';
import { MOCK_STORES } from '@/data/mockStores';
import { INITIAL_ORDERS } from '@/data/mockOrders';

interface InventoryStats {
  totalProducts: number;
  totalUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface StoreContextType {
  activeStore: Store;
  products: Product[];
  inventory: InventoryItem[];
  activityLogs: InventoryActivityLog[];
  inventoryStats: InventoryStats;
  policies: ReturnPolicy[];
  returns: ReturnRequest[];
  tickets: SupportTicket[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  dispatches: DispatchedNotification[];
  unreadCount: number;
  isLoading: boolean;
  
  // Cart state & methods
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  cartDiscount: number;
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Orders state & methods
  orders: Order[];
  placeOrder: (options: {
    paymentMethod: PaymentMethod;
    deliveryType: DeliveryType;
    deliveryAddress?: { street: string; city: string; pincode: string };
    pickupStore?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;

  refreshData: () => Promise<void>;
  updateInventoryQuantity: (productId: string, newQty: number, reason?: InventoryActivityLog['reason']) => Promise<void>;
  setStockToZero: (productId: string) => Promise<void>;
  restoreStock: (productId: string, defaultQty?: number) => Promise<void>;
  submitReturn: (data: Parameters<typeof returnService.createReturnRequest>[0]) => Promise<ReturnRequest>;
  updateReturnStatus: (id: string, status: ReturnRequest['status'], notes?: string) => Promise<void>;
  createTicket: (data: Parameters<typeof ticketService.createTicket>[0]) => Promise<SupportTicket>;
  updateTicketStatus: (id: string, status: SupportTicket['status'], staffId?: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'productId'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  logAuditEvent: (event: Parameters<typeof auditService.logEvent>[0]) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  askAssistant: (query: string, userContext?: { customerId?: string; customerName?: string }) => Promise<AssistantResponse>;
  clearConversationMemory: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [activeStore] = useState<Store>(MOCK_STORES[0]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<InventoryActivityLog[]>([]);
  const [inventoryStats, setInventoryStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalUnits: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });
  const [policies, setPolicies] = useState<ReturnPolicy[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [dispatches, setDispatches] = useState<DispatchedNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  // Orders State (initialized with INITIAL_ORDERS)
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  // Multi-turn conversation state memory — full ConversationContext for pronoun resolution
  const conversationMemory = useRef<ConversationContext>({});

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartDiscount = cart.reduce((sum, item) => {
    const mrp = item.product.mrp || item.product.price;
    return sum + (mrp > item.product.price ? (mrp - item.product.price) * item.quantity : 0);
  }, 0);

  const addToCart = (productId: string, quantity: number = 1) => {
    const product = products.find(p => p.id === productId || p.productId === productId);
    if (!product) return;

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { product, quantity, addedAt: new Date().toISOString() }];
      }
    });

    notificationService.dispatchNotification({
      event: 'ADD_TO_CART',
      title: 'Added to Cart',
      message: `${product.name} (${quantity}) added to your shopping cart.`,
      targetRole: 'CUSTOMER'
    }).then(() => refreshData());
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId && item.product.productId !== productId));
  };

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId || item.product.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeOrder = async (options: {
    paymentMethod: PaymentMethod;
    deliveryType: DeliveryType;
    deliveryAddress?: { street: string; city: string; pincode: string };
    pickupStore?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
  }): Promise<Order> => {
    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      brand: item.product.brand,
      category: item.product.category,
      price: item.product.price,
      mrp: item.product.mrp,
      quantity: item.quantity,
      image: item.product.image,
      unit: item.product.unit
    }));

    const subtotal = cartTotal;
    const discount = cartDiscount;
    const deliveryFee = options.deliveryType === 'HOME_DELIVERY' && subtotal < 500 ? 29 : 0;
    const total = subtotal + deliveryFee;

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: orderId,
      customerId: 'cust-1',
      customerName: options.customerName || 'Rahul Sharma',
      customerEmail: options.customerEmail || 'rahul.sharma@example.com',
      customerPhone: options.customerPhone || '+91 98765 43210',
      items: orderItems,
      subtotal,
      discount,
      deliveryFee,
      total,
      status: 'CONFIRMED',
      paymentMethod: options.paymentMethod,
      paymentStatus: 'PAID',
      deliveryType: options.deliveryType,
      deliveryAddress: options.deliveryAddress,
      pickupStore: options.pickupStore,
      createdAt: new Date().toISOString(),
      estimatedDelivery: options.deliveryType === 'HOME_DELIVERY' 
        ? 'Expected Tomorrow by 11:00 AM' 
        : 'Ready for Pickup at ' + (options.pickupStore || activeStore.name)
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();

    // Deduct stock in inventory
    for (const item of orderItems) {
      const currentInv = inventory.find(i => i.productId === item.productId);
      if (currentInv) {
        const newStock = Math.max(0, currentInv.quantity - item.quantity);
        await inventoryService.updateStock(item.productId, newStock, 'Sale');
      }
    }

    // Dispatch order notifications
    await notificationService.dispatchNotification({
      event: 'ORDER_PLACED',
      title: 'Order Confirmed: ' + orderId,
      message: `Your order for ₹${total} (${orderItems.length} items) has been received and confirmed.`,
      targetRole: 'CUSTOMER',
      referenceId: orderId,
      recipientName: options.customerName,
      recipientEmail: options.customerEmail,
      recipientPhone: options.customerPhone
    });

    await auditService.logEvent({
      userId: 'cust-1',
      userName: options.customerName || 'Rahul Sharma',
      role: 'CUSTOMER',
      action: 'PLACE_ORDER',
      entity: 'NOTIFICATION',
      entityId: orderId,
      details: `Placed order ${orderId} for ₹${total} (${orderItems.length} items)`
    });

    await refreshData();
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(ord => (ord.id === orderId ? { ...ord, status } : ord))
    );

    await notificationService.dispatchNotification({
      event: 'ORDER_STATUS_CHANGED',
      title: `Order Status Updated: ${orderId}`,
      message: `Order ${orderId} status changed to ${status}.`,
      targetRole: 'CUSTOMER',
      referenceId: orderId
    });

    await auditService.logEvent({
      userId: 'staff-1',
      userName: 'Staff Member',
      role: 'STAFF',
      action: 'UPDATE_ORDER_STATUS',
      entity: 'NOTIFICATION',
      entityId: orderId,
      details: `Updated order ${orderId} status to ${status}`
    });

    await refreshData();
  };

  const refreshData = async () => {
    try {
      const [prods, invs, logs, stats, pols, rets, tkts, audits, notifs, disp] = await Promise.all([
        productService.getAllProducts(),
        inventoryService.getAllInventory(),
        inventoryService.getInventoryActivityLogs(),
        inventoryService.getInventoryStats(),
        policyService.getAllPolicies(),
        returnService.getAllReturns(),
        ticketService.getAllTickets(),
        auditService.getAllLogs(),
        notificationService.getAllNotifications(),
        notificationService.getDispatchedLogs()
      ]);

      // Sync stock quantities on products with inventory items
      const syncedProducts = prods.map(p => {
        const inv = invs.find(i => i.productId === p.id);
        return inv ? { ...p, stockQuantity: inv.quantity, lastUpdated: inv.lastUpdated } : p;
      });

      setProducts(syncedProducts);
      setInventory(invs);
      setActivityLogs(logs);
      setInventoryStats(stats);
      setPolicies(pols);
      setReturns(rets);
      setTickets(tkts);
      setAuditLogs(audits);
      setNotifications(notifs);
      setDispatches(disp);
    } catch (err) {
      console.error('Error fetching store data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const updateInventoryQuantity = async (
    productId: string, 
    newQty: number, 
    reason: InventoryActivityLog['reason'] = 'Manual update'
  ) => {
    await inventoryService.updateStock(productId, newQty, reason);
    await refreshData();
  };

  const setStockToZero = async (productId: string) => {
    await inventoryService.updateStock(productId, 0, 'Manual update');
    await refreshData();
  };

  const restoreStock = async (productId: string, defaultQty: number = 10) => {
    await inventoryService.updateStock(productId, defaultQty, 'Restock');
    await refreshData();
  };

  const submitReturn = async (data: Parameters<typeof returnService.createReturnRequest>[0]) => {
    const res = await returnService.createReturnRequest(data);
    await refreshData();
    return res;
  };

  const updateReturnStatus = async (id: string, status: ReturnRequest['status'], notes?: string) => {
    await returnService.updateReturnStatus(id, status, notes);
    await refreshData();
  };

  const createTicket = async (data: Parameters<typeof ticketService.createTicket>[0]) => {
    const res = await ticketService.createTicket(data);
    await refreshData();
    return res;
  };

  const updateTicketStatus = async (id: string, status: SupportTicket['status'], staffId?: string) => {
    await ticketService.updateTicketStatus(id, status, staffId);
    await refreshData();
  };

  const addProduct = async (product: Omit<Product, 'id' | 'productId'>) => {
    const res = await productService.createProduct(product);
    await refreshData();
    return res;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const res = await productService.updateProduct(id, updates);
    await refreshData();
    return res;
  };

  const logAuditEvent = async (event: Parameters<typeof auditService.logEvent>[0]) => {
    await auditService.logEvent(event);
    await refreshData();
  };

  const markNotificationAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    await refreshData();
  };

  const markAllNotificationsAsRead = async () => {
    await notificationService.markAllAsRead();
    await refreshData();
  };

  const clearConversationMemory = () => {
    conversationMemory.current = {} as ConversationContext;
  };

  const askAssistant = async (query: string, userContext?: { customerId?: string; customerName?: string }) => {
    const res = await retrievalService.retrieveContext(
      query, 
      userContext, 
      conversationMemory.current
    );

    // Update full conversation memory for multi-turn context resolution
    const mem = conversationMemory.current;

    if (res.matchedProducts && res.matchedProducts.length > 0) {
      mem.lastProduct = res.matchedProducts[0];
      mem.lastProductId = res.matchedProducts[0].id;
      mem.lastProducts = res.matchedProducts;
      // Update category and brand from the matched product
      if (res.matchedProducts[0].category) mem.lastCategory = res.matchedProducts[0].category;
      if (res.matchedProducts[0].brand) mem.lastBrand = res.matchedProducts[0].brand;
    }

    mem.lastIntent = res.intent;

    // Persist filter context for follow-up filter queries
    if (res.entities) {
      // Persist entity-extracted brand and category for multi-turn cheapest/alternatives
      if (res.entities.brandName) mem.lastBrand = res.entities.brandName;
      if (res.entities.category) mem.lastCategory = res.entities.category;

      mem.lastFilters = {
        category: res.entities.category ?? mem.lastFilters?.category,
        brand: res.entities.brandName ?? mem.lastFilters?.brand,
        maxPrice: res.entities.priceLimit ?? mem.lastFilters?.maxPrice,
        minPrice: res.entities.priceLimitMin ?? mem.lastFilters?.minPrice,
        inStockOnly: res.entities.inStockOnly ?? mem.lastFilters?.inStockOnly,
        minQuantity: res.entities.minQuantity ?? mem.lastFilters?.minQuantity,
        aisle: res.entities.aisle ?? mem.lastFilters?.aisle,
      };
    }

    if (res.actionPayload?.type === 'RETURN_APPROVED_CARD' || res.actionPayload?.type === 'TICKET_CREATED_CARD') {
      await refreshData();
    }
    return res;
  };

  return (
    <StoreContext.Provider
      value={{
        activeStore,
        products,
        inventory,
        activityLogs,
        inventoryStats,
        policies,
        returns,
        tickets,
        auditLogs,
        notifications,
        dispatches,
        unreadCount,
        isLoading,
        cart,
        cartCount,
        cartTotal,
        cartDiscount,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        orders,
        placeOrder,
        updateOrderStatus,
        refreshData,
        updateInventoryQuantity,
        setStockToZero,
        restoreStock,
        submitReturn,
        updateReturnStatus,
        createTicket,
        updateTicketStatus,
        addProduct,
        updateProduct,
        logAuditEvent,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        askAssistant,
        clearConversationMemory,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStoreData() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreData must be used within a StoreProvider');
  }
  return context;
}
