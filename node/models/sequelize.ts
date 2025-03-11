import { Sequelize } from 'sequelize-typescript';
import UserModel from './UserModel';
import MatchModel from './MatchModel';
import ScheduleModel from './ScheduleModel';

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './storage/database.db', // Path to the SQLite database file
    models: [UserModel, MatchModel, ScheduleModel],
    logging: false
});

export default sequelize;