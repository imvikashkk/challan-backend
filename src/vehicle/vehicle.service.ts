import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, ILike, Repository } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleFilterDto,
} from './vehicle.dto';
import { getMeta, getPagination, MetaResponse } from 'src/utils/pagination';
import { ChallanFilterDto } from 'src/challan/challan.dto';
import { Challan } from 'src/challan/challan.entity';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Challan)
    private readonly challanRep: Repository<Challan>,
  ) {}

  async createVehicle(vehicle: CreateVehicleDto): Promise<Vehicle> {
    const isVehicleExists = await this.vehicleRepo.findOne({
      where: { vehicle_number: vehicle.vehicle_number },
    });
    if (isVehicleExists) {
      throw new HttpException(
        'Vehicle Number Already Exists',
        HttpStatus.CONFLICT,
      );
    }
    const newVehicle = this.vehicleRepo.create(vehicle);
    return this.vehicleRepo.save(newVehicle);
  }

  async findAllVehicles(
    query: VehicleFilterDto,
  ): Promise<{ data: Vehicle[]; pagination: MetaResponse }> {
    const pagination = getPagination(query);

    let normalizedDateSearch: string | null = null;
    if (query.search) {
      const dateMatch = query.search
        .trim()
        .match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
      if (dateMatch) {
        const day = dateMatch[1].padStart(2, '0');
        const month = dateMatch[2].padStart(2, '0');
        const year = dateMatch[3];
        normalizedDateSearch = `${year}-${month}-${day}`;
      }
    }

    const searchWhere = query.search
      ? [
          { vehicle_number: ILike(`%${query.search}%`) },
          { vehicle_name: ILike(`%${query.search}%`) },
          { vehicle_model: ILike(`%${query.search}%`) },
          { vehicle_registration_date: ILike(`%${query.search}%`) },
          ...(normalizedDateSearch
            ? [
                {
                  vehicle_registration_date: ILike(`%${normalizedDateSearch}%`),
                },
              ]
            : []),
          { owner_name: ILike(`%${query.search}%`) },
          { driver_name: ILike(`%${query.search}%`) },
        ]
      : query.status && { status: query.status };

    const [vehicles, count] = await this.vehicleRepo.findAndCount({
      where: searchWhere,
      skip: pagination.skip,
      take: pagination.take,
    });
    const meta = getMeta(pagination, count);

    return { data: vehicles, pagination: meta };
  }

  async getSingleVehicle(id: number): Promise<Vehicle> {
    const isVehicleExists = await this.vehicleRepo.findOneBy({ id });
    if (isVehicleExists) {
      return isVehicleExists;
    }
    throw new HttpException('Vehicle Not Found', HttpStatus.NOT_FOUND);
  }

  async updateVehicle(
    id: number,
    body: UpdateVehicleDto,
  ): Promise<{ message: string }> {
    const isVehicleExists = await this.vehicleRepo.findOne({
      where: { id: id },
    });
    if (!isVehicleExists)
      throw new HttpException('Not Found!', HttpStatus.NOT_FOUND);
    await this.vehicleRepo.update(id, body);
    return { message: 'vehicle updated' };
  }

  async deleteVehicle(id: number): Promise<{ message: string }> {
    const isVehicleExists = await this.vehicleRepo.findOne({
      where: { id: id },
    });
    if (!isVehicleExists)
      throw new HttpException('Not Found!', HttpStatus.NOT_FOUND);
    await this.vehicleRepo.delete({ id });
    return { message: 'Vehicle Deleted!' };
  }

  async getChallansByVehicle(
    vehicleId: number,
    query: ChallanFilterDto,
  ): Promise<{
    data: {
      vehicle: Vehicle;
      challans: Challan[];
      totals: { weight: number; bags: number };
    };
    pagination: MetaResponse;
  }> {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new HttpException('No Vehicle Found', HttpStatus.NOT_FOUND);
    }

    const pagination = getPagination(query);
    delete query.size;
    delete query.page;
    const date: { from: string; to: string } = query.date;

    const baseQuery = this.challanRep
      .createQueryBuilder('challan')
      .leftJoinAndSelect('challan.user', 'user')
      .leftJoinAndSelect('challan.vehicle', 'vehicle')
      .select(['challan', 'user.name', 'vehicle.vehicle_number']);

    baseQuery.andWhere('vehicle.id = :vehicleId', { vehicleId });

    if (query.search) {
      const searchText = String(query.search).trim();
      const normalizedVehicleSearch = searchText
        .toUpperCase()
        .replace(/\s+/g, '');

      baseQuery.andWhere(
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
    }

    if (date) {
      baseQuery.andWhere('challan.challan_date BETWEEN :from AND :to', {
        from: date.from,
        to: date.to,
      });
    }

    Object.keys(query).forEach((key) => {
      if (query[key] !== undefined && key !== 'search' && key !== 'date') {
        baseQuery.andWhere(`challan.${key} = :${key}`, {
          [key]: query[key],
        });
      }
    });

    const challanQuery = baseQuery
      .clone()
      .orderBy('challan.id', 'DESC')
      .skip(pagination.skip)
      .take(pagination.take);

    const totalQuery = baseQuery
      .clone()
      .select('COALESCE(SUM(challan.weight), 0)', 'totalWeight')
      .addSelect('COALESCE(SUM(challan.bags), 0)', 'totalBags');

    const [challans, count] = await challanQuery.getManyAndCount();
    const totalsRaw = await totalQuery.getRawOne();
    const meta = getMeta(pagination, count);

    return {
      data: {
        vehicle,
        challans,
        totals: {
          weight: Number(totalsRaw?.totalWeight || 0),
          bags: Number(totalsRaw?.totalBags || 0),
        },
      },
      pagination: meta,
    };
  }
}
