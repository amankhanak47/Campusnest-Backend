const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const Messages = require("./modals/Messages.js");
const { Sequelize } = require("sequelize");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(bodyParser.json());

const ioOptions = {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"] 
  }
};


io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("chat message", async (msg, cb) => {
    const message=await Messages.create({
      body: msg.body,
      from: msg.from,
      to: msg.to,
      from_role: msg.from_role,
      to_role: msg.to_role,
      sent_at: Sequelize.fn("now")
    })
    io.emit("chat message", message);
    cb?.(message)
  });
});


app.use(cors());
const port = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("campus nest");
});

app.use(express.json({limit : '50mb',extended : true}))
app.use(express.urlencoded({limit : '50mb',extended : true}))

app.use("/auth", require("./routes/auth.js"));
app.use("/", require("./routes/rooms.js"));
app.use("/get", require("./routes/users.js"));
app.use("/",require("./routes/reviews.js"))
app.use(bodyParser.json());

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
