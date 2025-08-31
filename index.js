require("dotenv").config()

const connectDB = require("./db");

connectDB();

const express = require("express");
const app = express();
const PORT = process.env.PORT;
const cors = require("cors")

app.use(cors())

app.get ('/', (req,res) => {
    res.status(200).send({msg: 'welcome to smart clinic'})
})



app.use(express.json());

app.use('/auth', require('./routes/auth'))


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});