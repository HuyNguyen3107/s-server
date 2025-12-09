import { PartialType } from '@nestjs/mapped-types';
import { CreateShippingFeeDto } from './create-shipping-fee.dto';

export class UpdateShippingFeeDto extends PartialType(CreateShippingFeeDto) {}
