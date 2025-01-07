const blogsRouter = require('express').Router()
const { default: mongoose } = require('mongoose')
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})
  
  blogsRouter.post('/', async (request, response) => {
      const blog = new Blog(request.body)
      const savedBlog = await blog.save()
      response.status(201).json(savedBlog)
  })

blogsRouter.delete('/:id', async (request, response) => {
    const { id } = request.params
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400).json({ error: 'Invalid ID format' })
    }

    const result = await Blog.findByIdAndDelete(id)
    if (result) {
        return response.status(204).end()
    } else{
      response.status(404).end()
    }
})

module.exports = blogsRouter