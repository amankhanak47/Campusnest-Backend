const express = require("express");
const router = express.Router();
const Admins = require("../modals/Admin");
const Owner = require("../modals/Owner");
const Users = require("../modals/User");
const Rooms = require("../modals/Rooms");
const Slots = require("../modals/Slots");
const authenticateUser = require("../middlewares/users-details");
const upload = require("../files/multer");
const cloud = require("../files/cloudinary");
const { Sequelize, Op } = require("sequelize");
const Notifications = require("../modals/Notifications");
var jwt = require("jsonwebtoken");
const Messages = require("../modals/Messages");
const sendEmail = require("../middlewares/sendemails");
const JWT_SECRET = "qwertyuiop";
const { spawn } = require("child_process");
router.post(
  "/create-room",
  authenticateUser,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const uploadedFiles = req.files;

      const ownerId = req.user.id;

      const uploadedUrls = await Promise.all(
        uploadedFiles.map(async (file) => {
          const uploadedImage = await cloud.uploader.upload(file.path);
          return uploadedImage.secure_url;
        })
      );

      const newRoom = await Rooms.create({
        owner_id: ownerId,
        admin_id: 1,
        name: req.body.name,
        description: req.body.description,
        bedrooms: req.body.bedrooms,
        bathrooms: req.body.bathrooms,
        locationurl: req.body.locationurl,
        description: req.body.description,
        address: req.body.address,
        state: req.body.state,
        country: req.body.country,
        pincode: req.body.pincode,
        rating: "5",
        price: req.body.price,
        slots: req.body.slots,
        available_slots: req.body.slots,
        images: uploadedUrls,
      });
      await Notifications.create({
        user_id: req.user.id,
        role: "owner",
        body: `your creation request for room (${newRoom.name} / ${newRoom.id}) has been sent to admin for verification ... we will reach back to you soon`,
      });
      sendEmail({
        user_id: req.user.id,
        role: "owner",
        body: `your creation request for room (${newRoom.name} / ${newRoom.id}) has been sent to admin for verification ... we will reach back to you soon`,
      });
      await Notifications.create({
        user_id: newRoom.admin_id,
        role: "admin",
        body: `New Request by Owner to the room (${newRoom.name} / ${newRoom.id}) is waiting for approval`,
      });
      sendEmail({
        user_id: newRoom.admin_id,
        role: "admin",
        body: `New Request by Owner to the room (${newRoom.name} / ${newRoom.id}) is waiting for approval`,
      });
      res.json({
        success: true,
        message: "Room created successfully",
        room: newRoom,
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

router.put(
  "/update-room",
  authenticateUser,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const uploadedFiles = req.files;

      const uploadedUrls = await Promise.all(
        uploadedFiles.map(async (file) => {
          const uploadedImage = await cloud.uploader.upload(file.path);
          return uploadedImage.secure_url;
        })
      );

      uploadedUrls.push(req.body.images);

      const [updatedCount, updatedRooms] = await Rooms.update(
        {
          name: req.body.name,
          description: req.body.description,
          bedrooms: req.body.bedrooms,
          bathrooms: req.body.bathrooms,
          locationurl: req.body.locationurl,
          description: req.body.description,
          address: req.body.address,
          state: req.body.state,
          country: req.body.country,
          pincode: req.body.pincode,
          rating: "5",
          price: req.body.price,
          slots: req.body.slots,
          available_slots: req.body.slots,
          images: uploadedUrls,
          status: "pending",
        },
        { where: { id: req.body.id }, returning: true }
      );

      if (updatedCount === 0) {
        return res.status(404).json({
          success: false,
          errors: "Room not found",
        });
      }

      res.json({
        success: true,
        message: "Room updated successfully",
        room: updatedRooms[0],
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

router.delete("/delete-room", authenticateUser, async (req, res) => {
  try {
    // Check if there are any related slots
    const existingSlots = await Slots.findOne({
      where: {
        room_id: req.body.roomId,
      },
    });

    if (existingSlots) {
      // If related slots exist, handle the situation accordingly
      return res.status(400).json({
        success: false,
        errors:
          "Cannot delete room because some one already requested for this slots.",
      });
    }

    // If no related slots, proceed with deleting the room
    const deletedRoom = await Rooms.destroy({
      where: {
        owner_id: req.user.id,
        id: req.body.roomId,
      },
    });

    if (deletedRoom === 0) {
      return res.status(404).json({
        success: false,
        errors: "Room not found",
      });
    }

    res.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

router.get("/owner-rooms", authenticateUser, async (req, res) => {
  try {
    const ownerId = req.user.id;

    const ownerrooms = await Rooms.findAll({
      where: { owner_id: ownerId },
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      rooms: ownerrooms,
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
  "/request-room",
  authenticateUser,
  upload.fields([
    { name: "docs", maxCount: 1 },
    { name: "college_letter", maxCount: 1 },
    { name: "visa", maxCount: 1 },
    { name: "id_proof", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const checkExistingSlot = await Slots.findOne({
        where: {
          room_id: req.body.roomId,
          user_id: req.user.id,
        },
      });
      if (checkExistingSlot) {
        return res.json({
          success: false,
          error: "Already requested for this Room",
        });
      }

      const existingRoom = await Rooms.findOne({
        where: { id: req.body.roomId },
      });

      const uploadedUrls = {
        docs: await cloud.uploader.upload(req.files["docs"][0].path),
        college_letter: await cloud.uploader.upload(
          req.files["college_letter"][0].path
        ),
        visa: await cloud.uploader.upload(req.files["visa"][0].path),
        id_proof: await cloud.uploader.upload(req.files["id_proof"][0].path),
      };

      const newRequest = await Slots.create({
        user_id: req.user.id,
        owner_id: existingRoom.owner_id,
        admin_id: existingRoom.admin_id || 1,
        room_id: req.body.roomId,
        doj: req.body.doj,
        amount_paid: req.body.amount_paid || 0,
        docs: uploadedUrls.docs.secure_url,
        college_letter: uploadedUrls.college_letter.secure_url,
        id_proof: uploadedUrls.id_proof.secure_url,
        visa: uploadedUrls.visa.secure_url,
        requested_at: Sequelize.fn("now"),
        status: "pending",
      });

      await Notifications.create({
        user_id: req.user.id,
        role: "user",
        body: `Your booking request for room (${existingRoom.name} / ${existingRoom.id}) has been sent to admin for verification. We will reach back to you soon.`,
      });
      sendEmail({
        user_id: req.user.id,
        role: "user",
        body: `Your booking request for room (${existingRoom.name} / ${existingRoom.id}) has been sent to admin for verification. We will reach back to you soon.`,
      });
      await Notifications.create({
        user_id: existingRoom.admin_id,
        role: "admin",
        body: `New request by student for the room (${existingRoom.name} / ${existingRoom.id}) is waiting for approval.`,
      });

      sendEmail({
        user_id: existingRoom.admin_id,
        role: "admin",
        body: `New request by student for the room (${existingRoom.name} / ${existingRoom.id}) is waiting for approval.`,
      });

      return res.json({
        success: true,
        message: "Room request created successfully",
        request: newRequest,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  }
);

router.get("/user-slots", authenticateUser, async (req, res) => {
  try {
    const slots = await Slots.findAll({
      include: [
        { model: Users, as: "user" },
        { model: Rooms, as: "room" },
      ],
      where: {
        user_id: req.user.id,
      },
      order: [["created_at", "DESC"]],
    });
    res.json({
      success: true,
      slots: slots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

router.get("/allrooms", async (req, res) => {
  try {
    // Fetch all the slots and include the user and admin associations
    const rooms = await Rooms.findAll({
      include: [{ model: Owner, as: "owner" }],
      where: {
        status: "approved",
      },
      order: [["created_at", "DESC"]],
    });
    res.json({
      success: true,
      rooms: rooms,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

router.post("/room", async (req, res) => {
  try {
    const room = await Rooms.findOne({
      include: [{ model: Owner, as: "owner" }],
      where: {
        id: req.body.roomId,
      },
    });
    res.json({
      success: true,
      room: room,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

router.get("/room-requests", async (req, res) => {
  try {
    const rooms = await Rooms.findAll({
      include: [{ model: Owner, as: "owner" }],
      where: {
        status: "pending",
      },
      order: [["created_at", "DESC"]],
    });
    res.json({
      success: true,
      rooms: rooms,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

router.get("/slot-requests", async (req, res) => {
  try {
    const slots = await Slots.findAll({
      include: [
        { model: Users, as: "user" },
        { model: Rooms, as: "room" },
      ],
      where: {
        status: "pending",
      },
      order: [["created_at", "DESC"]],
    });
    res.json({
      success: true,
      slots: slots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

router.put("/approve-room", async (req, res) => {
  try {
    const [rowcount, room] = await Rooms.update(
      {
        status: "approved",
      },
      {
        where: {
          id: req.body.roomId,
        },
        returning: true,
      }
    );
    await Notifications.create({
      user_id: room[0].owner_id,
      role: "owner",
      body: `Your request to room (${room[0].name} / ${room[0].id}) has be approved by the admin`,
    });
    sendEmail({
      user_id: room[0].owner_id,
      role: "owner",
      body: `Your request to room (${room[0].name} / ${room[0].id}) has be approved by the admin`,
    });
    res.json({
      success: true,
      room: room,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

router.put("/reject-room", async (req, res) => {
  try {
    const [rowcount, room] = await Rooms.update(
      {
        status: "rejected",
      },
      {
        where: {
          id: req.body.roomId,
        },
        returning: true,
      }
    );

    await Notifications.create({
      user_id: room[0].owner_id,
      role: "owner",
      body: `Your request to room (${room[0].name} / ${room[0].id}) has be rejected by the admin because of improper documents`,
    });
    sendEmail({
      user_id: room[0].owner_id,
      role: "owner",
      body: `Your request to room (${room[0].name} / ${room[0].id}) has be rejected by the admin because of improper documents`,
    });
    res.json({
      success: true,
      room: room,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

router.put("/approve-user-details", async (req, res) => {
  try {
    const [rowcount, slot] = await Slots.update(
      {
        status: "approved",
      },
      {
        where: {
          id: req.body.slotId,
        },
        returning: true,
      }
    );
    const room = await Rooms.findOne({ where: { id: slot[0].room_id } });
    await Notifications.create({
      user_id: slot[0].user_id,
      role: "user",
      body: `Your request to room (${room.name} / ${room.id}) has been approved by the admin,.. now you can chat with owner in bookings tab`,
    });

    sendEmail({
      user_id: slot[0].user_id,
      role: "user",
      body: `Your request to room (${room.name} / ${room.id}) has been approved by the admin,.. now you can chat with owner in bookings tab`,
    });
    res.json({
      success: true,
      slot: slot,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

router.put("/reject-user-details", async (req, res) => {
  try {
    const [rowcount, slot] = await Slots.update(
      {
        status: "rejected",
      },
      {
        where: {
          id: req.body.slotId,
        },
        returning: true,
      }
    );
    const room = await Rooms.findOne({ where: { id: slot[0].room_id } });
    await Notifications.create({
      user_id: slot[0].user_id,
      role: "user",
      body: `Your request to room (${room.name} / ${room.id}) has been rejected by the admin because of improper documents`,
    });

    sendEmail({
      user_id: slot[0].user_id,
      role: "user",
      body: `Your request to room (${room.name} / ${room.id}) has been rejected by the admin because of improper documents`,
    });
    res.json({
      success: true,
      slot: slot,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

router.post("/get-notifications", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    let userId;
    if (token != undefined) {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.user.id;
    }
    const notifications = await Notifications.findAll({
      where: {
        user_id: userId || 1,
        role: req.body.role,
      },
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      notifications: notifications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

router.get("/get-user-chats", authenticateUser, async (req, res) => {
  try {
    const slots = await Slots.findAll({
      include: [
        { model: Owner, as: "owner" },
        { model: Rooms, as: "room" },
      ],

      where: {
        user_id: req.user.id,
        status: "approved",
      },
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      slots: slots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

router.get("/get-owner-chats", authenticateUser, async (req, res) => {
  try {
    const slots = await Slots.findAll({
      include: [
        { model: Users, as: "user" },
        { model: Rooms, as: "room" },
      ],

      where: {
        owner_id: req.user.id,
        status: "approved",
      },
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      slots: slots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});

router.post("/get-user-chat-messages", async (req, res) => {
  try {
    const messages = await Messages.findAll({
      where: {
        [Op.or]: [
          {
            from: req.body.from,
            from_role: req.body.from_role,
            to: req.body.to,
            to_role: req.body.to_role,
          },
          {
            from: req.body.to,
            from_role: req.body.to_role,
            to: req.body.from,
            to_role: req.body.from_role,
          },
        ],
      },
      order: [["sent_at", "ASC"]],
    });

    res.json({
      success: true,
      messages: messages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      errors: "Internal Server Error",
    });
  }
});
router.post("/matchUsers", (req, res) => {
  const userData = req.body;

  const pythonProcess = spawn("python", [
    "match_users.py",
    JSON.stringify(userData),
  ]);

  let dataBuffer = "";
  pythonProcess.stdout.on("data", (data) => {
    dataBuffer += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Error from Python script: ${data}`);
  });

  pythonProcess.on("close", async (code) => {
    const matchingUsers = JSON.parse(dataBuffer);
    const userIds = matchingUsers.map((user) => user.id);

    const slots = await Slots.findAll({
      where: {
        user_id: {
          [Op.in]: userIds,
        },
        status: "approved",
      },
    });

    const roomIds = slots.map((slot) => slot.room_id);

    const rooms = await Rooms.findAll({
      where: {
        id: {
          [Op.in]: roomIds,
        },
      },
    });
    res.json({
      success: true,
      matchingUsers: matchingUsers,
      rooms: rooms,
    });
  });
});
module.exports = router;
