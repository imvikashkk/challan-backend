import { PartialType } from "@nestjs/mapped-types";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

enum VehicleStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

export class CreateVehicleDto {
    @IsString()
    @IsNotEmpty()
    vehicle_number: string;

    @IsString()
    @IsNotEmpty()
    vehicle_name: string;

    @IsString()
    @IsNotEmpty()
    vehicle_model: string;

    @IsString()
    @IsNotEmpty()
    vehicle_registration_date: string;

    @IsString()
    @IsNotEmpty()
    owner_name: string;

    @IsString()
    @IsNotEmpty()
    driver_name: string;

    @IsEnum(VehicleStatus)
    @IsOptional()
    status: VehicleStatus;

}
export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {

}

export class VehicleFilterDto {
    @IsOptional()
    @IsEnum(VehicleStatus)
    status: VehicleStatus
    
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    search: string

    @IsOptional()
    page: string;

    @IsOptional()
    size: string;
}