const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper.js')
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')

describe('when there is initially some blogs saved', () => {
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
})

describe('adding a blog', () => {
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
})

describe('blog deletion', () => {
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
})

describe('blog updating', () => {
test('an existing blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
  
    const updatedBlog = {
      ...blogToUpdate,
      likes: blogToUpdate.likes + 1,
    }
  
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    const updatedBlogInDb = blogsAtEnd.find((b) => b.id === blogToUpdate.id)
    assert.deepStrictEqual(updatedBlogInDb, updatedBlog)
    assert.strictEqual(updatedBlogInDb.likes, blogToUpdate.likes + 1)
  })

test('updating a non-existent blog returns 404', async () => {
    const nonExistingId = await helper.nonExistingId()
    const updatedBlog = {
      title: 'Non-existent Blog',
      author: 'Non-existent Author',
      url: 'https://example.com/non-existent',
      likes: 0,
    }

    await api
      .put(`/api/blogs/${nonExistingId}`)
      .send(updatedBlog)
      .expect(404)
  })

test('updating a blog with an invalid id returns 400', async () => {
    const invalidId = '12345'
    const updatedBlog = {
      title: 'Invalid ID Blog',
      author: 'Invalid ID Author',
      url: 'https://example.com/invalid-id',
      likes: 0,
    }

    await api
      .put(`/api/blogs/${invalidId}`)
      .send(updatedBlog)
      .expect(400)
  })
})


  describe('when there is initially one user at db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
  
      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })
  
      await user.save()
    })
  
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
  
      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes(newUser.username))
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen',
      }
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes('expected `username` to be unique'))
  
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

  })

  describe('user creation validations', () => {
    beforeEach(async () => {
      await User.deleteMany({})
  
      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })
  
      await user.save()
    })
  
    test('creation fails if message if username is too short with proper statuscode and message', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'ro', // Too short username
        name: 'Short Username',
        password: 'validpassword',
      }
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
  
      assert(result.body.error.includes('is shorter than the minimum allowed length'))
  
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
  
    test('creation fails if password is too short with proper statuscode and message', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'validusername',
        name: 'Short Password',
        password: 'pw', // Too short password
      }
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
  
      assert(result.body.error.includes('password missing or too short'))
  
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
  })

after(async () => {
  await mongoose.connection.close()
})