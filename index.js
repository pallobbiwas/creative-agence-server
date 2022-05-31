const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

//middle tair

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello mama ami calu aci");
});

app.listen(port, () => {
  console.log(`ami kbl calu hoici ${port}`);
});
