const mongoose = require("mongoose")
const supertest = require("supertest")
const helper = require("./api_test_helper")
const app = require("../app")
const api = supertest(app)
const Blog = require("../models/blog")

beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.initialBlogs
        .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})

describe("initial blogs", () => {
    test('blogs are returned as json', async () => {
        await api
          .get('/api/blogs')
          .expect(200)
          .expect('Content-Type', /application\/json/)
    }, 100000)
    
    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
      
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })
})

describe("viewing a specific blog", () => {
    test("id exists", async () => {
        const res = await api.get("/api/blogs")
        expect(res.body[0]._id).toBeDefined()
    })
})

describe("adding a new blog", () => {
    test("a valid blog can be added", async () => {
        const newBlog = {
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12,
        }
    
        await api
            .post("/api/blogs")
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    
        const titles = blogsAtEnd.map(b => b.title)
        expect(titles).toContain("Canonical string reduction")
    })
    
    test("missing likes", async () => {
        const newBlog = {
            title: "wubba",
            author: "lubba",
            url: "dub"
        }
    
        await api
            .post("/api/blogs")
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    
        const blogsAtEnd = await helper.blogsInDb()
        const addedBlog = await blogsAtEnd.find(blog => blog.title === "wubba")
        expect(addedBlog.likes).toBe(0)
    })
    
    test("missing title", async () => {
        const newBlog = {
            author: "wubba",
            url: "dubba",
            likes: 12
        }
    
        await api
            .post("/api/blogs")
            .send(newBlog)
            .expect(400)
    })
})

describe("deleting a blog", () => {
    test("blog can be deleted with status 204", async () => {
        const blogs = await helper.blogsInDb()

        await api
            .delete(`/api/blogs/${blogs[0]._id}`)
            .expect(204)
        
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
    })
})

describe("updating a blog", () => {
    test("update info of a blog", async () => {
        const blogs = await helper.blogsInDb()
        const blogToUpdate = blogs[0]

        const updatedBlog = {...blogToUpdate, likes: 667}

        await api
            .put(`/api/blogs/${blogToUpdate._id}`)
            .send(updatedBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd[0].likes).toBe(667)
    }, 10000)
})

afterAll(async () => {
    await mongoose.connection.close()
})