/**
 * Enum representing the type of order.
 * MARKETPLACE: Orders placed through a marketplace (e.g., Facebook, WhatsApp)
 * MERCHANT: Orders placed directly by merchants (bulk orders)
 */
export enum OrderType {
  MARKETPLACE = 'MARKETPLACE',
  MERCHANT = 'MERCHANT'
}

export const ORDER_TYPE_DISPLAY = {
  [OrderType.MARKETPLACE]: 'Marketplace',
  [OrderType.MERCHANT]: 'Merchant'
};

export const ORDER_TYPE_OPTIONS = [
  { value: OrderType.MARKETPLACE, label: 'Marketplace' },
  { value: OrderType.MERCHANT, label: 'Merchant' }
];
