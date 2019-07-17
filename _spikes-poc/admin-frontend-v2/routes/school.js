'use strict'

const express = require('express')
const router = express.Router()

const schoolController = require('../controllers/school')

router.get(
  ['/', '/school-home'],
  (req, res, next) => schoolController.getSchoolLandingPage(req, res, next)
)

module.exports = router
