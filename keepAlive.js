const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("The bot is running!");
});

const keepAlive = () => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Keep-alive server running on port ${PORT}`);
  });
};

module.exports = keepAlive;
