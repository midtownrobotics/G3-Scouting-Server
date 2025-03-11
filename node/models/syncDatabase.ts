import sequelize from './sequelize';

async function syncDatabase() {
    try {
        // Sync all defined models to the DB
        await sequelize.sync({ force: false }); // `force: false` prevents dropping the table if it exists
        console.log("Synced database succesfully!")
    } catch (error) {
        console.log('Error synchronizing database:' + error);
    }
}

export default syncDatabase;