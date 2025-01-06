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

  const mostLikes = (blogs) => {
    if (blogs.length === 0) return null
  
    const authorLikes = blogs.reduce((acc, blog) => {
      acc[blog.author] = (acc[blog.author] || 0) + blog.likes
      return acc;
    }, {})
  
    const maxAuthor = Object.keys(authorLikes).reduce((max, author) =>
      authorLikes[author] > authorLikes[max] ? author : max
    )
  
    return {
      author: maxAuthor,
      likes: authorLikes[maxAuthor]
    }
  }
  
  

  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
  }