import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto, UpdateVehicleDto, VehicleFilterDto } from './vehicle.dto';
import { AuthGuard } from 'src/utils/auth';
import { ChallanFilterDto } from "src/challan/challan.dto";


@Controller('vehicles')
export class VehicleController {
    constructor(
        private readonly vehicleService: VehicleService
    ) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async createVehicle(@Body(ValidationPipe) body: CreateVehicleDto) {
        return this.vehicleService.createVehicle(body)
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async getVahicles(@Query(ValidationPipe) query: VehicleFilterDto) {
        return this.vehicleService.findAllVehicles(query)
    }
    @Get(":id")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async getSingleVehicle(@Param("id") id: number) {
        return this.vehicleService.getSingleVehicle(id)
    }
    
    @Get("/:id/vehicle-challans")
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async getVehicleChallans(
        @Param("id") vehicleId: number,
        @Query(ValidationPipe) query: ChallanFilterDto
        )
    {
        return this.vehicleService.getChallansByVehicle(vehicleId, query);
    }

    @Put(":id")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async updateVehicle(@Param("id") id: number, @Body(ValidationPipe) body: UpdateVehicleDto) {
        return this.vehicleService.updateVehicle(id, body)
    }

    @Delete(":id")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async deleteVehicle(@Param("id") id: number) {
        return this.vehicleService.deleteVehicle(id)
    }
}
