const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
app.get("/", (req, res) => {
    res.send("Hello from server!");
});
app.listen(port, () => console.log(`Server listening on ${port}`));
