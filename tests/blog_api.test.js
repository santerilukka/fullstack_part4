const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper.js')
const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})
  
    await Blog.insertMany(helper.initialBlogs)
  })

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are the right amount of blogs', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('returned blogs have id field instead of _id', async () => {
    const response = await api.get('/api/blogs')
  
    response.body.forEach((blog) => {
      assert.ok(blog.id)
      assert.strictEqual(blog._id, undefined)
    })
  })

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Async/Await Simplifies Making Async Calls',
      author: 'John Doe',
      url: 'https://example.com/async-await',
      likes: 10,
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
  
    const titles = blogsAtEnd.map((b) => b.title)
    assert.ok(titles.includes(newBlog.title))
  })

  test('if likes is not given, it defaults to 0', async () => {
    const newBlog = {
      title: 'Default likes test',
      author: 'Dave the Default liker',
      url: 'https://example.com/default-likes',
    }
  
    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const addedBlog = response.body;
    assert.strictEqual(addedBlog.likes, 0)
  
    const blogsAtEnd = await helper.blogsInDb()
    const savedBlog = blogsAtEnd.find((blog) => blog.id === addedBlog.id)
    assert.strictEqual(savedBlog.likes, 0)
  })
  

  test('blog without title is not added', async () => {
    const newBlog = {
      author: 'Missing Title',
      url: 'https://example.com/missing-title',
      likes: 5,
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400);
  
    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
  })
  
  test('blog without url is not added', async () => {
    const newBlog = {
      title: 'Missing URL',
      author: 'Miss Url',
      likes: 10,
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
  

test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
  
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
  
    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
  
    const titles = blogsAtEnd.map((b) => b.title)
    assert.ok(!titles.includes(blogToDelete.title))
  })

test('deleting a non-existent blog returns 404', async () => {
    const nonExistingId = await helper.nonExistingId()

    await api
      .delete(`/:${nonExistingId}`)
      .expect(404)
  })

test('deleting a blog with an invalid id returns 400', async () => {
    const invalidId = '12345'
    
    await api
      .delete(`/api/blogs/:${invalidId}`)
      .expect(400)
  })

after(async () => {
  await mongoose.connection.close()
})