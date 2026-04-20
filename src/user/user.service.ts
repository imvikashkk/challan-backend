import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import {
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
  UserFilterDto,
} from './user.dto';
import { comparePassword } from 'src/utils/bcrypt';
import { jwtSign } from 'src/utils/jwt';
import { getMeta, getPagination, MetaResponse } from 'src/utils/pagination';
import { Challan } from 'src/challan/challan.entity';
import { ChallanFilterDto } from 'src/challan/challan.dto';
import { Vehicle } from 'src/vehicle/vehicle.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Challan)
    private readonly challanRep: Repository<Challan>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
  ) {}

  async createUser(user: CreateUserDto): Promise<User> {
    const isUserExists = await this.userRepo.findOne({
      where: [{ email: user.email }, { phone: user.phone }],
    });
    if (isUserExists) {
      const message =
        isUserExists.email === user.email
          ? 'User Already Exists with email'
          : 'User Already Exists with phone';
      throw new HttpException(message, HttpStatus.CONFLICT);
    }
    const newUser = this.userRepo.create(user);
    const savedUser = await this.userRepo.save(newUser);
    return savedUser;
  }

  async findAllUsers(
    query: UserFilterDto,
  ): Promise<{ data: any[]; pagination: MetaResponse }> {
    const pagination = getPagination(query);
    const date: { from: string; to: string } | undefined = query.date;

    const userQuery = this.userRepo
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.name',
        'user.phone',
        'user.email',
        'user.country_code',
        'user.is_admin',
        'user.address',
        'user.state',
        'user.pincode',
        'user.country',
      ])
      .loadRelationCountAndMap('user.challans', 'user.challans')
      .where('user.is_admin =:isAdmin', { isAdmin: false });

    // Adding search filters
    if (query.search) {
      userQuery.andWhere(
        new Brackets((qb) => {
          qb.where('user.name ILIKE :search', { search: `%${query.search}%` })
            .orWhere('user.country ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('user.email ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('user.phone ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('user.state ILIKE :search', {
              search: `%${query.search}%`,
            });
        }),
      );
    }

    // Date filter: only show parties having at least one challan in range
    if (date?.from && date?.to) {
      userQuery.andWhere((qb) => {
        const sub = qb
          .subQuery()
          .select('1')
          .from('challan', 'c')
          .where('c.userId = user.id')
          .andWhere('c.challan_date BETWEEN :from AND :to', {
            from: date.from,
            to: date.to,
          })
          .getQuery();
        return `EXISTS ${sub}`;
      });
    }

    // Implementing pagination
    const [users, count] = await userQuery
      .skip(pagination.skip)
      .take(pagination.take)
      .getManyAndCount();

    // Fetch total_weight and total_bags per user (filtered by date if active)
    const userIds = users.map((u) => u.id);
    const totalsMap: Record<
      number,
      { total_weight: number; total_bags: number }
    > = {};

    if (userIds.length > 0) {
      const totalsQuery = this.challanRep
        .createQueryBuilder('challan')
        .select('challan.userId', 'userId')
        .addSelect('COALESCE(SUM(challan.weight), 0)', 'total_weight')
        .addSelect('COALESCE(SUM(challan.bags), 0)', 'total_bags')
        .where('challan.userId IN (:...userIds)', { userIds })
        .groupBy('challan.userId');

      if (date?.from && date?.to) {
        totalsQuery.andWhere('challan.challan_date BETWEEN :from AND :to', {
          from: date.from,
          to: date.to,
        });
      }

      const totals = await totalsQuery.getRawMany();

      totals.forEach((t) => {
        totalsMap[t.userId] = {
          total_weight: Number(t.total_weight || 0),
          total_bags: Number(t.total_bags || 0),
        };
      });
    }

    const data = users.map((user) => ({
      ...user,
      total_weight: totalsMap[user.id]?.total_weight ?? 0,
      total_bags: totalsMap[user.id]?.total_bags ?? 0,
    }));

    const meta = getMeta(pagination, count);
    return { data, pagination: meta };
  }

  async findUserByPk(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['challans'],
      order: { challans: { id: 'DESC' } },
    });
    if (!user) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async deleteUser(id: number): Promise<{ messsage: string }> {
    const user = await this.userRepo.findOne({
      where: { id, is_admin: false },
    });
    if (!user) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    await this.userRepo.delete({ id });
    return { messsage: 'User Deleted' };
  }

  async adminLogin(body: LoginUserDto): Promise<{ user: User; token: string }> {
    const user = await this.userRepo.findOne({
      where: [
        { email: body.identifier, is_admin: true },
        { phone: body.identifier, is_admin: true },
      ],
    });
    if (!user) {
      throw new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST);
    }
    const isPasswordTrue = await comparePassword(body.password, user.password);
    if (isPasswordTrue) {
      const token = jwtSign({ id: user.id, is_admin: user.is_admin ?? false });
      delete user.password;
      return { user: user, token };
    } else {
      throw new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST);
    }
  }

  async updateUser(
    id: number,
    user: UpdateUserDto,
  ): Promise<{ message: string }> {
    const isUserExists = await this.userRepo.findOneBy({ id });
    if (!isUserExists) {
      throw new HttpException('No User Found', HttpStatus.NOT_FOUND);
    }
    await this.userRepo.update(id, user);
    return { message: 'User Updated!' };
  }

  async GetUserAndChallan(
    id: number,
    query: ChallanFilterDto,
  ): Promise<{
    data: {
      party: User;
      challans: Challan[];
      totalWeight: number;
      totalBags: number;
    };
    pagination: MetaResponse;
  }> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new HttpException('No User Found', HttpStatus.NOT_FOUND);
    }

    const pagination = getPagination(query);
    delete query.size;
    delete query.page;
    const date: { from: string; to: string } = query.date;

    const baseQuery = this.challanRep
      .createQueryBuilder('challan')
      .leftJoinAndSelect('challan.user', 'user')
      .leftJoinAndSelect('challan.vehicle', 'vehicle')
      .select(['challan', 'user.name', 'vehicle.vehicle_number'])
      .where('user.id = :id', { id });

    if (query.search) {
      const searchText = String(query.search).trim();
      const normalizedVehicleSearch = searchText
        .replace(/\s+/g, '')
        .toUpperCase();

      baseQuery.andWhere(
        new Brackets((qb) => {
          qb.where('user.name ILIKE :search', { search: `%${searchText}%` })
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
        baseQuery.andWhere(`challan.${key} = :${key}`, { [key]: query[key] });
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
        party: user,
        challans,
        totalWeight: Number(totalsRaw?.totalWeight || 0),
        totalBags: Number(totalsRaw?.totalBags || 0),
      },
      pagination: meta,
    };
  }

  async dashboard(): Promise<{
    parties: number;
    challans: number;
    vehicles: number;
    bags: number;
    revenue: number;
    unpaidAmount: number;
  }> {
    const user = await this.userRepo.count();
    const challans = await this.challanRep.count();
    const vehicles = await this.vehicleRepo.count();
    const bags = await this.challanRep.sum('bags');
    const revenue = await this.challanRep.sum('rate');
    // const unpaidAmount = await this.challanRep.sum("rate");
    const { unpaidAmount } = await this.challanRep
      .createQueryBuilder('challan')
      .select('SUM(challan.rate)', 'unpaidAmount')
      .where('challan.payment_status=:payment_status', {
        payment_status: 'UNPAID',
      })
      .getRawOne();
    return {
      parties: user,
      challans,
      vehicles,
      bags,
      revenue,
      unpaidAmount: unpaidAmount ?? 0,
    };
  }
}
