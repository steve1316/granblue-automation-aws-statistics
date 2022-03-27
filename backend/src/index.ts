import { ResultInterface } from "./interfaces/ResultInterface"
import { ItemInterface } from "./interfaces/ItemInterface"
import bcrypt from "bcryptjs"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express, { Request, Response } from "express"
import mongoose, { MongooseError } from "mongoose"
import passport from "passport"
import passportLocal from "passport-local"
import session from "express-session"
import User from "./schemas/User"
import { UserInterface } from "./interfaces/UserInterface"
import Item from "./schemas/Item"
import Result from "./schemas/Result"

require("dotenv").config()

////////////////////
// Connect to MongoDB cluster.
mongoose.connect(`mongodb+srv://steve1316:${process.env.MONGODB_PASSWORD}@cluster0.bms87.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, (err: MongooseError) => {
    if (err) {
        throw err
    }
    console.log("Connected to MongoDB Cluster.")
})

////////////////////
// Middleware
const expressPort = 4000
const app = express()
app.use(express.json())
app.use(cors({ origin: "http://localhost:3000", credentials: true }))
app.use(
    session({
        secret: "secretcode",
        resave: true,
        saveUninitialized: true,
    })
)
app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())

////////////////////
// Passport
const LocalStrategy = passportLocal.Strategy
passport.use(
    new LocalStrategy((username, password, done) => {
        User.findOne({ username: username }, (err: Error, user: UserInterface) => {
            if (err) {
                throw err
            }

            if (!user) {
                return done(null, false)
            } else {
                // Use bcrypt to compare the hashes.
                bcrypt.compare(password, user.password, (bcryptError, result) => {
                    if (bcryptError) {
                        throw bcryptError
                    }

                    if (result === true) {
                        return done(null, user)
                    } else {
                        return done(null, false)
                    }
                })
            }
        })
    })
)
passport.serializeUser((user: any, cb) => {
    cb(null, user.id)
})
passport.deserializeUser((id: string, cb) => {
    User.findOne({ _id: id }, (err: Error, user: UserInterface) => {
        const userInfo = {
            username: user.username,
            isAdmin: user.isAdmin,
        }

        cb(err, userInfo)
    })
})

////////////////////
// Routes

// POST route to register a new user.
app.post("/register", async (req: Request, res: Response) => {
    // Destructure the username, password and email fields and perform type validation.
    const { username, password, email } = req?.body
    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
        res.status(400).send("Improper values for username or password.")
        return
    } else if (typeof email !== "string") {
        res.status(400).send("Improper value for email.")
        return
    }

    // Check if user already exists.
    User.findOne({ username }, async (err: Error, doc: UserInterface) => {
        if (err) {
            throw err
        }

        if (doc) {
            res.status(409).send("User ID already exists.")
        } else {
            // Hash the user's password.
            const hashedPassword = await bcrypt.hash(req.body.password, 10)

            // Create the new User object.
            const newUser = new User({
                username: req.body.username,
                password: hashedPassword,
                email: email,
            })

            // Save the new User to the collection.
            await newUser.save()
            res.status(201).send("Successfully created user.")
        }
    })
})

// POST route to login via passport authentication.
app.post("/login", passport.authenticate("local"), (req, res) => {
    res.status(200).send("Successfully authenticated user.")
})

// GET route to get the logged in user.
app.get("/user", (req, res) => {
    res.status(200).send(req.user)
})

// GET route to log out the user.
app.get("/logout", (req, res) => {
    req.logout()
    res.status(200).send("Successfully logged out.")
})

// POST route to create an item if it does not already exist.
app.post("/create-item/:farmingMode/:itemName", async (req, res) => {
    const { farmingMode, itemName } = req.params
    if (!farmingMode || !itemName || typeof farmingMode !== "string" || typeof itemName !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    await Item.findOne({ itemName }, async (err: Error, doc: ItemInterface) => {
        if (err) throw err

        if (doc) {
            return
        } else {
            // Create the new Item object to the items collection.
            const newItem = new Item({
                itemName: itemName,
                farmingMode: farmingMode,
            })

            // Save the new Item.
            await newItem.save()
            res.status(201).send(`Successfully created item "${itemName}".`)
        }
    }).clone()
})

// GET route to fetch multiple items via the Farming Mode.
app.get("/get-item/:farmingMode", async (req, res) => {
    const { farmingMode } = req.params
    if (!farmingMode || typeof farmingMode !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    await Item.find({ farmingMode }, (err: Error, docs: ItemInterface[]) => {
        if (err) throw err

        if (docs) {
            res.status(200).send(docs)
        } else {
            res.status(404).send(`No Items have been created for Farming Mode "${farmingMode}" yet.`)
        }
    }).clone()
})

// GET route to fetch an item via the item name.
app.get("/get-item/:farmingMode/:itemName", async (req, res) => {
    const { farmingMode, itemName } = req.params
    if (!farmingMode || !itemName || typeof farmingMode !== "string" || typeof itemName !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    await Item.findOne({ farmingMode, itemName }, (err: Error, doc: ItemInterface) => {
        if (err) throw err

        if (doc) {
            res.status(200).send(doc)
        } else {
            res.status(404).send(`Item "${itemName}" does not exist for Farming Mode "${farmingMode}".`)
        }
    }).clone()
})

// POST route to create a new result for an item. The bot at this point has already checked if the item exists before calling this.
app.post("/create-result/:userID/:itemName/:amount", async (req, res) => {
    const { userID, itemName, amount } = req.params
    if (!userID || !itemName || !amount || typeof userID !== "string" || typeof itemName !== "string" || typeof amount !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    // Create the new Result object.
    let date = new Date()
    const newResult = new Result({
        userID: userID,
        itemName: itemName,
        amount: amount,
        date: `${date.getUTCMonth() + 1}.${date.getUTCDate()}.${date.getUTCFullYear()}`,
    })

    // Save the new Result to the results collection.
    await newResult.save()

    // Now update the total amount for this item.
    await Item.updateOne({ itemName }, { $inc: { totalAmount: amount } }).exec()
    res.status(201).send("Successfully sent the result and updated the total amount.")
})

// GET route to fetch multiple results via user ID.
app.get("/get-result/:userID", async (req, res) => {
    const { userID } = req.params
    if (!userID || typeof userID !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    await Result.find({ userID }, (err: Error, docs: ResultInterface) => {
        if (err) throw err

        if (docs) {
            res.status(200).send(docs)
        } else {
            res.status(404).send(`No results have been posted yet for this user "${userID}".`)
        }
    }).clone()
})

// GET route to fetch multiple results via the item name.
app.get("/get-result/:itemName", async (req, res) => {
    const { itemName } = req.params
    if (!itemName || typeof itemName !== "string") {
        res.status(400).send("Improper values for parameters.")
        return
    }

    await Result.find({ itemName }, (err: Error, docs: ResultInterface) => {
        if (err) throw err

        if (docs) {
            res.status(200).send(docs)
        } else {
            res.status(404).send(`No results have been posted yet for this item "${itemName}".`)
        }
    }).clone()
})

////////////////////
// Start the Express server on the specified port.
app.listen(expressPort, () => {
    console.log(`Express server started on port ${expressPort}.`)
})
