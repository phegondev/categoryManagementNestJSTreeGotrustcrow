import { Entity, PrimaryGeneratedColumn, Column, Unique, Tree, TreeChildren, TreeParent } from 'typeorm';

@Entity('categories')
@Tree("nested-set")
@Unique(['name'])
export class Category {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @TreeChildren()
  children: Category[];

  @TreeParent()
  parent: Category;

}
