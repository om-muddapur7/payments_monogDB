const express = require('express');
const app = express();
app.use(express.json());

const jwt = require('jsonwebtoken');
require('.env').config();

const { User, Payment } = require('./schema');

app.post("/signup", async(req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;

    const userExists = await User.findOne({
        username: username
    })

    if(userExists){
        return res.status(403).json({
            message: "Duplicate user"
        })
    }

})

app.post("/signin", async(req, res) => {

})

app.put("/editUser", async(req, res) => {

})

app.get("/findUser", async(req, res) => {

})

app.get("/balance", async(req, res) => {

})

app.post("/transfer", async(req, res) => {

})

app.listen(3000)