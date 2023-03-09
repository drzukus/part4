const _ = require("lodash")

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}
  
const favoriteBlog = (blogs) => {
    const topBlog = blogs.reduce((max, blog) => max.likes > blog.likes ? max : blog)

    const { _id, url,  __v, ...favorite} = topBlog

    return favorite
}

const mostBlogs = (blogs) => {
    const authorsCount = _.countBy(blogs, "author")

    const most = Object.entries(authorsCount).reduce((max, cur) => max[1] > cur[1] ? max : cur);

    return { author: most[0], blogs: most[1] }
}

const mostLikes = (blogs) => {
    const result = 
        _(blogs)
            .groupBy("author")
            .map((objs, key) => ({
                "author": key,
                "likes": _.sumBy(objs, "likes")}))
            .value()
    return result.reduce((top, cur) => top.likes > cur.likes ? top : cur)
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }