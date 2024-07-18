const express = require("express");
const mongoose = require("mongoose")
const { Account } = require("../db");
const { authMiddleware } = require("../middleware");
const router = express.Router();

router.get("/balance", async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    })
    res.status(200).json({
        balance: account.balance
    })

})

router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();

    session.startTransaction()
    const { amount, to } = req.body;

    const account = await Account.findOne({
        userId: req.userId
    });

    if (!account || account.balance < amount) {
        await session.abortTransaction();
        res.status(400).json({
            message: "Insufficient Balance"
        })
    }

    const toAccount = await Account.findOne({
        userId: to
    })

    if (!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid Account"
        })
    }

    await Account.updateOne({
        userId: req.userId
    }, {
        $inc: {
            balance: amount
        }
    }).session(session)
    await Account.updateOne({
        userId: to
    }, {
        $inc: {
            balance: amount
        }
    }).session(session)

    await session.commitTransaction();
    res.status(200).json({
        message: "Transfer Successful"
    })

})

async function transfer(req) {
    const session = await mongoose.startSession();

    session.startTransaction();
    const { amount, to } = req.body;

    // Fetch the accounts within the transaction
    const account = await Account.findOne({ userId: req.userId }).session(session);

    if (!account || account.balance < amount) {
        await session.abortTransaction();
        console.log("Insufficient balance")
        return;
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);

    if (!toAccount) {
        await session.abortTransaction();
        console.log("Invalid account")
        return;
    }

    // Perform the transfer
    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    // Commit the transaction
    await session.commitTransaction();
    console.log("done")
}

transfer({
    userId: "65ac44e10ab2ec750ca666a5",
    body: {
        to: "65ac44e40ab2ec750ca666aa",
        amount: 100
    }
})

transfer({
    userId: "65ac44e10ab2ec750ca666a5",
    body: {
        to: "65ac44e40ab2ec750ca666aa",
        amount: 100
    }
})

module.exports = router;