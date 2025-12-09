export class Order {
  id: string;
  userId?: string | null;
  status: string;
  information: any;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: {
    id: string;
    email: string;
    name: string;
    phone: string;
  };
}
