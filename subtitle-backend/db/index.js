// db/index.js
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('subtitle_editor', 'postgres', '14All', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
  logging: false,
});

// Test DB connection
export const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

export { sequelize };
