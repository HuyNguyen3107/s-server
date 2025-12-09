/**
 * ============================================
 * HỆ THỐNG QUYỀN HẠN - PERMISSION SYSTEM
 * ============================================
 * Format: module.action
 * Ví dụ: users.view, orders.create
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
// QUYỀN GÁN QUYỀN TRỰC TIẾP CHO NGƯỜI DÙNG
// ============================================
export const USER_PERMISSION_PERMISSIONS = {
  VIEW: 'user-permissions.view',
  ASSIGN: 'user-permissions.assign',
  REVOKE: 'user-permissions.revoke',
  MANAGE: 'user-permissions.manage',
};

// ============================================
// QUYỀN QUẢN LÝ BỘ SƯU TẬP
// ============================================
export const COLLECTION_PERMISSIONS = {
  VIEW: 'collections.view',
  CREATE: 'collections.create',
  UPDATE: 'collections.update',
  DELETE: 'collections.delete',
  LIST: 'collections.list',
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
  LIST: 'products.list',
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
  LIST: 'product-variants.list',
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
  LIST: 'product-categories.list',
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
  LIST: 'product-customs.list',
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
  LIST: 'backgrounds.list',
  MANAGE: 'backgrounds.manage',
};

// ============================================
// QUYỀN QUẢN LÝ ĐƠN HÀNG
// ============================================
export const ORDER_PERMISSIONS = {
  VIEW: 'orders.view',
  CREATE: 'orders.create',
  UPDATE: 'orders.update',
  DELETE: 'orders.delete',
  LIST: 'orders.list',
  MANAGE: 'orders.manage',
  ASSIGN: 'orders.assign', // Nhận xử lý đơn hàng
  UPDATE_STATUS: 'orders.update-status', // Cập nhật trạng thái
  TRANSFER: 'orders.transfer', // Chuyển đơn hàng
  EXPORT: 'orders.export', // Xuất dữ liệu đơn hàng
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
  VALIDATE: 'promotions.validate', // Kiểm tra mã khuyến mãi
};

// ============================================
// QUYỀN QUẢN LÝ PHÍ VẬN CHUYỂN
// ============================================
export const SHIPPING_FEE_PERMISSIONS = {
  VIEW: 'shipping-fees.view',
  CREATE: 'shipping-fees.create',
  UPDATE: 'shipping-fees.update',
  DELETE: 'shipping-fees.delete',
  LIST: 'shipping-fees.list',
  MANAGE: 'shipping-fees.manage',
};

// ============================================
// QUYỀN QUẢN LÝ PHẢN HỒI
// ============================================
export const FEEDBACK_PERMISSIONS = {
  VIEW: 'feedbacks.view',
  CREATE: 'feedbacks.create',
  UPDATE: 'feedbacks.update',
  DELETE: 'feedbacks.delete',
  LIST: 'feedbacks.list',
  MANAGE: 'feedbacks.manage',
  RESPOND: 'feedbacks.respond', // Phản hồi
};

// ============================================
// QUYỀN QUẢN LÝ TƯ VẤN
// ============================================
export const CONSULTATION_PERMISSIONS = {
  VIEW: 'consultations.view',
  CREATE: 'consultations.create',
  UPDATE: 'consultations.update',
  DELETE: 'consultations.delete',
  LIST: 'consultations.list',
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
  LIST: 'informations.list',
  MANAGE: 'informations.manage',
};

// ============================================
// QUYỀN QUẢN LÝ THÔNG BÁO
// ============================================
export const NOTIFICATION_PERMISSIONS = {
  VIEW: 'notifications.view',
  CREATE: 'notifications.create',
  UPDATE: 'notifications.update',
  DELETE: 'notifications.delete',
  LIST: 'notifications.list',
  MANAGE: 'notifications.manage',
  SEND: 'notifications.send', // Gửi thông báo
};

// ============================================
// QUYỀN QUẢN LÝ UPLOAD
// ============================================
export const UPLOAD_PERMISSIONS = {
  VIEW: 'upload.view',
  CREATE: 'upload.create',
  DELETE: 'upload.delete',
  MANAGE: 'upload.manage',
};

// ============================================
// QUYỀN BÁO CÁO & THỐNG KÊ
// ============================================
export const REPORT_PERMISSIONS = {
  VIEW: 'reports.view',
  ORDERS: 'reports.orders', // Báo cáo đơn hàng
  INVENTORY: 'reports.inventory', // Báo cáo kho
  REVENUE: 'reports.revenue', // Báo cáo doanh thu
  USERS: 'reports.users', // Báo cáo người dùng
  EXPORT: 'reports.export', // Xuất báo cáo
  MANAGE: 'reports.manage',
};

// ============================================
// QUYỀN CÀI ĐẶT HỆ THỐNG
// ============================================
export const SETTINGS_PERMISSIONS = {
  VIEW: 'settings.view',
  UPDATE: 'settings.update',
  MANAGE: 'settings.manage',
};

// ============================================
// QUYỀN HỆ THỐNG (SUPER ADMIN)
// ============================================
export const SYSTEM_PERMISSIONS = {
  ADMIN: 'system.admin', // Full quyền hệ thống
  CONFIG: 'system.config', // Cấu hình hệ thống
  BACKUP: 'system.backup', // Sao lưu dữ liệu
  RESTORE: 'system.restore', // Khôi phục dữ liệu
  LOGS: 'system.logs', // Xem logs
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
  USER_PERMISSION: Object.values(USER_PERMISSION_PERMISSIONS),
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
  NOTIFICATION: Object.values(NOTIFICATION_PERMISSIONS),
  UPLOAD: Object.values(UPLOAD_PERMISSIONS),
  REPORT: Object.values(REPORT_PERMISSIONS),
  SETTINGS: Object.values(SETTINGS_PERMISSIONS),
  SYSTEM: Object.values(SYSTEM_PERMISSIONS),
};

// ============================================
// TẤT CẢ QUYỀN - FLAT ARRAY
// ============================================
export const ALL_PERMISSIONS = Object.values(PERMISSION_GROUPS).flat();

// ============================================
// LEGACY SUPPORT - Tương thích ngược
// ============================================
export const COMMON_PERMISSIONS = {
  // User permissions
  USER_CREATE: USER_PERMISSIONS.CREATE,
  USER_READ: USER_PERMISSIONS.VIEW,
  USER_UPDATE: USER_PERMISSIONS.UPDATE,
  USER_DELETE: USER_PERMISSIONS.DELETE,
  USER_LIST: USER_PERMISSIONS.LIST,

  // Role permissions
  ROLE_CREATE: ROLE_PERMISSIONS.CREATE,
  ROLE_READ: ROLE_PERMISSIONS.VIEW,
  ROLE_UPDATE: ROLE_PERMISSIONS.UPDATE,
  ROLE_DELETE: ROLE_PERMISSIONS.DELETE,
  ROLE_LIST: ROLE_PERMISSIONS.LIST,

  // Permission permissions
  PERMISSION_CREATE: PERMISSION_PERMISSIONS.CREATE,
  PERMISSION_READ: PERMISSION_PERMISSIONS.VIEW,
  PERMISSION_UPDATE: PERMISSION_PERMISSIONS.UPDATE,
  PERMISSION_DELETE: PERMISSION_PERMISSIONS.DELETE,
  PERMISSION_LIST: PERMISSION_PERMISSIONS.LIST,

  // Product permissions
  PRODUCT_CREATE: PRODUCT_PERMISSIONS.CREATE,
  PRODUCT_READ: PRODUCT_PERMISSIONS.VIEW,
  PRODUCT_UPDATE: PRODUCT_PERMISSIONS.UPDATE,
  PRODUCT_DELETE: PRODUCT_PERMISSIONS.DELETE,
  PRODUCT_LIST: PRODUCT_PERMISSIONS.LIST,

  // Collection permissions
  COLLECTION_CREATE: COLLECTION_PERMISSIONS.CREATE,
  COLLECTION_READ: COLLECTION_PERMISSIONS.VIEW,
  COLLECTION_UPDATE: COLLECTION_PERMISSIONS.UPDATE,
  COLLECTION_DELETE: COLLECTION_PERMISSIONS.DELETE,
  COLLECTION_LIST: COLLECTION_PERMISSIONS.LIST,

  // Order permissions
  ORDER_CREATE: ORDER_PERMISSIONS.CREATE,
  ORDER_READ: ORDER_PERMISSIONS.VIEW,
  ORDER_UPDATE: ORDER_PERMISSIONS.UPDATE,
  ORDER_DELETE: ORDER_PERMISSIONS.DELETE,
  ORDER_LIST: ORDER_PERMISSIONS.LIST,
  ORDER_MANAGE: ORDER_PERMISSIONS.MANAGE,

  // Inventory permissions
  INVENTORY_READ: INVENTORY_PERMISSIONS.VIEW,
  INVENTORY_UPDATE: INVENTORY_PERMISSIONS.UPDATE,
  INVENTORY_MANAGE: INVENTORY_PERMISSIONS.MANAGE,

  // Promotion permissions
  PROMOTION_CREATE: PROMOTION_PERMISSIONS.CREATE,
  PROMOTION_READ: PROMOTION_PERMISSIONS.VIEW,
  PROMOTION_UPDATE: PROMOTION_PERMISSIONS.UPDATE,
  PROMOTION_DELETE: PROMOTION_PERMISSIONS.DELETE,
  PROMOTION_LIST: PROMOTION_PERMISSIONS.LIST,

  // Feedback permissions
  FEEDBACK_READ: FEEDBACK_PERMISSIONS.VIEW,
  FEEDBACK_UPDATE: FEEDBACK_PERMISSIONS.UPDATE,
  FEEDBACK_DELETE: FEEDBACK_PERMISSIONS.DELETE,
  FEEDBACK_LIST: FEEDBACK_PERMISSIONS.LIST,

  // Information permissions
  INFORMATION_CREATE: INFORMATION_PERMISSIONS.CREATE,
  INFORMATION_READ: INFORMATION_PERMISSIONS.VIEW,
  INFORMATION_UPDATE: INFORMATION_PERMISSIONS.UPDATE,
  INFORMATION_DELETE: INFORMATION_PERMISSIONS.DELETE,
  INFORMATION_LIST: INFORMATION_PERMISSIONS.LIST,

  // System permissions
  SYSTEM_ADMIN: SYSTEM_PERMISSIONS.ADMIN,
  SYSTEM_CONFIG: SYSTEM_PERMISSIONS.CONFIG,
  SYSTEM_REPORT: REPORT_PERMISSIONS.MANAGE,
};

// ============================================
// DEFAULT ROLE PERMISSIONS
// ============================================

// Quyền cho Super Admin - TẤT CẢ QUYỀN
export const SUPER_ADMIN_PERMISSIONS = ALL_PERMISSIONS;

// Quyền cho Admin - Hầu hết quyền trừ system
export const ADMIN_PERMISSIONS = [
  ...PERMISSION_GROUPS.USER,
  ...PERMISSION_GROUPS.ROLE,
  ...PERMISSION_GROUPS.PERMISSION,
  ...PERMISSION_GROUPS.USER_ROLE,
  ...PERMISSION_GROUPS.ROLE_PERMISSION,
  ...PERMISSION_GROUPS.USER_PERMISSION,
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
  ...PERMISSION_GROUPS.NOTIFICATION,
  ...PERMISSION_GROUPS.UPLOAD,
  ...PERMISSION_GROUPS.REPORT,
  ...PERMISSION_GROUPS.SETTINGS,
];

// Quyền cho Staff - Quản lý đơn hàng và sản phẩm cơ bản
export const STAFF_PERMISSIONS = [
  // Xem người dùng
  USER_PERMISSIONS.VIEW,
  USER_PERMISSIONS.LIST,
  // Xem vai trò
  ROLE_PERMISSIONS.VIEW,
  ROLE_PERMISSIONS.LIST,
  // Quản lý sản phẩm cơ bản
  ...PERMISSION_GROUPS.COLLECTION.filter(
    (p) => !p.includes('delete') && !p.includes('manage'),
  ),
  ...PERMISSION_GROUPS.PRODUCT.filter(
    (p) => !p.includes('delete') && !p.includes('manage'),
  ),
  ...PERMISSION_GROUPS.PRODUCT_VARIANT.filter(
    (p) => !p.includes('delete') && !p.includes('manage'),
  ),
  ...PERMISSION_GROUPS.PRODUCT_CATEGORY.filter(
    (p) => !p.includes('delete') && !p.includes('manage'),
  ),
  ...PERMISSION_GROUPS.PRODUCT_CUSTOM.filter(
    (p) => !p.includes('delete') && !p.includes('manage'),
  ),
  ...PERMISSION_GROUPS.BACKGROUND.filter(
    (p) => !p.includes('delete') && !p.includes('manage'),
  ),
  // Quản lý đơn hàng đầy đủ
  ...PERMISSION_GROUPS.ORDER,
  // Quản lý kho cơ bản
  INVENTORY_PERMISSIONS.VIEW,
  INVENTORY_PERMISSIONS.LIST,
  INVENTORY_PERMISSIONS.UPDATE,
  INVENTORY_PERMISSIONS.ADJUST,
  // Xem khuyến mãi
  PROMOTION_PERMISSIONS.VIEW,
  PROMOTION_PERMISSIONS.LIST,
  PROMOTION_PERMISSIONS.VALIDATE,
  // Xem phí vận chuyển
  SHIPPING_FEE_PERMISSIONS.VIEW,
  SHIPPING_FEE_PERMISSIONS.LIST,
  // Quản lý phản hồi
  ...PERMISSION_GROUPS.FEEDBACK,
  // Quản lý tư vấn
  ...PERMISSION_GROUPS.CONSULTATION,
  // Xem thông tin
  INFORMATION_PERMISSIONS.VIEW,
  INFORMATION_PERMISSIONS.LIST,
  // Thông báo
  NOTIFICATION_PERMISSIONS.VIEW,
  NOTIFICATION_PERMISSIONS.LIST,
  // Upload
  UPLOAD_PERMISSIONS.VIEW,
  UPLOAD_PERMISSIONS.CREATE,
  // Xem báo cáo cơ bản
  REPORT_PERMISSIONS.VIEW,
  REPORT_PERMISSIONS.ORDERS,
];

// Quyền cho Viewer - Chỉ xem
export const VIEWER_PERMISSIONS = [
  USER_PERMISSIONS.VIEW,
  ROLE_PERMISSIONS.VIEW,
  COLLECTION_PERMISSIONS.VIEW,
  COLLECTION_PERMISSIONS.LIST,
  PRODUCT_PERMISSIONS.VIEW,
  PRODUCT_PERMISSIONS.LIST,
  PRODUCT_VARIANT_PERMISSIONS.VIEW,
  PRODUCT_VARIANT_PERMISSIONS.LIST,
  PRODUCT_CATEGORY_PERMISSIONS.VIEW,
  PRODUCT_CATEGORY_PERMISSIONS.LIST,
  PRODUCT_CUSTOM_PERMISSIONS.VIEW,
  PRODUCT_CUSTOM_PERMISSIONS.LIST,
  BACKGROUND_PERMISSIONS.VIEW,
  BACKGROUND_PERMISSIONS.LIST,
  ORDER_PERMISSIONS.VIEW,
  ORDER_PERMISSIONS.LIST,
  INVENTORY_PERMISSIONS.VIEW,
  INVENTORY_PERMISSIONS.LIST,
  PROMOTION_PERMISSIONS.VIEW,
  PROMOTION_PERMISSIONS.LIST,
  SHIPPING_FEE_PERMISSIONS.VIEW,
  SHIPPING_FEE_PERMISSIONS.LIST,
  FEEDBACK_PERMISSIONS.VIEW,
  FEEDBACK_PERMISSIONS.LIST,
  CONSULTATION_PERMISSIONS.VIEW,
  CONSULTATION_PERMISSIONS.LIST,
  INFORMATION_PERMISSIONS.VIEW,
  INFORMATION_PERMISSIONS.LIST,
  NOTIFICATION_PERMISSIONS.VIEW,
  NOTIFICATION_PERMISSIONS.LIST,
  REPORT_PERMISSIONS.VIEW,
];
