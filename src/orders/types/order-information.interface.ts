/**
 * Interface cho cấu trúc thông tin đơn hàng lưu trong field information của bảng orders
 * Lưu toàn bộ thông tin mà khách hàng đã chọn
 */

export interface OrderInformation {
  // Mã đơn hàng tự động tạo
  orderCode: string;

  // Thông tin bộ sưu tập (lưu ID hoặc toàn bộ thông tin)
  collection?: {
    id: string;
    name?: string;
    imageUrl?: string;
    routeName?: string;
  };

  // Thông tin sản phẩm (lưu ID hoặc toàn bộ thông tin)
  product: {
    id: string;
    name?: string;
    hasBg?: boolean;
  };

  // Thông tin biến thể sản phẩm (lưu ID hoặc toàn bộ thông tin)
  variant: {
    id: string;
    name?: string;
    description?: string;
    price: number;
    endow?: any; // Ưu đãi kèm theo
    option?: any; // Cấu hình các tùy chọn
    config?: any; // Cấu hình variant
  };

  // Các tùy chọn đã chọn (từ variant.option)
  selectedOptions?: Array<{
    id: string;
    name?: string;
    description?: string;
    price: number;
  }>;

  // Số lượng tùy chỉnh (nếu có)
  customQuantities?: Record<string, number>;

  // Sản phẩm tùy chỉnh theo danh mục
  // Key: categoryId, Value: danh sách sản phẩm tùy chỉnh
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
        totalPrice: number; // quantity * price
      }>;
    }
  >;

  // Tùy chỉnh nhiều sản phẩm (multi-item)
  // Key: itemIndex, Value: customizations cho từng item
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

  // Thông tin background đã chọn và dữ liệu form tùy chỉnh
  // ⭐ QUAN TRỌNG: Lưu toàn bộ các trường và giá trị khách hàng nhập
  // Bao gồm: Họ tên người đặt, Tên IG/FB người đặt, Link IG/FB đặt mua,
  //          Họ tên người nhận, Tên IG/FB người nhận, Link IG/FB người nhận, v.v...
  background?: {
    // Thông tin background
    backgroundId: string;
    backgroundName?: string;
    backgroundDescription?: string;
    backgroundImageUrl?: string;
    backgroundPrice?: number;

    // Cấu hình form (config từ background.config)
    // Lưu lại để biết cấu trúc form khi đặt hàng
    formConfig?: {
      fields: Array<{
        id: string;
        type: string; // text, textarea, select, radio, checkbox, file, date, etc.
        title: string; // "HỌ TÊN (NGƯỜI ĐẶT)", "TÊN IG/FB (NGƯỜI ĐẶT)", etc.
        placeholder?: string;
        required?: boolean;
        validation?: any;
        options?: Array<{
          label: string;
          value: string;
        }>;
      }>;
    };

    // Dữ liệu form mà khách hàng đã nhập
    // ⭐ Lưu toàn bộ các trường và giá trị
    formData: {
      // Mỗi field sẽ có fieldId, fieldTitle (tên hiển thị), và value (giá trị khách nhập)
      values: Array<{
        fieldId: string; // ID của field trong config
        fieldTitle: string; // Tên hiển thị: "HỌ TÊN (NGƯỜI ĐẶT)", "TÊN IG/FB (NGƯỜI ĐẶT)", etc.
        fieldType: string; // Loại field: text, textarea, select, etc.
        value: any; // Giá trị khách hàng nhập/chọn
        otherValue?: string; // Nếu có option "Khác" thì lưu giá trị tùy chỉnh
      }>;
    };
  };

  // Thông tin liên hệ nhanh (trích từ form background nếu có)
  contactInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };

  // Thông tin phí vận chuyển (lưu ID hoặc toàn bộ thông tin)
  shipping?: {
    shippingId: string;
    shippingType?: string;
    area?: string;
    estimatedDeliveryTime?: string;
    shippingFee: number;
    notes?: string;
    vtpCode?: string;
  };

  // Thông tin mã giảm giá (nếu có) - lưu ID hoặc toàn bộ thông tin
  promotion?: {
    promotionId: string;
    promoCode?: string;
    title?: string;
    description?: string;
    type?: string; // PERCENTAGE | FIXED_AMOUNT
    value?: number;
    discountAmount: number; // Số tiền giảm thực tế
  };

  // Tổng hợp giá
  pricing: {
    productPrice: number; // Giá variant
    optionsPrice: number; // Tổng giá các tùy chọn
    customProductsPrice: number; // Tổng giá sản phẩm tùy chỉnh
    backgroundPrice: number; // Giá background (nếu có)
    subtotal: number; // Tổng tạm tính (trước shipping và giảm giá)
    shippingFee: number;
    discountAmount: number; // Số tiền giảm giá
    total: number; // Tổng cuối cùng
  };

  // Metadata
  metadata?: {
    orderSource?: string; // web, mobile, admin
    ipAddress?: string;
    userAgent?: string;
    createdAt: string; // ISO timestamp
    statusHistory?: Array<{
      from: string;
      to: string;
      at: string; // ISO timestamp
    }>;
  };
}
