import { Module } from '@nestjs/common';
import { ChallanService } from './challan.service';
import { ChallanController } from './challan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challan } from './challan.entity';
import { Vehicle } from 'src/vehicle/vehicle.entity';
import { User } from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Challan,Vehicle,User])],
  providers: [ChallanService],
  controllers: [ChallanController]
})
export class ChallanModule { }
