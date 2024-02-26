const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const Admins = require("../modals/Admin");
const Owner = require("../modals/Owner");
const Users = require("../modals/User");
const Rooms = require("../modals/Rooms");
const cloud = require("../files/cloudinary");
const upload = require("../files/multer");
const Slots = require("../modals/Slots");
const JWT_SECRET = "qwertyuiop";

router.post("/student-signup", upload.array("image", 1), async (req, res) => {
  try {
    
    const existingUser = await Users.findOne({
      where: { email: req.body.email },
    });
    console.log(req.files)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        errors: [{ msg: "A user with this email already exists." }],
      });
    }
    const uploadedImage = await cloud.uploader.upload(req.files[0].path);
    const dob = new Date(req.body.dob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    const hobbies = req.body.hobbies ? req.body.hobbies.split(",") : [];
    const interests = req.body.interests ? req.body.interests.split(",") : [];

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = await Users.create({
      name: req.body.name,
      email: req.body.email,
      phno: req.body.phno,
      dob: req.body.dob,
      age: age,
      gender: req.body.gender,
      degree: req.body.degree,
      address: req.body.address,
      state: req.body.state,
      country: req.body.country,
      pincode: req.body.pincode,
      college_name: req.body.college_name,
      course: req.body.course,
      interests: interests, 
      hobbies: hobbies, 
      profile_image: uploadedImage.secure_url,
      password: hashedPassword,
      otp: "343434",
      blood_group: req.body.blood_group,
    });

    const data = {
      user: {
        id: newUser.id,
      },
    };
    const authToken = jwt.sign(data, JWT_SECRET);

    res.json({
      success: true,
      authToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

router.post("/admin-signup", async (req, res) => {
  try {
    const existingUser = await Admins.findOne({
      where: { email: req.body.email },
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        errors: [{ msg: "A user with this email already exists." }],
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = await Admins.create({
      name: req.body.name,
      email: req.body.email,
      phno: req.body.phno,
      dob: req.body.dob,
      age: req.body.age,
      location: req.body.location,
      gender: req.body.gender,
      password: hashedPassword,
      otp: req.body.otp,
      blood_group: req.body.blood_group,
    });

    const data = {
      user: {
        id: newUser.id,
      },
    };

    const authToken = jwt.sign(data, JWT_SECRET);

    res.json({
      success: true,
      authToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

router.post(
  "/owner-signup",upload.array("image",1),async(req,res)=>{
      try {
        const existingUser = await Owner.findOne({
          where :{email:req.body.email}
        })
        if(existingUser){
          return res.status(400).json({
            success:false,
            error:[{msg:"A User with email already exists"}]
          })
        }
        const uploadedImage = await cloud.uploader.upload(req.files[0].path);
        const dob = new Date(req.body.dob);
        const today = new Date();
        let age = today.getFullYear()-dob.getFullYear();
        const monthDiff = today.getMonth()-dob.getMonth();
        if(monthDiff < 0|| (monthDiff===0 && today.getDate()<dob.getDate())){
          age--;
        } 
      
    
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      const newUser = await Owner.create({
        name: req.body.name,
        email: req.body.email,
        phno: req.body.phno,
        dob: req.body.dob,
        age: age,
        gender: req.body.gender,
        password: hashedPassword,
        otp: "34567",
        blood_group: req.body.blood_group,
        country: req.body.country,
        address: req.body.address,
        state: req.body.state,
        pincode: req.body.pincode,
        uin: req.body.uin,
        profile_image: uploadedImage.secure_url,
        ownership: req.body.ownership,
      });

      const data = {
        user: {
          id: newUser.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);

      res.json({
        success: true,
        authToken,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        errors: "Internal Server Error",
      });
    }
  }
);

router.post("/student-login", async (req, res) => {
  try {
    const user = await Users.findOne({
      where: { email: req.body.email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        errors: [{ msg: "Invalid credentials. User not found." }],
      });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        errors: [{ msg: "Invalid credentials. Incorrect password." }],
      });
    }

    // If the credentials are valid, create a JWT token
    const data = {
      user: {
        id: user.id,
      },
    };

    const authToken = jwt.sign(data, JWT_SECRET);

    res.json({
      success: true,
      authToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

router.post("/admin-login", async (req, res) => {
  try {
    const user = await Admins.findOne({
      where: { email: req.body.email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        errors: "Invalid credentials. User not found.",
      });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        errors: "Invalid credentials. Incorrect password.",
      });
    }

    // If the credentials are valid, create a JWT token
    const data = {
      user: {
        id: user.id,
      },
    };

    const authToken = jwt.sign(data, JWT_SECRET);

    res.json({
      success: true,
      authToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

router.post("/owner-login", async (req, res) => {
  try {
    const user = await Owner.findOne({
      where: { email: req.body.email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        errors: [{ msg: "Invalid credentials. User not found." }],
      });
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        errors: [{ msg: "Invalid credentials. Incorrect password." }],
      });
    }

    const data = {
      user: {
        id: user.id,
      },
    };

    const authToken = jwt.sign(data, JWT_SECRET);

    res.json({
      success: true,
      authToken,
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
