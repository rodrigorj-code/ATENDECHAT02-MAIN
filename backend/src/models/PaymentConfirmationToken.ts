import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  AllowNull
} from "sequelize-typescript";

@Table
class PaymentConfirmationToken extends Model<PaymentConfirmationToken> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  token: string;

  @AllowNull(false)
  @Column
  email: string;

  @AllowNull(true)
  @Column
  companyId: number;

  @AllowNull(true)
  @Column(DataType.TEXT)
  desiredPlanName: string;

  @AllowNull(true)
  @Column(DataType.DATE(6))
  expiresAt: Date;

  @AllowNull(true)
  @Column(DataType.DATE(6))
  usedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default PaymentConfirmationToken;
