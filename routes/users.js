const express = require("express");
const router = express.Router();
const Admins = require("../modals/Admin");
const Owner = require("../modals/Owner");
const Users = require("../modals/User");
const authenticateUser = require("../middlewares/users-details");

router.get("/user-details", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

      const user = await Users.findOne({ where: { id: userId } });
      
    res.json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

router.get("/owner-details", authenticateUser, async (req, res) => {
  try {
    const ownerId = req.user.id;

      const owner = await Owner.findOne({ where: { id: ownerId } });
      
    res.json({
      success: true,
      owner: owner,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

module.exports = router;