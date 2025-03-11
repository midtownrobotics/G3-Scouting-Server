import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import UserModel from "./UserModel";
import { Schedule, ScheduleCreationAttributes } from "./modelTypes";

@Table({ tableName: "schedule" })
class ScheduleModel extends Model<Schedule, ScheduleCreationAttributes> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @ForeignKey((() => UserModel))
    @Column({ type: DataType.INTEGER, allowNull: false })
    public userId!: number;

    @Column({ type: DataType.JSON, allowNull: false })
    public matchesOn!: number[];

    @Column({ type: DataType.JSON, allowNull: false })
    public matchesOff!: number[];
}

export default ScheduleModel;