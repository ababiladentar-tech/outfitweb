import { UMKMProductPost, MarketplaceOrder, BodyMeasurements } from '@/types';
import { INITIAL_MARKETPLACE_PRODUCTS } from './umkm-products';

const PRODUCTS_STORAGE_KEY = 'outfitly_marketplace_products_v4';
const ORDERS_STORAGE_KEY = 'outfitly_marketplace_orders_v4';
const REPORTS_STORAGE_KEY = 'outfitly_reported_listings_v4';

export interface ListingReport {
  id: string;
  productId: string;
  productTitle: string;
  reporterName: string;
  reason: 'spam' | 'misleading_photo' | 'fake_condition' | 'prohibited_item' | 'inaccurate_measurements' | 'other';
  notes: string;
  createdAt: string;
  status: 'pending' | 'resolved_takedown' | 'dismissed';
}

/**
 * Get all active products from localStorage or fallback to defaults
 */
export function getStoredProducts(): UMKMProductPost[] {
  if (typeof window === 'undefined') return INITIAL_MARKETPLACE_PRODUCTS;
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_MARKETPLACE_PRODUCTS));
      return INITIAL_MARKETPLACE_PRODUCTS;
    }
    const parsed: UMKMProductPost[] = JSON.parse(raw);
    return parsed;
  } catch (e) {
    console.error('Failed to load products from storage:', e);
    return INITIAL_MARKETPLACE_PRODUCTS;
  }
}

/**
 * Save products to localStorage and dispatch update event
 */
export function saveStoredProducts(products: UMKMProductPost[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('outfitly_products_updated', { detail: products }));
  } catch (e) {
    console.error('Failed to save products:', e);
  }
}

/**
 * Add a new product listing (UMKM or Preloved Community)
 */
export function addNewProductListing(newProduct: Omit<UMKMProductPost, 'id' | 'createdAt' | 'likes' | 'saves'>): UMKMProductPost {
  const current = getStoredProducts();
  const created: UMKMProductPost = {
    ...newProduct,
    id: `prod-${Date.now()}`,
    likes: 0,
    saves: 0,
    createdAt: new Date().toISOString()
  };
  const updated = [created, ...current];
  saveStoredProducts(updated);
  return created;
}

/**
 * Update an existing product
 */
export function updateProductListing(updatedProduct: UMKMProductPost): void {
  const current = getStoredProducts();
  const index = current.findIndex(p => p.id === updatedProduct.id);
  if (index !== -1) {
    current[index] = { ...updatedProduct, updatedAt: new Date().toISOString() };
    saveStoredProducts(current);
  }
}

/**
 * Toggle stock availability for a product
 */
export function toggleProductStock(productId: string): void {
  const current = getStoredProducts();
  const item = current.find(p => p.id === productId);
  if (item) {
    item.isAvailable = !item.isAvailable;
    if (!item.isAvailable) {
      item.stockCount = 0;
    } else if (item.stockCount === 0) {
      item.stockCount = item.isOneOfAKind ? 1 : 10;
    }
    saveStoredProducts(current);
  }
}

/**
 * Delete a product listing
 */
export function deleteProductListing(productId: string): void {
  const current = getStoredProducts();
  const filtered = current.filter(p => p.id !== productId);
  saveStoredProducts(filtered);
}

// ----------------- ORDERS MANAGEMENT -----------------

export function getStoredOrders(): MarketplaceOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredOrders(orders: MarketplaceOrder[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('outfitly_orders_updated', { detail: orders }));
  } catch (e) {}
}

export function createOrder(orderData: Omit<MarketplaceOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'estimatedDelivery'>): MarketplaceOrder {
  const current = getStoredOrders();
  const now = new Date();
  const deliveryDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days estimation

  const order: MarketplaceOrder = {
    ...orderData,
    id: `ord-${Date.now()}`,
    orderNumber: `OFY-${Date.now().toString().slice(-6)}`,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    estimatedDelivery: deliveryDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  };

  const updated = [order, ...current];
  saveStoredOrders(updated);

  // If one of a kind, auto decrement stock & mark unavailable
  if (order.product.isOneOfAKind) {
    const products = getStoredProducts();
    const target = products.find(p => p.id === order.product.id);
    if (target) {
      target.stockCount = 0;
      target.isAvailable = false;
      saveStoredProducts(products);
    }
  }

  return order;
}

export function updateOrderStatus(
  orderId: string, 
  newStatus: MarketplaceOrder['orderStatus'],
  extra?: { trackingNumber?: string; review?: MarketplaceOrder['review'] }
): void {
  const current = getStoredOrders();
  const order = current.find(o => o.id === orderId);
  if (order) {
    order.orderStatus = newStatus;
    order.updatedAt = new Date().toISOString();
    if (extra?.trackingNumber) order.trackingNumber = extra.trackingNumber;
    if (extra?.review) order.review = extra.review;
    if (newStatus === 'completed') {
      order.escrowStatus = 'released_to_seller';
    } else if (newStatus === 'cancelled') {
      order.escrowStatus = 'refunded';
    }
    saveStoredOrders(current);
  }
}

// ----------------- REPORTING & MODERATION -----------------

export function getStoredReports(): ListingReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveStoredReports(reports: ListingReport[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    window.dispatchEvent(new CustomEvent('outfitly_reports_updated', { detail: reports }));
  } catch (e) {}
}

export function reportProductListing(
  productId: string, 
  productTitle: string, 
  reporterName: string, 
  reason: ListingReport['reason'], 
  notes: string
): void {
  const reports = getStoredReports();
  const newReport: ListingReport = {
    id: `rep-${Date.now()}`,
    productId,
    productTitle,
    reporterName,
    reason,
    notes,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  saveStoredReports([newReport, ...reports]);

  // Mark product as reported
  const products = getStoredProducts();
  const target = products.find(p => p.id === productId);
  if (target) {
    target.isReported = true;
    saveStoredProducts(products);
  }
}

export function moderateProductListing(reportId: string, action: 'takedown' | 'dismiss'): void {
  const reports = getStoredReports();
  const rep = reports.find(r => r.id === reportId);
  if (rep) {
    rep.status = action === 'takedown' ? 'resolved_takedown' : 'dismissed';
    saveStoredReports(reports);

    if (action === 'takedown') {
      const products = getStoredProducts();
      const target = products.find(p => p.id === rep.productId);
      if (target) {
        target.isModerated = true;
        target.isAvailable = false;
        saveStoredProducts(products);
      }
    }
  }
}
