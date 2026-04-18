import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ChallanService } from './challan.service';
import { ChallanFilterDto, CreateChallanDto, UpdateChallanDto } from './challan.dto';
import { AuthGuard } from 'src/utils/auth';

@Controller('challans')
export class ChallanController {
    constructor(
        private readonly challanService: ChallanService
    ) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async createChallan(@Body(ValidationPipe) body: CreateChallanDto) {
        return this.challanService.createChallan(body)
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async GetChallans(@Query(ValidationPipe) query: ChallanFilterDto) {
        return this.challanService.getChallans(query)
    }

    @Get(":id")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async getSingleChallan(@Param("id") id: number) {
        return this.challanService.getSingleChallan(id)
    }

    @Delete(":id")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async deleteChallan(@Param("id") id: number) {
        return this.challanService.deleteChallan(id)
    }

    @Put(":id")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async updateChallan(@Param("id") id: number, @Body(ValidationPipe) body: UpdateChallanDto) {
        return this.challanService.updateChallan(id, body)
    }

}
