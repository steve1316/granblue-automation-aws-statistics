import express, { Router } from "express"
import { ResultInterface } from "../interfaces/ResultInterface"
import { UserInterface } from "../interfaces/UserInterface"
import Item from "../schemas/Item"
import Result from "../schemas/Result"
import User from "../schemas/User"

const router: Router = express.Router()

// POST route to create a new result for an item. The bot at this point has already checked if the item exists before calling this.
router.post("/create-result/:username/:itemName/:platform/:amount", async (req, res) => {
    const { username, itemName, platform, amount } = req.params
    if (!username || !itemName || !platform || !amount || typeof username !== "string" || typeof itemName !== "string" || typeof platform !== "string" || typeof amount !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    } else if (Number(amount) === NaN) {
        res.status(400).send("Improper value for the item amount.")
        return
    }

    await User.findOne({ userID: username }, async (err: Error, doc: UserInterface) => {
        if (err) throw err

        if (doc) {
            // Create the new Result object.
            let date = new Date()
            const newResult = new Result({
                userID: username,
                itemName: itemName,
                amount: amount,
                platform: platform,
                date: `${date.getUTCMonth() + 1}.${date.getUTCDate()}.${date.getUTCFullYear()}`,
            })

            // Save the new Result to the results collection.
            await newResult.save()

            // Now update the total amount for this item.
            await Item.updateOne({ itemName: itemName }, { $inc: { totalAmount: amount } }).exec()
            res.status(201).send("Successfully sent the result and updated the total amount.")
        } else {
            res.status(404).send("User does not exist.")
        }
    }).clone()
})

// GET route to fetch multiple results via user ID.
router.get("/get-result/user/:username", async (req, res) => {
    const { username } = req.params
    if (!username || typeof username !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    await Result.find({ userID: username }, (err: Error, docs: ResultInterface[]) => {
        if (err) throw err

        if (docs) {
            res.status(200).send(docs)
        } else {
            res.status(200).send("No results have been posted yet for this user.")
        }
    }).clone()
})

// GET route to fetch multiple results via the item name.
router.get("/get-result/item/:itemName", async (req, res) => {
    const { itemName } = req.params
    if (!itemName || typeof itemName !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    await Result.find({ itemName: itemName }, (err: Error, docs: ResultInterface[]) => {
        if (err) throw err

        if (docs) {
            res.status(200).send(docs)
        } else {
            res.status(200).send(`No results have been posted yet for this item ${itemName}.`)
        }
    }).clone()
})

// GET route to fetch multiple results via the Farming Mode.
router.get("/get-result/farmingMode/:farmingMode", async (req, res) => {
    const { farmingMode } = req.params
    if (!farmingMode || typeof farmingMode !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    await Result.find({ farmingMode: farmingMode }, (err: Error, docs: ResultInterface[]) => {
        if (err) throw err

        if (docs) {
            res.status(200).send(docs)
        } else {
            res.status(200).send(`No results have been posted yet for the Farming Mode: ${farmingMode}.`)
        }
    }).clone()
})

export default router
