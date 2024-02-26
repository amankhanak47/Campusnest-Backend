const express = require("express");
const router = express.Router();
const Admins = require("../modals/Admin");
const Owner = require("../modals/Owner");
const Users = require("../modals/User");
const authenticateUser = require("../middlewares/users-details");
const bcrypt = require("bcryptjs");
const cloud = require("../files/cloudinary");
const upload = require("../files/multer");
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
router.put("/update-profile", authenticateUser, upload.array("image", 1), async (req, res) => {
  try {
    const dob = new Date(req.body.dob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    const uploadedImage = await cloud.uploader.upload(req.files[0].path);
    // Split hobbies and interests by commas
    const hobbies = req.body.hobbies.length==1 ? req.body.hobbies.split(",") : [req.body.hobbies];
    const interests = req.body.interests.length==1 ? req.body.interests.split(",") : [req.body.interests];

    // Generate hashed password

    const [updatedCount, updatedUser] = await Users.update(
      {
        name: req.body.name,
        email: req.body.email,
        phno: req.body.phno,
        dob: req.body.dob,
        age: age, // Assign the calculated age
        gender: req.body.gender,
        degree: req.body.degree,
        address: req.body.address,
        state: req.body.state,
        country: req.body.country,
        pincode: req.body.pincode,
        college_name: req.body.college_name,
        course: req.body.course,
        interests: interests, // Assign parsed interests
        hobbies: hobbies, // Assign parsed hobbies
        profile_image: uploadedImage.secure_url,
        certificates: req.body.certificates,
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

router.put("/update-owner-profile", authenticateUser, upload.array("image", 1), async (req, res) => {
  try {
    const dob = new Date(req.body.dob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    const uploadedImage = await cloud.uploader.upload(req.files[0].path);

    const [updatedCount, updatedUser] = await Owner.update(
      {
        name: req.body.name,
        email: req.body.email,
        phno: req.body.phno,
        dob: req.body.dob,
        age: age, // Assign the calculated age
        gender: req.body.gender,
        state: req.body.state,
        address: req.body.address,
        uin: req.body.uin,
        country: req.body.country,
        pincode: req.body.pincode,
        ownership: req.body.ownership,
        profile_image: uploadedImage.secure_url,
        certificates: req.body.certificates,
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
