import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import UserModel from './UserModel'

@Entity('rankings')
@Index('idx_rankings_day_points', ['day', 'points'])
export default class RankingModel {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ name: 'user_id' })
  userId!: number

  @ManyToOne(() => UserModel, (user) => user.rankings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserModel

  @Column({ length: 16 })
  level!: string

  @Column()
  correct!: number

  @Column()
  total!: number

  @Column()
  points!: number

  @Column({ length: 10 })
  day!: string

  @Column()
  date!: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
