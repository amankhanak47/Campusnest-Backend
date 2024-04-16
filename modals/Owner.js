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
const Owner = sequelize.define(
  "owners",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phno: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    dob: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ownership:{
      type:DataTypes.STRING,
      allowNull:false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp: {
      type: DataTypes.INTEGER,
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


// (async () => {
//   try {
//     await sequelize.sync();
//     console.log("wek")
//   } catch (error) {
//     console.error('Error syncing user_details model:', error);
//   }
// })();

// Export the User model
module.exports = Owner;
