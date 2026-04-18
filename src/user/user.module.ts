import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Challan } from 'src/challan/challan.entity';
import { Vehicle } from 'src/vehicle/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Challan, Vehicle])],
  controllers: [UserController],
  providers: [UserService,],
})
export class UserModule { }
