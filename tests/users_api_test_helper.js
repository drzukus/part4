const User = require("../models/user")

const initialUsers = [
    {
        username: "wubba",
        name: "lubba",
        password: "dub dub"
    },
    {
        username: "rikki",
        name: "tikki",
        password: "tavi"
    }
]

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports = {
    initialUsers, usersInDb
}