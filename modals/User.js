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
const Users = sequelize.define(
  "users",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phno: {
      type: DataTypes.STRING,
      allowNull: false,
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
    degree: {
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
    college_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    course: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    interests: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    hobbies: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: '94854589'
    },
    blood_group: {
      type: DataTypes.STRING,
      allowNull: true,
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
//     await sequelize.sync({ force: false });
//     console.log("wek")
//   } catch (error) {
//     console.error('Error syncing user_details model:', error);
//   }
// })();

// Export the User model
module.exports = Users;
