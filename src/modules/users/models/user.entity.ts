import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude, Expose } from 'class-transformer';
import { User, UserRole } from '../../common/interfaces/user.interface';

@Entity()
export class UserEntity implements User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('varchar', { unique: true, nullable: false, length: 100 })
  @Expose()
  public email: string;

  @Column('varchar', { nullable: false, length: 255 })
  @Exclude()
  public password: string;

  @CreateDateColumn()
  public creationDate: Date;

  @Column('enum', {
    name: 'enum',
    enum: UserRole,
    nullable: false,
    default: UserRole.User,
  })
  @Expose()
  public role: UserRole;

  @BeforeInsert() async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
