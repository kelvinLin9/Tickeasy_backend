/**
 * 用戶模型
 * 
 * 使用 TypeORM 的裝飾器語法定義實體和屬性
 */

import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index
} from 'typeorm';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPERUSER = 'superuser'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'userId' })
  userId: string;

  @Column({ length: 100, unique: true, nullable: false })
  @Index()
  email: string;

  @Column({ length: 50, nullable: true, select: false })
  password: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 20, nullable: true })
  nickname: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  @Index()
  role: UserRole;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true
  })
  gender: Gender;

  @Column('varchar', { array: true, nullable: true, default: '{}' })
  preferredRegions: string[];

  @Column('varchar', { array: true, nullable: true, default: '{}' })
  preferredEventTypes: string[];

  @Column({ length: 20, nullable: true })
  country: string;

  @Column({ length: 100, nullable: true })
  address: string;

  @Column({ length: 255, nullable: true })
  avatar: string;

  @Column({ length: 50, nullable: true })
  verificationToken: string;

  @Column({ nullable: true })
  verificationTokenExpires: Date;

  @Column({ default: false, nullable: false })
  isEmailVerified: boolean;

  @Column({ length: 50, nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpires: Date;

  @Column({ nullable: true })
  lastVerificationAttempt: Date;

  @Column({ nullable: true })
  lastPasswordResetAttempt: Date;

  @Column('jsonb', { default: '[]', nullable: false })
  oauthProviders: object;

  @Column('jsonb', { default: '[]', nullable: true })
  searchHistory: object;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: false })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  // 關聯定義將在相關模型創建後添加
  // @OneToMany(() => Ticket, ticket => ticket.user)
  // tickets: Ticket[];

  // @OneToMany(() => Order, order => order.user)
  // orders: Order[];
} 