const express = require('express');
const app = express();
app.all("/", (req, res) => {
  res.send("Bot is running!");
})
function running() {
  app.listen(3000, () => {
    console.log("Project is running!");
  })
}
module.exports = running