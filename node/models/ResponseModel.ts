import { Column, DataType, Model, Table } from "sequelize-typescript";
import { ResponseCreationAttributes, Response } from "./types";

@Table({ tableName: "responses", timestamps: false })
class ResponseModel extends Model<Response, ResponseCreationAttributes> {
    @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
    declare id: number;

    @Column({ type: DataType.TEXT, allowNull: true })
    public matchNum!: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    public teamNum!: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    public autoL1!: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    public autoL2!: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    public autoL3!: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    public autoL4!: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    public matchL1!: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    public matchL2!: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    public matchL3!: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    public matchL4!: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    public barge!: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    public processor!: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    public climb!: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    public additionalNotes!: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    public timestamp!: string;

    @Column({ type: DataType.INTEGER, allowNull: true })
    public scoutId!: number;

    @Column({ type: DataType.TEXT, allowNull: true })
    public scout!: string;
}

export default ResponseModel;