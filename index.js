const express = require("express");
var cors = require("cors");
const app = express();
var bodyParser = require('body-parser');

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


app.use(bodyParser.json());
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});