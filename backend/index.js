const express = require('express');
const app = express();
app.use(express.json());
const cors = require("cors");
const path = require("path")
app.use(cors());

const jwt = require('jsonwebtoken');
require('dotenv').config();

const { User, Payment } = require('./schema');
const { authMiddleware } = require('./middleware');

app.post("/signup", async(req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    const userExists = await User.findOne({
        username: username
    })

    if(userExists){
        return res.status(403).json({
            message: "Duplicate user"
        })
    }

    const newUser = await User.create({
        username: username,
        password: password,
        firstName: firstName,
        lastName: lastName
    })

    res.json({
        message: "New user created",
        id: newUser._id
    })

})

app.post("/signin", async(req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const userExists = await User.findOne({
        username: username,
        password: password
    })

    if(!userExists){
        return res.status(403).json({
            message: "Invalid credentials"
        })
    }

    const token = jwt.sign({
        userId: userExists._id
    }, process.env.JWT_SECRET)

    res.json({
        token
    })
})

app.put("/editUser", authMiddleware, async(req, res) => {
    const userId = req.userId;

    const nfirstName = req.body.nfirstName;
    const nlastName = req.body.nlastName;

    if (!nfirstName || !nlastName) {
        return res.status(400).json({
            message: "First name and last name are required"
        });
    }

    const userExists = await User.findOne({
        _id: userId
    })

    if(!userExists){
        return res.status(404).json({
            message: "user doesnt exist"
        })
    }

    await User.updateOne({
        _id: userExists._id
    },{
        $set:{
            firstName: nfirstName,
            lastName: nlastName
        }
    })

    res.json({
        message: "User name edited"
    })
})

app.get("/findUser", async(req, res) => {
    const username = req.body.username;

    const userExists = await User.findOne({
        username: username
    })

    if(!userExists){
        return res.status(403).json({
            message: "user doesnt exist"
        })
    }

    res.json({
        userExists
    })
})

app.get("/userDetails", authMiddleware, async(req, res) => {
    const userId = req.userId;

    const userExists = await User.findOne({
        _id: userId
    })

    if(!userExists){
        return res.status(403).json({
            message: "user doesnt exist"
        })
    }

    const Chkbalance = await Payment.findOne({
        userId: userId
    })

    res.json({
        username: userExists.username,
        firstname: userExists.firstName,
        lastname: userExists.lastName,
        balance: Chkbalance.balance
    })

})

app.post("/wallet", authMiddleware, async(req, res) => {
    const userId = req.userId;
    const balance = 100;

    const userExists = await User.findOne({
        _id: userId
    })

    if(!userExists){
        return res.status(403).json({
            message: "user doesnt exist"
        })
    }

    const newWallet = await Payment.create({
        userId: userId,
        balance: balance
    })

    res.json({
        message: "new wallet created"
    })
})

app.get("/balance", authMiddleware, async(req, res) => {
    const userId = req.userId;

    const userExists = await User.findOne({
        _id: userId
    })

    if(!userExists){
        return res.status(403).json({
            message: "user doesnt exist"
        })
    }

    const Chkbalance = await Payment.findOne({
        userId: userId
    })

    res.json({
        username: userExists.username,
        balance: Chkbalance.balance
    })
})

app.post("/transfer", authMiddleware, async(req, res) => {
    const userId = req.userId;
    const reciever_user = req.body.reciever_user;
    const transferAmt = req.body.transferAmt;

    const recUserExists = await User.findOne({
        username: reciever_user
    })

    const userExists = await User.findOne({
        _id: userId
    })

    if(!recUserExists){
        return res.status(403).json({
            message: "reciever user doesnt exist"
        })
    }

    const myAcc = await Payment.findOne({
        userId: userId
    })

    const recAcc = await Payment.findOne({
        userId: recUserExists._id
    })

    if(transferAmt > myAcc.balance){
        return res.status(400).json({
            message: "Insufficient balance"
        })
    }

    myAcc.balance = myAcc.balance - transferAmt;
    recAcc.balance = recAcc.balance + +transferAmt;
    await myAcc.save();
    await recAcc.save();

    res.json({
        message: "Transfer successful",
        sender: {
            username: userExists.username,
            balance: myAcc.balance
        },
        receiver: {
            username: recUserExists.username,
            balance: recAcc.balance
        }
    });

})

const frontend_path = path.join(__dirname, "..", "frontend");

app.get("/signup", (req, res) => {
    res.sendFile(path.join(frontend_path, "signup.html"));
})

app.get("/signin", (req, res) => {
    res.sendFile(path.join(frontend_path, "signin.html"));
})

app.get("/", (req, res) => {
    res.sendFile(path.join(frontend_path, "index.html"));
})

app.listen(3000)