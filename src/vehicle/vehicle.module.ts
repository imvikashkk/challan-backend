import { Module } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './vehicle.entity';
import { Challan } from 'src/challan/challan.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Challan])],
  providers: [VehicleService],
  controllers: [VehicleController]
})
export class VehicleModule { }
