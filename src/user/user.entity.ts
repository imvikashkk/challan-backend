import { Challan } from "src/challan/challan.entity";
import { hashPassword } from "src/utils/bcrypt";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "user" })
export class User {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: true })
    password: string;

    @Column({ unique: true, nullable: true })
    email: string

    @Column({ unique: true, nullable: false })
    phone: string

    @Column({ default: "+91" })
    country_code: string

    @Column({ default: false })
    is_admin?: boolean

    @Column({ nullable: true })
    state: string;

    @Column({ nullable: true, default: "India" })
    country: string;

    @Column({ nullable: true })
    pincode: string;

    @Column({ nullable: true })
    address: string

    @CreateDateColumn({
        type: 'timestamp',
    })
    createdAt?: Date;

    @UpdateDateColumn({
        type: 'timestamp',
    })
    updatedAt?: Date;

    @OneToMany(() => Challan, (challan) => challan.user)
    challans: Challan[]


    @BeforeInsert()
    async hashPasswordBeforeInsert?() {
        if (this.password) {
            this.password = await hashPassword(this.password);
        }
    }

    @BeforeUpdate()
    async hashPasswordBeforeUpdate?() {
        if (this.password) {
            this.password = await hashPassword(this.password);
        }
    }

}