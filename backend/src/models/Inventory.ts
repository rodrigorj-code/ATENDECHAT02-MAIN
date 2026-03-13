import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";

@Table
class Inventory extends Model<Inventory> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column(DataType.DECIMAL)
  price: number;

  @Column(DataType.INTEGER)
  quantity: number;

  @Column
  currency: string;

  @Column(DataType.TEXT)
  image: string;

  @Column
  sku: string;

  @Column
  category: string;

  @Column
  brand: string;

  @Column(DataType.TEXT)
  description: string;

  @Column
  status: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Inventory;
