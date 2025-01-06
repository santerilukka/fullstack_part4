const _ = require('lodash')

const dummy = (blogs) => {
    return 1
  }
  
const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
  }

const favoriteBlog = (blogs) => {
if (blogs.length === 0) return null

const favorite = blogs.reduce((prev, current) => 
    current.likes > prev.likes ? current : prev
)

return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
}}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) return null
  
    const authorCounts = _.countBy(blogs, 'author')
    const maxAuthor = _.maxBy(Object.keys(authorCounts), (author) => authorCounts[author])
  
    return {
      author: maxAuthor,
      blogs: authorCounts[maxAuthor]
    }
  }
  

  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs
  }