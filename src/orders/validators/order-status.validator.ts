import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidOrderStatus', async: false })
export class IsValidOrderStatus implements ValidatorConstraintInterface {
  private readonly validStatuses = [
    // 1) Intake
    'pending',
    'acknowledged',
    'consulting',
    // 2) Demo
    'demo_pending',
    'demo_sent',
    'demo_confirm_pending',
    'demo_editing',
    'demo_approval_pending',
    // 3) Finance
    'payment_pending',
    'paid',
    // 4) Production
    'design_pending',
    'design_approved',
    'manufacturing',
    // 5) Fulfillment
    'completed',
    'delivered',
    // 6) After-sales
    'complaint_resolving',
    'complaint_closed',
  ];

  validate(status: any, args: ValidationArguments) {
    return typeof status === 'string' && this.validStatuses.includes(status);
  }

  defaultMessage(args: ValidationArguments) {
    return `Order status must be one of: ${this.validStatuses.join(', ')}`;
  }
}

export const ORDER_STATUSES = [
  'pending',
  'acknowledged',
  'consulting',
  'demo_pending',
  'demo_sent',
  'demo_confirm_pending',
  'demo_editing',
  'demo_approval_pending',
  'payment_pending',
  'paid',
  'design_pending',
  'design_approved',
  'manufacturing',
  'completed',
  'delivered',
  'complaint_resolving',
  'complaint_closed',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
