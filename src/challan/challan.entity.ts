import { User } from 'src/user/user.entity';
import { Vehicle } from 'src/vehicle/vehicle.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Challan {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'enum', enum: ['BOILED', 'STEAMED'] })
  type: string;

  @Column()
  bags: number;

  @Column({ type: 'enum', enum: ['RED', 'GREEN', 'BLUE', 'YELLOW', 'SAADA'] })
  mark: string;

  @Column({ type: 'time' })
  time: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt?: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt?: Date;

  @Column({ type: 'decimal' })
  rate: number;

  @Column({ type: 'enum', enum: ['READY', 'NOT_READY'] })
  deal_type: string;

  @Column({ type: 'enum', enum: ['PAID', 'UNPAID'] })
  payment_status: string;

  @Column({ type: 'timestamp' })
  challan_date: Date;

  @Column({ type: 'decimal' })
  weight: number;

  @Column({ type: 'enum', enum: ['BAGS', 'QUINTAL'], nullable: true })
  ready_type: string;

  @Column({ type: 'decimal', nullable: true })
  ready_value: number;

  @Column({ type: 'decimal', nullable: true })
  remaining_value: number;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.challans, {
    onDelete: 'CASCADE',
  })
  vehicle: Vehicle;

  @ManyToOne(() => User, (user) => user.challans, { onDelete: 'CASCADE' })
  user: User;
}
