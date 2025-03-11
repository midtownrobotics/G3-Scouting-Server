import { Column, DataType, HasMany, HasOne, Model, Table } from "sequelize-typescript";
import MatchModel from "./MatchModel";
import ScheduleModel from "./ScheduleModel";
import { User, UserCreationAttributes } from "./modelTypes";

@Table({ tableName: "users" })
class UserModel extends Model<User, UserCreationAttributes> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @Column({ type: DataType.TEXT, allowNull: false })
    public username!: string;

    @Column({ type: DataType.TEXT, allowNull: false })
    public password!: string;

    @Column({ type: DataType.INTEGER, allowNull: false })
    public permissionId!: number;

    @HasMany(() => MatchModel)
    public matches!: MatchModel[];

    @HasOne(() => ScheduleModel)
    public schedule!: ScheduleModel;

    @Column({ type: DataType.TEXT, allowNull: true })
    public assignedAlliance?: "blue" | "red";

    @Column({ type: DataType.INTEGER, allowNull: true })
    public group?: number;

    public static async addUser(username: string, password: string, permissionId: number) {
        UserModel.create({
            username,
            password,
            permissionId
        });
    }

    public static async getAllUsers() {
        return await UserModel.findAll({
            include: [
                { model: MatchModel, as: "matches" },
                { model: ScheduleModel, as: "schedule" }
            ]
        })
    }
}

export default UserModel;