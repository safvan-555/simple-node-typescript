const express = require('express')
const app = express.Router()
const Users = require('../controllers/users')
app.post('/create', Users.Create);
app.post('/lists', Users.Lists);
module.exports = app