export interface Consultation {
  id: string;
  customerName: string;
  phoneNumber: string;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  notes?: string;
  assignedTo?: {
    userId: string;
    userName: string;
  } | null;
}
