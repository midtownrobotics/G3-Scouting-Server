import { Sequelize } from 'sequelize-typescript';
import UserModel from './UserModel';
import ResponseModel from './ResponseModel';

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './storage/database.db', // Path to the SQLite database file
    models: [UserModel, ResponseModel],
    logging: false
});

export default sequelize;