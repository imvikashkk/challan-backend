import { Challan } from "src/challan/challan.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Vehicle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, unique: true })
    vehicle_number: string;

    @Column({ nullable: false })
    vehicle_name: string;

    @Column()
    vehicle_model: string;

    @Column()
    vehicle_registration_date: string;

    @Column()
    owner_name: string;

    @Column()
    driver_name: string

    @Column({
        type: "enum",
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE"
    })
    status: string

    @OneToMany(() => Challan, (challan) => challan.vehicle)
    challans: Challan[]
}