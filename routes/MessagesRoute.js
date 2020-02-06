const express = require('express')
const router = express.Router()
const MessagesController = require('../controllers/MessagesController')
const passport = require('passport')
const multer = require('../libraries/multer')

router.get('/:id', [
  passport.authenticate('jwt', {session: false}),
  MessagesController.getByReceiver
])

router.get('/:sender/:receiver', [
  passport.authenticate('jwt', {session: false}),
  MessagesController.getBySenderAndReceiver
])

router.post('/', [
  passport.authenticate('jwt', {session: false}),
  MessagesController.store
])

router.post('/file', [
  passport.authenticate('jwt', {session: false}),
  multer.upload.single('message_file'),
  MessagesController.storeWithFile
])

module.exports = router