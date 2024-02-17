const { Sequelize, DataTypes } = require("sequelize");

// Create a Sequelize instance and connect to the PostgreSQL database
const sequelize = new Sequelize(
  "campus_nest",
  "campus_nest_user",
  "zMKt4fejQIWvWDX7ZYY6FLQUDm3mfvlM",
  {
    host: "dpg-cmmht30cmk4c73e2bj6g-a.oregon-postgres.render.com",
    dialect: "postgres",
    dialectOptions: {
      statement_timeout: 60000,
      idle_in_transaction_session_timeout: 180000,
      conectionTimeoutMillis: 5000,
      ssl: {
        require: true,
        rejectUnauthorized: false, // For self-signed certificates
      },
    },
    pool: {
      max: 100,
      min: 0,
      idle: 30000,
    },
  }
);

// Define the User model
const Notifications = sequelize.define(
  "notifications",
  {
    user_id: {
      type: DataTypes.INTEGER,
    },
    body: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.STRING,
    },
    readAt: {
      type: DataTypes.DATE,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.fn("now"),
    },
  },
  {
    timestamps: false, // Disable Sequelize's automatic timestamp fields
  }
);

// (async () => {
//   try {
//     await sequelize.sync({ force: true }); // Use force: true to drop and recreate the table
//     console.log('User table created successfully');
//   } catch (error) {
//     console.error('Error syncing User model:', error);
//   } finally {
//     await sequelize.close(); // Close the connection after syncing
//   }
// })();

// Export the User model
module.exports = Notifications;
