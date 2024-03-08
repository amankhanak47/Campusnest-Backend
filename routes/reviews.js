const express = require("express");
const router = express.Router();
const Admins = require("../modals/Admin");
const Owner = require("../modals/Owner");
const Users = require("../modals/User");
const authenticateUser = require("../middlewares/users-details");
const Feedback = require("../modals/Reviews");
const Reviews = require("../modals/Reviews");
const Slots = require("../modals/Slots");

router.post("/sendreview", authenticateUser, async (req, res) => {
  try {
    const feedback = req.body;
    const userId = req.user.id;

    const user = await Users.findOne({ where: { id: userId } });
    const data = {
      user_id: userId,
      feedback: feedback.feedback,
      role: "user",
      rating: feedback.rating,
      roomid: req.body?.roomid,
    };
    console.log(data);
    // Store feedback in the database
    await Feedback.create(data);

    // Send success response
    res.status(201).json({ success: true, message: req.body });
  } catch (error) {
    // Send error response
    console.error("Error submitting feedback:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to submit feedback" });
  }
});

router.get("/getreviews", async (req, res) => {
  try {
    // const query = "SELECT * FROM Reviews";

    // const {rows} = await pool.query(query)
    const rows = await Reviews.findAll({
      where: {
        roomid: null,
      },
      include: [
        { model: Users, as: "user" },
        { model: Slots, as: "slot" },
      ],
    });
    res.json(rows);
    res.status(204, {
      success: true,
      message: "data received",
    });
    console.log(rows);
  } catch (error) {
    console.log(error);
    res.status(500, {
      success: false,
      message: error,
    });
  }
});

router.post("/get-reviews-by-room", async (req, res) => {
  try {
    const rows = await Reviews.findAll({
      where: {
        roomid: req.body.roomid,
      },
      include: [
        { model: Users, as: "user" },
        { model: Slots, as: "slot" },
      ],
    });
    res.json(rows);
    res.status(204, {
      success: true,
      message: "data received",
    });
    console.log(rows);
  } catch (error) {
    console.log(error);
    res.status(500, {
      success: false,
      message: error,
    });
  }
});

router.post("/can-user-give-feedback", authenticateUser, async (req, res) => {
  try {
    const slot = await Slots.findAll({
      where: {
        room_id: req.body.roomid,
        user_id: req.user.id,
      },
    });
    if (slot.length > 0) {
      
      res.status(200).json({ success: true, message: "User can give feedback" });
    }

    res.status(200).json({ success: false, message: "User can't give feedback" });
  } catch (error) {
    console.log(error);
    res.status(500, {
      success: false,
      message: error,
    });
  }
});

module.exports = router;
