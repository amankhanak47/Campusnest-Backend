const { Sequelize, DataTypes } = require("sequelize");

// Create a Sequelize instance and connect to the PostgreSQL database
const sequelize = new Sequelize(
  "campusnest_usa",
  "campusnest_usa_user",
  "NF6HqarNcbiZBWVcz1rDqF9SfCcwh5Xk",
  {
    host: "dpg-cof8t5i1hbls739929bg-a.oregon-postgres.render.com",
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
const Messages = sequelize.define(
  "messages",
  {
    from: {
      type: DataTypes.INTEGER,
    },
    to: {
      type: DataTypes.INTEGER,
    },
    body: {
      type: DataTypes.STRING,
    },
    from_role: {
      type: DataTypes.STRING,
      },
    to_role: {
      type: DataTypes.STRING,
      },
    sent_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.fn("now"),
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
module.exports = Messages;
