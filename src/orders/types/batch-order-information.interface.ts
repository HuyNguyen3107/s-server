/**
 * Interface cho cấu trúc thông tin đơn hàng BATCH (nhiều sản phẩm)
 * Lưu trong field information của bảng orders
 */

// Thông tin từng item trong batch order
export interface BatchOrderItem {
  // Index của item trong đơn hàng
  itemIndex: number;

  // Thông tin bộ sưu tập
  collection?: {
    id: string;
    name?: string;
    imageUrl?: string;
    routeName?: string;
  };

  // Thông tin sản phẩm
  product: {
    id: string;
    name?: string;
    hasBg?: boolean;
  };

  // Thông tin biến thể sản phẩm
  variant: {
    id: string;
    name?: string;
    description?: string;
    price: number;
    endow?: any;
    option?: any;
    config?: any;
  };

  // Các tùy chọn đã chọn
  selectedOptions?: Array<{
    id: string;
    name?: string;
    description?: string;
    price: number;
  }>;

  // Số lượng tùy chỉnh
  customQuantities?: Record<string, number>;

  // Sản phẩm tùy chỉnh theo danh mục
  selectedCategoryProducts?: Record<
    string,
    {
      categoryId: string;
      categoryName?: string;
      products: Array<{
        productCustomId: string;
        productCustomName?: string;
        productCustomImage?: string;
        productCustomDescription?: string;
        quantity: number;
        price: number;
        totalPrice: number;
      }>;
    }
  >;

  // Tùy chỉnh nhiều sản phẩm
  multiItemCustomizations?: Record<
    number,
    Record<
      string,
      {
        categoryId: string;
        categoryName?: string;
        products: Array<{
          productCustomId: string;
          productCustomName?: string;
          productCustomImage?: string;
          productCustomDescription?: string;
          quantity: number;
          price: number;
          totalPrice: number;
        }>;
      }
    >
  >;

  // Thông tin background
  background?: {
    backgroundId: string;
    backgroundName?: string;
    backgroundDescription?: string;
    backgroundImageUrl?: string;
    backgroundPrice?: number;
    formConfig?: {
      fields: Array<{
        id: string;
        type: string;
        title: string;
        placeholder?: string;
        required?: boolean;
        validation?: any;
        options?: Array<{
          label: string;
          value: string;
        }>;
      }>;
    };
    formData?: {
      values: Array<{
        fieldId: string;
        fieldTitle: string;
        fieldType: string;
        value: any;
        otherValue?: string;
      }>;
    };
  };

  // Pricing của item này
  pricing: {
    productPrice: number;
    optionsPrice: number;
    customProductsPrice: number;
    backgroundPrice: number;
    itemSubtotal: number; // Tổng của item này
  };

  // Metadata riêng của item
  metadata?: {
    orderSource?: string;
    userAgent?: string;
  };
}

// Thông tin đơn hàng batch
export interface BatchOrderInformation {
  // Mã đơn hàng
  orderCode: string;

  // Flag đánh dấu đây là batch order
  isBatchOrder: true;

  // Số lượng items trong đơn
  itemCount: number;

  // Thông tin khách hàng (chung cho cả đơn)
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
  };

  // Danh sách các items trong đơn hàng
  items: BatchOrderItem[];

  // Thông tin shipping (chung cho cả đơn)
  shipping: {
    shippingId: string;
    shippingType?: string;
    area?: string;
    estimatedDeliveryTime?: string;
    shippingFee: number;
    notes?: string;
    vtpCode?: string;
  };

  // Thông tin mã giảm giá (áp dụng cho cả đơn)
  promotion?: {
    promotionId: string;
    promoCode?: string;
    title?: string;
    description?: string;
    type?: string;
    value?: number;
    discountAmount: number;
  };

  // Tổng hợp pricing cho cả đơn
  pricing: {
    itemsSubtotal: number; // Tổng subtotal của tất cả items
    shippingFee: number;
    discountAmount: number;
    total: number;
  };

  // Metadata
  metadata?: {
    orderSource?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    statusHistory?: Array<{
      from: string;
      to: string;
      at: string;
    }>;
  };
}

// Helper type để phân biệt single order và batch order
export type OrderInformationType =
  | import('./order-information.interface').OrderInformation
  | BatchOrderInformation;

// Type guard để check batch order
export function isBatchOrder(
  info: OrderInformationType,
): info is BatchOrderInformation {
  return (info as BatchOrderInformation).isBatchOrder === true;
}
