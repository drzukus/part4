const mongoose = require("mongoose")
const supertest = require("supertest")
const helper = require("./users_api_test_helper")
const app = require("../app")
const api = supertest(app)
const User = require("../models/user")

beforeEach(async () => {
    await User.deleteMany({})

    const userObjects = helper.initialUsers
        .map(user => new User(user))
    const promiseArray = userObjects.map(user => user.save())
    await Promise.all(promiseArray)
})

describe("adding users", () => {
    test("valid users added with status 201", async () => {
        const newUser = {
            username: "lmaolmao",
            name: "lololol",
            password: "lmfao"
        }

        await api
            .post("/api/users")
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(helper.initialUsers.length + 1)

        const usernames = usersAtEnd.map(user => user.username)
        expect(usernames).toContain("lmaolmao")
    }, 10000)

    test("missing username", async () => {
        const newUser = {
            name: "lololol",
            password: "lmfao"
        }

        await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
        
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(helper.initialUsers.length)
    })

    test("missing password", async () => {
        const newUser = {
            username: "lmaolmao",
            name: "lololol",
        }

        await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
    })

    test("non-unique username", async () => {
        const newUser = {
            username: "wubba",
            name: "sdlkfjsdkf",
            password: "sldkfj"
        }

        await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})