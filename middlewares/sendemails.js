var nodemailer = require("nodemailer");
const Users = require("../modals/User");
const Owner = require("../modals/Owner");
const Admins = require("../modals/Admin");
async function sendEmail({ user_id, role, body }) {
  try {
    let model;
    if (role == "user") {
      model = Users;
    } else if (role == "owner") {
      model = Owner;
    } else if (role == "admin") {
      model = Admins;
    }
    const reciever = await model.findOne({
      where: { id: user_id },
    });
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "20211a05j2@bvrit.ac.in",
        pass: "Aman@2002",
      },
    });

    var mailOptions = {
      from: "20211a05j2@bvrit.ac.in",
      to: reciever.email,
      subject: "CampusNest Notifications",
      html: `<p>${body}</p>`,
    };
    let sucess;
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
            sucess = true;
        }
    });
  } catch (err) {
    console.log(err)
  }
}

module.exports = sendEmail;
