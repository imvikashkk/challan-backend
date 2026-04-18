import { PartialType } from '@nestjs/mapped-types';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

enum ChallanType {
  BOILED = 'BOILED',
  STEAMED = 'STEAMED',
}
enum MarkType {
  RED = 'RED',
  GREEN = 'GREEN',
  BLUE = 'BLUE',
  YELLOW = 'YELLOW',
  SAADA = 'SAADA',
}
enum DealType {
  READY = 'READY',
  NOT_READY = 'NOT_READY',
}
enum PaymentStatusType {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
}
enum ReadyType {
  BAGS = 'BAGS',
  QUINTAL = 'QUINTAL',
}

export class CreateChallanDto {
  @IsEnum(ChallanType)
  type: ChallanType;

  @IsNumber()
  bags: number;

  @IsEnum(MarkType)
  mark: MarkType;

  @IsString()
  time: string;

  @IsNumber()
  rate: number;

  @IsEnum(DealType)
  deal_type: DealType;

  @IsEnum(ReadyType)
  @IsOptional()
  ready_type?: ReadyType;

  @IsNumber()
  @IsOptional()
  ready_value?: number;

  @IsNumber()
  @IsOptional()
  remaining_value?: number;

  @IsEnum(PaymentStatusType)
  payment_status: PaymentStatusType;

  @IsDateString()
  challan_date: string;

  @IsNumber()
  weight: number;

  @IsNumber()
  vehicleId: number;

  @IsNumber()
  userId: number;
}

export class UpdateChallanDto extends PartialType(CreateChallanDto) {}
export class ChallanFilterDto {
  @IsEnum(ChallanType)
  @IsOptional()
  type: ChallanType;

  @IsEnum(MarkType)
  @IsOptional()
  mark?: MarkType;

  @IsEnum(DealType)
  @IsOptional()
  deal_type?: DealType;

  @IsEnum(PaymentStatusType)
  @IsOptional()
  payment_status?: PaymentStatusType;

  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  short_by?: 'ASC' | 'DESC';

  @IsOptional()
  page?: string;

  @IsOptional()
  size?: string;

  @IsOptional()
  @IsNotEmpty()
  search?: string;

  @IsOptional()
  date: {
    to: string;
    from: string;
  };
}
