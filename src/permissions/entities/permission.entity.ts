export class Permission {
  id: string;
  name: string;
  createdAt: Date;

  constructor(partial: Partial<Permission>) {
    Object.assign(this, partial);
  }
}
