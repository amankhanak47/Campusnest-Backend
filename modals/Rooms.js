const { Sequelize, DataTypes } = require("sequelize");
const Admins = require("./Admin");
const Owner = require("./Owner");

// Create a Sequelize instance and connect to the PostgreSQL database
const sequelize = new Sequelize(
  "campus_nest",
  "campus_nest_user",
  "zMKt4fejQIWvWDX7ZYY6FLQUDm3mfvlM",
  {
    host: "dpg-cmmht30cmk4c73e2bj6g-a.oregon-postgres.render.com",
    dialect: "postgres",
    dialectOptions: {
      "statement_timeout": 60000,
      "idle_in_transaction_session_timeout": 180000,
      "conectionTimeoutMillis": 5000,
      ssl: {
        require: true,
        rejectUnauthorized: false, // For self-signed certificates
      },
    },
    "pool": {
      "max": 100,
      "min": 0,
      "idle": 30000
    }
  }
);

// Define the User model
const Rooms = sequelize.define(
  "rooms",
  {
    owner_id: {
      type: DataTypes.INTEGER,
      //allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      //allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      //allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      //allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      //allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      //allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING,
      //allowNull: false,
    },
    lattitude: {
      type: DataTypes.STRING,
      //allowNull: false,
    },
    longitude: {
      type: DataTypes.STRING,
      //allowNull: false,
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      //allowNull: false,
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      //allowNull: false,
    },
    locationurl: {
      type: DataTypes.STRING,
      //allowNull: false,
    },
    rating: {
      type: DataTypes.STRING,
      //allowNull: true,
    },
    price: {
      type: DataTypes.STRING,
      //allowNull: false,
    },
    slots: {
      type: DataTypes.INTEGER,
      //allowNull: false,
    },
    available_slots: {
      type: DataTypes.INTEGER,
      //allowNull: false,
    },
    admin_id: {
      type: DataTypes.INTEGER,
      //allowNull: false,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      //allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.fn("now"),
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
      //allowNull: false
    }
  },
  {
    timestamps: false, // Disable Sequelize's automatic timestamp fields
  }
);

  Rooms.belongsTo(Admins, { foreignKey: "admin_id", as: "admin" });
  Rooms.belongsTo(Owner, { foreignKey: "owner_id", as: "owner" });



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
module.exports = Rooms;
