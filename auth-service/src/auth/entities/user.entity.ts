import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;
  
  @Column()
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
