const { Sequelize, DataTypes, DATE } = require("sequelize");
const Users = require("./User");
const Slots = require("./Slots");

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

const Reviews = sequelize.define(
  "reviews",
  {
    user_id: {
      type: DataTypes.INTEGER,
    },

    feedback: {
      type: DataTypes.TEXT,
    },
    role: {
      type: DataTypes.STRING,
    },
    rating: {
      type: DataTypes.INTEGER,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.fn("now"),
    },
  },
  {
    timestamps: false,
  }
);
Reviews.belongsTo(Users, { foreignKey: "user_id", as: "user" });
Reviews.belongsTo(Slots, { foreignKey: "slot_id", as: "slot" });
// Reviews.sync()
//   .then(() => {
//     console.log("Reviews table created successfully.");
//   })
//   .catch((err) => {
//     console.error("Error creating Reviews table:", err);
//   });

module.exports = Reviews;
