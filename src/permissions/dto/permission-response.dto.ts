import { Permission } from '@prisma/client';

export class PermissionResponseDto {
  id: string;
  name: string;
  createdAt: Date;

  constructor(permission: Permission) {
    this.id = permission.id;
    this.name = permission.name;
    this.createdAt = permission.createdAt;
  }
}
