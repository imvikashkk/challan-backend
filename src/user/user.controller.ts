import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto, UserFilterDto } from './user.dto';
import { AuthGuard } from 'src/utils/auth';
import { ChallanFilterDto } from 'src/challan/challan.dto';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) { };

    @Post()
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async createUser(@Body(ValidationPipe) body: CreateUserDto) {
        return this.userService.createUser(body)
    }

    @Get()
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async findUsers(@Query(ValidationPipe) query: UserFilterDto) {

        return await this.userService.findAllUsers(query)
    }

    @Post("/admin/login")
    @HttpCode(HttpStatus.OK)
    async adminLogin(@Body(ValidationPipe) body: LoginUserDto) {
        return this.userService.adminLogin(body)
    }

    @Put("/:id")
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async updateUser(@Param("id") id: number, @Body(ValidationPipe) body: UpdateUserDto) {
        return await this.userService.updateUser(id, body)
    }

    @Delete("/:id")
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async deleteUser(@Param("id") id: number) {
        return await this.userService.deleteUser(id)
    }

    @Get("/:id")
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async getSingleUser(@Param("id") id: number) {
        return this.userService.findUserByPk(id)
    }

    @Get("/:id/challans")
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async getSingleUserChallan(@Query(ValidationPipe) query: ChallanFilterDto, @Param("id") id: number,) {
        return this.userService.GetUserAndChallan(id, query)
    }

    @Get("admin/dashboard")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async getDashboard() {
        return this.userService.dashboard();
    }
}
