const { Sequelize, DataTypes } = require("sequelize");
const Users = require("./User");
const Admins = require("./Admin");
const Owner = require("./Owner");
const Rooms = require("./Rooms");

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

// Define the Slots model
const Slots = sequelize.define(
  "slots",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    doj: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    amount_paid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    docs: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      //allowNull: false,
    },
    requested_at: {
      type: DataTypes.DATE,
      allowNull: false,
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



  Slots.belongsTo(Users, { foreignKey: "user_id", as: "user" });
  Slots.belongsTo(Admins, { foreignKey: "admin_id", as: "admin" });
Slots.belongsTo(Owner, { foreignKey: "owner_id", as: "owner" });
Slots.belongsTo(Rooms, { foreignKey: "room_id", as: "room" });


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

// Export the Slots model
module.exports = Slots;