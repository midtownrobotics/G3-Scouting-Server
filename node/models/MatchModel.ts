import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import UserModel from "./UserModel";
import { Match, MatchCreationAttributes } from "./modelTypes";

@Table({ tableName: "matches" })
class MatchModel extends Model<Match, MatchCreationAttributes> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @ForeignKey((() => UserModel))
    @Column({ type: DataType.INTEGER, allowNull: false })
    public userId!: number;

    @Column({ type: DataType.INTEGER, allowNull: false })
    public number!: number;

    @Column({ type: DataType.TEXT, allowNull: false })
    public alliance!: "blue1" | "blue2" | "blue3" | "red1" | "red2" | "red3";

    @Column({ type: DataType.INTEGER, allowNull: false })
    public team!: number;

    @Column({ type: DataType.BOOLEAN, allowNull: false })
    public highPriority!: boolean;

    @Column({ type: DataType.BOOLEAN, allowNull: false })
    public scouted!: boolean;

    @Column({ type: DataType.INTEGER, allowNull: false })
    public formId!: number;
}

export default MatchModel;