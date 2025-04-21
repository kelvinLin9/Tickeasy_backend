/**
 * 地區標籤模型
 */
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany
} from 'typeorm';

@Entity('locationTag')
export class LocationTag {
  @PrimaryGeneratedColumn('uuid', { name: 'locationTagId' })
  locationTagId: string;

  @Column({ length: 50 })
  locationTagName: string;
} 