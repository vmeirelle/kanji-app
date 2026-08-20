import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import RankingModel from './RankingModel'

@Entity('users')
export default class UserModel {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true, length: 20 })
  username!: string

  @Column({ name: 'password_hash' })
  passwordHash!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @OneToMany(() => RankingModel, (ranking) => ranking.user)
  rankings!: RankingModel[]
}
