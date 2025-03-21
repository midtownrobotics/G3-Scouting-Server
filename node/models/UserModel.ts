import { AllowNull, Column, DataType, Model, Table } from "sequelize-typescript";
import { User, UserCreationAttributes } from "./types";
import { Assignment, NextMatch, Status } from "../types";

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

    @Column({ type: DataType.JSON, allowNull: true })
    public assignments?: Assignment[];

    @Column({ type: DataType.TEXT, allowNull: false })
    public assignedAlliance!: "blue" | "red";

    @Column({ type: DataType.JSON, allowNull: true })
    public nextMatch?: NextMatch;

    @Column({ type: DataType.JSON, allowNull: false, defaultValue: [] })
    public assignedMatches!: number[];

    @Column({ type: DataType.INTEGER, allowNull: true })
    public lastMatchScouted?: number;

    public static async addUser(username: string, password: string, permissionId: number) {
        const [redCount, blueCount] = await Promise.all([
            UserModel.count({ where: { assignedAlliance: "red" } }),
            UserModel.count({ where: { assignedAlliance: "blue" } }),
        ]);

        await UserModel.create({
            username,
            password,
            permissionId,
            assignedAlliance: redCount < blueCount ? "red" : "blue",
            assignedMatches: []
        });
    }

    public static async getAllUsers() {
        return await UserModel.findAll()
    }

    public static async resetAssignedMatchData() {
        const allUsers = await this.getAllUsers();
        allUsers.forEach((u) => {
            u.update({ assignedMatches: [] })
        })
    }
}

export default UserModel;