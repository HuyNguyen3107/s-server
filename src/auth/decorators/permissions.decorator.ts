import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const PERMISSION_MODE_KEY = 'permission_mode';

export type PermissionMode = 'ALL' | 'ANY';

/**
 * Decorator để đánh dấu route cần quyền cụ thể
 * @param permissions - Danh sách quyền cần kiểm tra
 *
 * @example
 * // Yêu cầu quyền users.view
 * @RequirePermissions('users.view')
 *
 * @example
 * // Yêu cầu CẢ HAI quyền users.view VÀ users.list (mặc định)
 * @RequirePermissions('users.view', 'users.list')
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorator để yêu cầu TẤT CẢ quyền
 * @param permissions - Danh sách quyền (cần có tất cả)
 *
 * @example
 * // Yêu cầu cả hai quyền
 * @RequireAllPermissions('users.view', 'users.update')
 */
export const RequireAllPermissions = (...permissions: string[]) => {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    SetMetadata(PERMISSIONS_KEY, permissions)(target, propertyKey, descriptor);
    SetMetadata(PERMISSION_MODE_KEY, 'ALL' as PermissionMode)(
      target,
      propertyKey,
      descriptor,
    );
  };
};

/**
 * Decorator để yêu cầu ÍT NHẤT MỘT quyền
 * @param permissions - Danh sách quyền (chỉ cần một trong số đó)
 *
 * @example
 * // Yêu cầu có ít nhất một trong hai quyền
 * @RequireAnyPermission('orders.view', 'orders.manage')
 */
export const RequireAnyPermission = (...permissions: string[]) => {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    SetMetadata(PERMISSIONS_KEY, permissions)(target, propertyKey, descriptor);
    SetMetadata(PERMISSION_MODE_KEY, 'ANY' as PermissionMode)(
      target,
      propertyKey,
      descriptor,
    );
  };
};
