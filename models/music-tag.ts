/**
 * 音樂類型標籤模型
 */
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany
} from 'typeorm';

@Entity('musicTag')
export class MusicTag {
  @PrimaryGeneratedColumn('uuid', { name: 'musicTagId' })
  musicTagId: string;

  @Column({ length: 50 })
  musicTagName: string;
} 