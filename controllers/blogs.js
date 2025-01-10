const blogsRouter = require('express').Router()
const { default: mongoose } = require('mongoose')
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})
  
  blogsRouter.post('/', async (request, response) => {
      const body = request.body
      const user = await User.findById(body.userId)

      const blog = new Blog({
        title: body.title,
        url: body.url,
        likes: body.likes,
        user: user._id
      })

      const savedBlog = await blog.save()
      user.blogs = user.blogs.concat(savedBlog._id)
      await user.save()

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

blogsRouter.put('/:id', async (request, response) => {
  const { id } = request.params
  const body = request.body

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).json({ error: 'Invalid ID format' })
}
  const newBlog = await Blog.findByIdAndUpdate(
    id,
    body,
    { new: true }
  )

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, newBlog, { new: true, runValidators: true })
    
    if(!updatedBlog) {
      return response.status(404).end()
    }
    response.json(updatedBlog)
})

module.exports = blogsRouter