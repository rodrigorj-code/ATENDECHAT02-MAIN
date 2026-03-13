import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import LeadPipeline from "./LeadPipeline";

@Table
class LeadPipelineStage extends Model<LeadPipelineStage> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => LeadPipeline)
  @Column
  pipelineId: number;

  @BelongsTo(() => LeadPipeline)
  pipeline: LeadPipeline;

  @Column
  key: string;

  @Column
  label: string;

  @Column
  color: string;

  @Column
  order: number;

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

export default LeadPipelineStage;
