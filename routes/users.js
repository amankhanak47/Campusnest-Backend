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
})
router.put("/update-profile", authenticateUser, async (req, res) => {
  try {
    const dob = new Date(req.body.dob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    // Split hobbies and interests by commas
    const hobbies = req.body.hobbies ? req.body.hobbies.split(",") : [];
    const interests = req.body.interests ? req.body.interests.split(",") : [];

    // Generate hashed password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const [updatedCount, updatedUser] = await Users.update(
      {
        name: req.body.name,
        email: req.body.email,
        phno: req.body.phno,
        dob: req.body.dob,
        age: age, // Assign the calculated age
        gender: req.body.gender,
        degree: req.body.degree,
        state: req.body.state,
        country: req.body.country,
        pincode: req.body.pincode,
        college_name: req.body.college_name,
        course: req.body.course,
        interests: interests, // Assign parsed interests
        hobbies: hobbies, // Assign parsed hobbies
        certificates: req.body.certificates,
        password: hashedPassword,
        otp: "343434",
        blood_group: req.body.blood_group,
      },
      { where: { id: req.user.id }, returning: true }
    );

    if (updatedCount === 0) {
      return res.status(404).json({
        success: false,
        errors: "Profile not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      User: updatedUser[0],
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
