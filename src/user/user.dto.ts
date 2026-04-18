import { PartialType } from "@nestjs/mapped-types";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    password: string;

    @IsString()
    @Length(10, 10)
    phone: string

    @IsOptional()
    country_code: string

    @IsOptional()
    is_admin?: boolean

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    state: string

    @IsString()
    @IsNotEmpty()
    country: string

    @IsString()
    @IsNotEmpty()
    pincode: string
}

export class UpdateUserDto extends PartialType(CreateUserDto) {

}

export class LoginUserDto {
    @IsNotEmpty()
    identifier: string;

    @IsNotEmpty()
    password: string
}
export class UserFilterDto {
    @IsOptional()
    page: string;

    @IsOptional()
    size: string;

    @IsString()
    @IsOptional()
    search: string;

    @IsOptional()
    date: { from: string; to: string };
}


