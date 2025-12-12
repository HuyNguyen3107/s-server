/**
 * ============================================
 * HỆ THỐNG QUYỀN HẠN - PERMISSION SYSTEM
 * ============================================
 * Format: module.action
 * Ví dụ: users.view, orders.create
 *
 * LƯU Ý: File này chứa TẤT CẢ các quyền THỰC SỰ ĐƯỢC SỬ DỤNG trong hệ thống
 * Không thêm quyền thừa không có trong API
 */

// ============================================
// QUYỀN QUẢN LÝ NGƯỜI DÙNG
// ============================================
export const USER_PERMISSIONS = {
  VIEW: 'users.view',
  CREATE: 'users.create',
  UPDATE: 'users.update',
  DELETE: 'users.delete',
  LIST: 'users.list',
  MANAGE: 'users.manage', // Quản lý toàn bộ người dùng
};

// ============================================
// QUYỀN QUẢN LÝ VAI TRÒ
// ============================================
export const ROLE_PERMISSIONS = {
  VIEW: 'roles.view',
  CREATE: 'roles.create',
  UPDATE: 'roles.update',
  DELETE: 'roles.delete',
  LIST: 'roles.list',
  MANAGE: 'roles.manage', // Quản lý toàn bộ vai trò
};

// ============================================
// QUYỀN QUẢN LÝ QUYỀN HẠN
// ============================================
export const PERMISSION_PERMISSIONS = {
  VIEW: 'permissions.view',
  CREATE: 'permissions.create',
  UPDATE: 'permissions.update',
  DELETE: 'permissions.delete',
  LIST: 'permissions.list',
  MANAGE: 'permissions.manage', // Quản lý toàn bộ quyền
};

// ============================================
// QUYỀN GÁN VAI TRÒ CHO NGƯỜI DÙNG
// ============================================
export const USER_ROLE_PERMISSIONS = {
  VIEW: 'user-roles.view',
  ASSIGN: 'user-roles.assign',
  REVOKE: 'user-roles.revoke',
  MANAGE: 'user-roles.manage',
};

// ============================================
// QUYỀN GÁN QUYỀN CHO VAI TRÒ
// ============================================
export const ROLE_PERMISSION_PERMISSIONS = {
  VIEW: 'role-permissions.view',
  ASSIGN: 'role-permissions.assign',
  REVOKE: 'role-permissions.revoke',
  MANAGE: 'role-permissions.manage',
};

// ============================================
// QUYỀN QUẢN LÝ BỘ SƯU TẬP
// ============================================
export const COLLECTION_PERMISSIONS = {
  VIEW: 'collections.view',
  CREATE: 'collections.create',
  UPDATE: 'collections.update',
  DELETE: 'collections.delete',
  MANAGE: 'collections.manage',
};

// ============================================
// QUYỀN QUẢN LÝ SẢN PHẨM
// ============================================
export const PRODUCT_PERMISSIONS = {
  VIEW: 'products.view',
  CREATE: 'products.create',
  UPDATE: 'products.update',
  DELETE: 'products.delete',
  MANAGE: 'products.manage',
};

// ============================================
// QUYỀN QUẢN LÝ BIẾN THỂ SẢN PHẨM
// ============================================
export const PRODUCT_VARIANT_PERMISSIONS = {
  VIEW: 'product-variants.view',
  CREATE: 'product-variants.create',
  UPDATE: 'product-variants.update',
  DELETE: 'product-variants.delete',
  MANAGE: 'product-variants.manage',
};

// ============================================
// QUYỀN QUẢN LÝ DANH MỤC SẢN PHẨM
// ============================================
export const PRODUCT_CATEGORY_PERMISSIONS = {
  VIEW: 'product-categories.view',
  CREATE: 'product-categories.create',
  UPDATE: 'product-categories.update',
  DELETE: 'product-categories.delete',
  MANAGE: 'product-categories.manage',
};

// ============================================
// QUYỀN QUẢN LÝ SẢN PHẨM TÙY CHỈNH
// ============================================
export const PRODUCT_CUSTOM_PERMISSIONS = {
  VIEW: 'product-customs.view',
  CREATE: 'product-customs.create',
  UPDATE: 'product-customs.update',
  DELETE: 'product-customs.delete',
  MANAGE: 'product-customs.manage',
};

// ============================================
// QUYỀN QUẢN LÝ BACKGROUND
// ============================================
export const BACKGROUND_PERMISSIONS = {
  VIEW: 'backgrounds.view',
  CREATE: 'backgrounds.create',
  UPDATE: 'backgrounds.update',
  DELETE: 'backgrounds.delete',
  MANAGE: 'backgrounds.manage',
};

// ============================================
// QUYỀN QUẢN LÝ ĐƠN HÀNG
// ============================================
export const ORDER_PERMISSIONS = {
  VIEW: 'orders.view',
  UPDATE: 'orders.update',
  DELETE: 'orders.delete',
  LIST: 'orders.list',
  MANAGE: 'orders.manage',
  ASSIGN: 'orders.assign', // Nhận xử lý đơn hàng
  UPDATE_STATUS: 'orders.update-status', // Cập nhật trạng thái
  TRANSFER: 'orders.transfer', // Chuyển đơn hàng
};

// ============================================
// QUYỀN QUẢN LÝ KHO HÀNG
// ============================================
export const INVENTORY_PERMISSIONS = {
  VIEW: 'inventory.view',
  CREATE: 'inventory.create',
  UPDATE: 'inventory.update',
  DELETE: 'inventory.delete',
  LIST: 'inventory.list',
  MANAGE: 'inventory.manage',
  ADJUST: 'inventory.adjust', // Điều chỉnh số lượng
  RESERVE: 'inventory.reserve', // Đặt trước hàng
  REPORT: 'inventory.report', // Xem báo cáo kho
};

// ============================================
// QUYỀN QUẢN LÝ KHUYẾN MÃI
// ============================================
export const PROMOTION_PERMISSIONS = {
  VIEW: 'promotions.view',
  CREATE: 'promotions.create',
  UPDATE: 'promotions.update',
  DELETE: 'promotions.delete',
  LIST: 'promotions.list',
  MANAGE: 'promotions.manage',
};

// ============================================
// QUYỀN QUẢN LÝ PHÍ VẬN CHUYỂN
// ============================================
export const SHIPPING_FEE_PERMISSIONS = {
  VIEW: 'shipping-fees.view',
  CREATE: 'shipping-fees.create',
  UPDATE: 'shipping-fees.update',
  DELETE: 'shipping-fees.delete',
  MANAGE: 'shipping-fees.manage',
};

// ============================================
// QUYỀN QUẢN LÝ PHẢN HỒI
// ============================================
export const FEEDBACK_PERMISSIONS = {
  VIEW: 'feedbacks.view',
  UPDATE: 'feedbacks.update',
  DELETE: 'feedbacks.delete',
  MANAGE: 'feedbacks.manage',
  RESPOND: 'feedbacks.respond', // Phản hồi
};

// ============================================
// QUYỀN QUẢN LÝ TƯ VẤN
// ============================================
export const CONSULTATION_PERMISSIONS = {
  VIEW: 'consultations.view',
  LIST: 'consultations.list',
  UPDATE: 'consultations.update',
  DELETE: 'consultations.delete',
  MANAGE: 'consultations.manage',
};

// ============================================
// QUYỀN QUẢN LÝ THÔNG TIN (PAGES)
// ============================================
export const INFORMATION_PERMISSIONS = {
  VIEW: 'informations.view',
  CREATE: 'informations.create',
  UPDATE: 'informations.update',
  DELETE: 'informations.delete',
  MANAGE: 'informations.manage',
};

// ============================================
// QUYỀN QUẢN LÝ UPLOAD
// ============================================
export const UPLOAD_PERMISSIONS = {
  CREATE: 'upload.create',
  DELETE: 'upload.delete',
  MANAGE: 'upload.manage',
};

// ============================================
// TẤT CẢ QUYỀN - GROUPED
// ============================================
export const PERMISSION_GROUPS = {
  USER: Object.values(USER_PERMISSIONS),
  ROLE: Object.values(ROLE_PERMISSIONS),
  PERMISSION: Object.values(PERMISSION_PERMISSIONS),
  USER_ROLE: Object.values(USER_ROLE_PERMISSIONS),
  ROLE_PERMISSION: Object.values(ROLE_PERMISSION_PERMISSIONS),
  COLLECTION: Object.values(COLLECTION_PERMISSIONS),
  PRODUCT: Object.values(PRODUCT_PERMISSIONS),
  PRODUCT_VARIANT: Object.values(PRODUCT_VARIANT_PERMISSIONS),
  PRODUCT_CATEGORY: Object.values(PRODUCT_CATEGORY_PERMISSIONS),
  PRODUCT_CUSTOM: Object.values(PRODUCT_CUSTOM_PERMISSIONS),
  BACKGROUND: Object.values(BACKGROUND_PERMISSIONS),
  ORDER: Object.values(ORDER_PERMISSIONS),
  INVENTORY: Object.values(INVENTORY_PERMISSIONS),
  PROMOTION: Object.values(PROMOTION_PERMISSIONS),
  SHIPPING_FEE: Object.values(SHIPPING_FEE_PERMISSIONS),
  FEEDBACK: Object.values(FEEDBACK_PERMISSIONS),
  CONSULTATION: Object.values(CONSULTATION_PERMISSIONS),
  INFORMATION: Object.values(INFORMATION_PERMISSIONS),
  UPLOAD: Object.values(UPLOAD_PERMISSIONS),
};

// ============================================
// TẤT CẢ QUYỀN - FLAT ARRAY
// ============================================
export const ALL_PERMISSIONS = Object.values(PERMISSION_GROUPS).flat();

// ============================================
// DEFAULT ROLE PERMISSIONS
// ============================================

// Quyền cho Super Admin - TẤT CẢ QUYỀN
export const SUPER_ADMIN_PERMISSIONS = ALL_PERMISSIONS;

// Quyền cho Admin - Hầu hết quyền
export const ADMIN_PERMISSIONS = [
  ...PERMISSION_GROUPS.USER,
  ...PERMISSION_GROUPS.ROLE,
  ...PERMISSION_GROUPS.PERMISSION,
  ...PERMISSION_GROUPS.USER_ROLE,
  ...PERMISSION_GROUPS.ROLE_PERMISSION,
  ...PERMISSION_GROUPS.COLLECTION,
  ...PERMISSION_GROUPS.PRODUCT,
  ...PERMISSION_GROUPS.PRODUCT_VARIANT,
  ...PERMISSION_GROUPS.PRODUCT_CATEGORY,
  ...PERMISSION_GROUPS.PRODUCT_CUSTOM,
  ...PERMISSION_GROUPS.BACKGROUND,
  ...PERMISSION_GROUPS.ORDER,
  ...PERMISSION_GROUPS.INVENTORY,
  ...PERMISSION_GROUPS.PROMOTION,
  ...PERMISSION_GROUPS.SHIPPING_FEE,
  ...PERMISSION_GROUPS.FEEDBACK,
  ...PERMISSION_GROUPS.CONSULTATION,
  ...PERMISSION_GROUPS.INFORMATION,
  ...PERMISSION_GROUPS.UPLOAD,
];

// Quyền cho Staff - Quản lý đơn hàng và sản phẩm cơ bản
export const STAFF_PERMISSIONS = [
  // Xem người dùng
  USER_PERMISSIONS.VIEW,
  USER_PERMISSIONS.LIST,
  // Xem vai trò
  ROLE_PERMISSIONS.VIEW,
  ROLE_PERMISSIONS.LIST,
  // Xem sản phẩm
  COLLECTION_PERMISSIONS.VIEW,
  PRODUCT_PERMISSIONS.VIEW,
  PRODUCT_VARIANT_PERMISSIONS.VIEW,
  PRODUCT_CATEGORY_PERMISSIONS.VIEW,
  PRODUCT_CUSTOM_PERMISSIONS.VIEW,
  BACKGROUND_PERMISSIONS.VIEW,
  // Quản lý đơn hàng
  ...PERMISSION_GROUPS.ORDER,
  // Quản lý kho cơ bản
  INVENTORY_PERMISSIONS.VIEW,
  INVENTORY_PERMISSIONS.LIST,
  INVENTORY_PERMISSIONS.UPDATE,
  INVENTORY_PERMISSIONS.ADJUST,
  // Xem khuyến mãi
  PROMOTION_PERMISSIONS.VIEW,
  PROMOTION_PERMISSIONS.LIST,
  // Xem phí vận chuyển
  SHIPPING_FEE_PERMISSIONS.VIEW,
  // Quản lý phản hồi
  ...PERMISSION_GROUPS.FEEDBACK,
  // Quản lý tư vấn
  ...PERMISSION_GROUPS.CONSULTATION,
  // Xem thông tin
  INFORMATION_PERMISSIONS.VIEW,
  // Upload
  UPLOAD_PERMISSIONS.CREATE,
];

// Quyền cho Viewer - Chỉ xem
export const VIEWER_PERMISSIONS = [
  USER_PERMISSIONS.VIEW,
  ROLE_PERMISSIONS.VIEW,
  COLLECTION_PERMISSIONS.VIEW,
  PRODUCT_PERMISSIONS.VIEW,
  PRODUCT_VARIANT_PERMISSIONS.VIEW,
  PRODUCT_CATEGORY_PERMISSIONS.VIEW,
  PRODUCT_CUSTOM_PERMISSIONS.VIEW,
  BACKGROUND_PERMISSIONS.VIEW,
  ORDER_PERMISSIONS.VIEW,
  ORDER_PERMISSIONS.LIST,
  INVENTORY_PERMISSIONS.VIEW,
  INVENTORY_PERMISSIONS.LIST,
  PROMOTION_PERMISSIONS.VIEW,
  PROMOTION_PERMISSIONS.LIST,
  SHIPPING_FEE_PERMISSIONS.VIEW,
  FEEDBACK_PERMISSIONS.VIEW,
  CONSULTATION_PERMISSIONS.VIEW,
  CONSULTATION_PERMISSIONS.LIST,
  INFORMATION_PERMISSIONS.VIEW,
];
