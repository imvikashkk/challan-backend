import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Challan } from './challan.entity';
import { Brackets, Repository } from 'typeorm';
import {
  ChallanFilterDto,
  CreateChallanDto,
  UpdateChallanDto,
} from './challan.dto';
import { Vehicle } from 'src/vehicle/vehicle.entity';
import { getMeta, getPagination, MetaResponse } from 'src/utils/pagination';
import { User } from 'src/user/user.entity';

@Injectable()
export class ChallanService {
  constructor(
    @InjectRepository(Challan)
    private readonly challanRepo: Repository<Challan>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createChallan(body: CreateChallanDto): Promise<Challan> {
    const vehicle = await this.vehicleRepo.findOneBy({ id: body.vehicleId });
    const user = await this.userRepo.findOneBy({ id: body.userId });
    if (vehicle && user) {
      const newVehicle = this.challanRepo.create({ ...body, vehicle, user });
      return this.challanRepo.save(newVehicle);
    } else
      throw new HttpException(
        `${vehicle == null ? 'vehicle not found' : 'user not found'}`,
        HttpStatus.BAD_REQUEST,
      );
  }

  async getChallans(
    query: ChallanFilterDto,
  ): Promise<{ data: Challan[]; pagination: MetaResponse }> {
    const pagination = getPagination(query);
    delete query.page;
    delete query.size;
    const date: { from: string; to: string } = query.date;
    // delete query.date;

    const challanQuery = this.challanRepo
      .createQueryBuilder('challan')
      .leftJoinAndSelect('challan.user', 'user')
      .leftJoinAndSelect('challan.vehicle', 'vehicle')
      .select(['challan', 'user.name', 'vehicle.vehicle_number']) // Adjust the fields to be selected as needed
      .orderBy('challan.id', 'DESC')
      .skip(pagination.skip)
      .take(pagination.take);

    if (query.search) {
      const searchText = String(query.search).trim();
      const normalizedVehicleSearch = searchText
        .toUpperCase()
        .replace(/\s+/g, '');

      challanQuery.andWhere(
        new Brackets((qb) => {
          qb.where('user.name ILIKE :search', {
            search: `%${searchText}%`,
          })
            .orWhere('vehicle.vehicle_number ILIKE :search', {
              search: `%${searchText}%`,
            })
            .orWhere('CAST(challan.id AS TEXT) ILIKE :search', {
              search: `%${searchText}%`,
            })
            .orWhere(
              "REPLACE(UPPER(vehicle.vehicle_number), ' ', '') LIKE :vehicleSearch",
              {
                vehicleSearch: `%${normalizedVehicleSearch}%`,
              },
            );
        }),
      );
      delete query.search;
    }
    if (date) {
      challanQuery.andWhere('challan.challan_date BETWEEN :from AND :to', {
        from: date.from,
        to: date.to,
      });
      delete query.date;
    }

    // Apply any additional filters in the query object
    Object.keys(query).forEach((key) => {
      challanQuery.andWhere(`challan.${key} = :${key}`, { [key]: query[key] });
    });

    const [challans, count] = await challanQuery.getManyAndCount();
    const meta = getMeta(pagination, count);

    return { data: challans, pagination: meta };
  }

  async getSingleChallan(id: number): Promise<Challan> {
    const isChallanExists = await this.challanRepo.findOne({
      where: { id },
      select: {
        user: {
          id: true,
          country: true,
          createdAt: true,
          email: true,
          name: true,
          phone: true,
          address: true,
          state: true,
          pincode: true,
        },
      },
      relations: ['vehicle', 'user'],
    });

    if (!isChallanExists) {
      throw new HttpException('Challan Not Found', HttpStatus.NOT_FOUND);
    }
    return isChallanExists;
  }

  async deleteChallan(id: number): Promise<{ message: string }> {
    const isChallanExists = await this.challanRepo.findOne({
      where: { id },
      relations: ['vehicle'],
    });

    if (!isChallanExists) {
      throw new HttpException('Challan Not Found', HttpStatus.NOT_FOUND);
    }
    await this.challanRepo.delete(id);
    return { message: 'challan deleted' };
  }

  async updateChallan(
    id: number,
    body: UpdateChallanDto,
  ): Promise<{ message: string }> {
    const isChallanExists = await this.challanRepo.findOne({
      where: { id },
      relations: ['vehicle'],
    });
    if (!isChallanExists) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    if (body.vehicleId) {
      const vehicle = await this.vehicleRepo.findOneBy({ id: body.vehicleId });
      delete body.vehicleId;
      body['vehicle'] = vehicle;
    }
    if (body.userId) {
      const user = await this.userRepo.findOneBy({ id: body.userId });
      delete body.userId;
      body['user'] = user;
    }
    await this.challanRepo.update(id, body);
    return { message: 'challan updated' };
  }
}
