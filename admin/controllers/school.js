'use strict'
const moment = require('moment')
const csv = require('fast-csv')
const mongoose = require('mongoose')

const Pupil = require('../models/pupil')
const School = require('../models/school')
const AttendanceCode = require('../models/attendance-code')
const randomGenerator = require('../lib/random-generator')
const ValidationError = require('../lib/validation-error')
const errorConverter = require('../lib/error-converter')
const hdfErrorMessages = require('../lib/errors/hdf')
const hdfValidator = require('../lib/validator/hdf-validator')
const {
  fetchPupilsData,
  fetchPupilAnswers,
  fetchScoreDetails,
  fetchSortedPupilsData,
  fetchMultiplePupils,
  fetchPupilsWithReasons } = require('../services/pupil.service')
const { sortRecords } = require('../utils')

const getHome = async (req, res, next) => {
  res.locals.pageTitle = 'School Homepage'
  let schoolName = ''

  try {
    const school = await School.findOne({ '_id': req.user.School }).exec()
    if (!school) {
      return next(new Error(`School not found: ${req.user.School}`))
    }
    schoolName = school.name
  } catch (error) {
    return next(error)
  }
  return res.render('school/school-home', {
    schoolName,
    breadcrumbs: [ { 'name': 'School Home' } ]
  })
}

const getPupils = async (req, res, next) => {
  res.locals.pageTitle = 'Pupil register'
  const { sortColumn, sortOrder } = req.params
  res.locals.sortColumn = sortColumn || 'lastName'
  const order = JSON.parse(sortOrder)
  res.locals.sortOrder = typeof order === 'boolean' ? !order : true
  res.locals.sortClass = order === false ? 'sort up' : 'sort'
  const { pupils } = await fetchPupilsData(req.user.School)
  let pupilsFormatted = await Promise.all(pupils.map(async (p) => {
    const { foreName, lastName, _id } = p
    const dob = moment(p.dob).format('DD/MM/YYYY')
    const answers = await fetchPupilAnswers(p._id)
    const { score } = fetchScoreDetails(answers)
    // TODO: Fetch pupil's group when it's implemented
    const group = 'N/A'
    return {
      _id,
      foreName,
      lastName,
      dob,
      group,
      score
    }
  })).catch((error) => next(error))
  pupilsFormatted = sortRecords(pupilsFormatted, res.locals.sortColumn, order)
  pupilsFormatted.map((p, i) => {
    if (pupilsFormatted[ i + 1 ] === undefined) return
    if (pupilsFormatted[ i ].foreName === pupilsFormatted[ i + 1 ].foreName &&
      pupilsFormatted[ i ].lastName === pupilsFormatted[ i + 1 ].lastName) {
      pupilsFormatted[ i ].showDoB = true
      pupilsFormatted[ i + 1 ].showDoB = true
    }
  })
  try {
    req.breadcrumbs(res.locals.pageTitle)
    res.render('school/pupil-register', {
      highlight: new Set(Array.isArray(req.query.hl) ? req.query.hl : [ req.query.hl ]),
      pupils: pupilsFormatted,
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    next(error)
  }
}

const getResults = async (req, res, next) => {
  res.locals.pageTitle = 'Results'
  const { pupils, schoolData } = await fetchPupilsData(req.user.School)
  let pupilsFormatted = await Promise.all(pupils.map(async (p) => {
    const fullName = `${p.foreName} ${p.lastName}`
    const answers = await fetchPupilAnswers(p._id)
    const { hasScore, score, percentage } = fetchScoreDetails(answers)
    return {
      fullName,
      hasScore,
      score,
      percentage
    }
  })).catch((error) => next(error))
  req.breadcrumbs(res.locals.pageTitle)
  pupilsFormatted = pupilsFormatted.filter((p) => p.hasScore)
  if ((schoolData.hdf && schoolData.hdf.signedDate) &&
    (typeof pupilsFormatted === 'object' && Object.keys(pupilsFormatted).length > 0)) {
    return res.render('school/results', {
      breadcrumbs: req.breadcrumbs(),
      pupils: pupilsFormatted,
      schoolData
    })
  } else {
    return res.render('school/no-results', {
      breadcrumbs: req.breadcrumbs()
    })
  }
}

const downloadResults = async (req, res, next) => {
  // TODO: refactor to make it smaller
  const csvStream = csv.createWriteStream()
  const { schoolData, pupils } = await fetchPupilsData(req.user.School)
  // Format the pupils
  let pupilsFormatted = await Promise.all(pupils.map(async (p) => {
    const fullName = `${p.foreName} ${p.lastName}`
    const dob = moment(p.dob).format('DD/MM/YYYY')
    const answersSet = await fetchPupilAnswers(p._id)
    if (!answersSet) return
    let answers = answersSet.answers && answersSet.answers.sort((a1, a2) => {
      const f1 = a1.factor1 - a2.factor1
      if (f1 !== 0) return f1
      return a1.factor2 - a2.factor2
    })
    answers = answers.map(a => {
      const question = `${a.factor1}x${a.factor2}`
      const pupilAnswer = a.input
      const answerMark = a.isCorrect ? 1 : 0
      return {
        question,
        pupilAnswer,
        answerMark
      }
    })
    const pupilScore = answersSet && answersSet.result
    if (!pupilScore || typeof pupilScore.correct !== 'number') return
    const totalMark = pupilScore && pupilScore.correct.toString()
    return {
      fullName,
      dob,
      answers,
      totalMark
    }
  })).catch((error) => next(error))
  pupilsFormatted = pupilsFormatted.filter((p) => p)
  const pupilStructure = pupilsFormatted[ 0 ]
  const csvContent = []
  const csvHeaders = [ 'Full Name', 'Date of Birth' ]
  // Generate the row headers
  pupilStructure.answers.forEach((answer, i) => {
    const question = `Question ${i + 1}`
    const input = `Answer ${i + 1}`
    const mark = `Mark ${i + 1}`
    csvHeaders.push(question, input, mark)
  })
  csvHeaders.push('Score')
  // Generate the pupils
  const csvPupils = []
  pupilsFormatted.forEach((p, i) => {
    csvPupils[ i ] = []
    Object.keys(p).forEach((k) => {
      if (k === 'answers') {
        p[ k ].forEach((a) => {
          Object.keys(a).forEach((ak) => csvPupils[ i ].push(a[ ak ].toString()))
        })
      } else {
        csvPupils[ i ].push(p[ k ])
      }
    })
  })
  csvContent.push(csvHeaders)
  csvPupils.forEach((p) => csvContent.push(p))
  const checkDate = moment(moment.now()).format('DD MMM YYYY')
  res.setHeader('Content-disposition', `attachment filename=Results ${schoolData.leaCode}${schoolData.estabCode} ${checkDate}.csv`)
  res.setHeader('content-type', 'text/csv')
  csvContent.forEach((row) => csvStream.write(row))
  csvStream.pipe(res)
  csvStream.end()
}

const generatePins = async (req, res, next) => {
  if (!req.body[ 'pupil' ]) {
    // TODO: inform the user via flash message?
    return res.redirect('/school/manage-pupils')
  }
  const data = Object.values(req.body[ 'pupil' ] || null)
  const chars = '23456789bcdfghjkmnpqrstvwxyz'
  const length = 5
  const pupils = []

  // fetch pupils
  try {
    let ids = data.map(id => mongoose.Types.ObjectId(id))
    pupils = await Pupil.find({ _id: { $in: ids } }).exec()
  } catch (error) {
    console.error('Failed to find pupils: ' + error.message)
    return next(error)
  }

  // Apply the updates to the pupil object(s)
  pupils.forEach(pupil => {
    if (!pupil.pin) {
      pupil.pin = randomGenerator.getRandom(length, chars)
      pupil.expired = false
    }
  })

  // Save our pupils, in parallel
  const promises = pupils.map(p => p.save()) // returns Promise

  Promise.all(promises).then(results => {
    // all pupils saved ok
    return res.redirect('/school/manage-pupils')
  },
  error => {
    // one or more promises were rejected
    // TODO: add a flash message informing the user
    console.error(error)
    return res.redirect('/school/manage-pupils')
  })
  .catch(error => {
    console.error(error)
    // TODO: add a flash message informing the user
    return res.redirect('/school/manage-pupils')
  })
}

const getSubmitAttendance = async (req, res, next) => {
  res.locals.pageTitle = 'Attendance register'
  req.breadcrumbs(res.locals.pageTitle)
  const { pupils, schoolData } = await fetchPupilsData(req.user.School)
  // Redirect to confirmation of submission if hdf has been signed
  if (schoolData.hdf && schoolData.hdf.signedDate) {
    return res.redirect('/school/declaration-form-submitted')
  }
  let pupilsFormatted = await Promise.all(pupils.map(async (p) => {
    const fullName = `${p.foreName} ${p.lastName}`
    const { _id: id, hasAttended } = p
    const answers = await fetchPupilAnswers(p._id)
    const { hasScore, percentage } = fetchScoreDetails(answers)
    return {
      id,
      fullName,
      hasAttended,
      hasScore,
      percentage
    }
  })).catch((error) => next(error))
  pupilsFormatted = pupilsFormatted.filter((p) => p.percentage !== 'n/a')
  // Redirect to declaration form if at least one has been submitted for attendance
  if (pupilsFormatted.length > 0 && pupilsFormatted.some((p) => p.hasAttended)) {
    return res.redirect('/school/declaration-form')
  }
  return res.render('school/submit-attendance-register', {
    breadcrumbs: req.breadcrumbs(),
    pupils: pupilsFormatted
  })
}

const postSubmitAttendance = async (req, res, next) => {
  const attendees = req.body[ 'attendee' ]
  if (!attendees) {
    return res.redirect('/school/submit-attendance')
  }
  const data = Object.values(req.body[ 'attendee' ] || null)
  let selected
  const { pupils } = await fetchPupilsData(req.user.School)
  try {
    let ids = data.map(id => mongoose.Types.ObjectId(id))
    selected = await Pupil.find({ _id: { $in: ids } }).exec()
  } catch (error) {
    return next(error)
  }
  // Update attendance for selected pupils
  selected.forEach((p) => (p.hasAttended = true))
  const selectedPromises = selected.map(s => s.save())
  // Expire all pins for school pupils
  pupils.forEach(p => (p.pinExpired = true))
  const pupilsPromises = pupils.map(p => p.save())
  Promise.all(selectedPromises.concat(pupilsPromises)).then(() => {
    return res.redirect('/school/declaration-form')
  },
  error => next(error))
  .catch(error => next(error)
  )
}

const getDeclarationForm = async (req, res, next) => {
  const { schoolData } = await fetchPupilsData(req.user.School)
  if (schoolData.hdf && schoolData.hdf.signedDate) {
    return res.redirect('/school/declaration-form-submitted')
  }
  req.body[ 'fullName' ] = req.user && req.user[ 'UserName' ]
  res.locals.pageTitle = 'Headteacher\'s declaration form'
  req.breadcrumbs('Attendance register')
  req.breadcrumbs(res.locals.pageTitle)
  return res.render('school/declaration-form', {
    formData: req.body,
    error: new ValidationError(),
    breadcrumbs: req.breadcrumbs()
  })
}

const postDeclarationForm = async (req, res, next) => {
  const { jobTitle, fullName, declaration } = req.body
  const school = await School.findOne({ '_id': req.user.School }).exec()
  school.hdf = {
    signedDate: Date.now(),
    declaration,
    jobTitle,
    fullName
  }
  let validationError = await hdfValidator.validate(req)
  try {
    await school.validate()
    if (validationError.hasError()) {
      throw new Error('school validation error')
    }
  } catch (error) {
    res.locals.pageTitle = 'Headteacher\'s declaration form'
    req.breadcrumbs(res.locals.pageTitle)
    if (error.message !== 'school validation error') {
      const combinedValidationError = errorConverter.fromMongoose(error, hdfErrorMessages, validationError)
      return res.render('school/declaration-form', {
        formData: req.body,
        error: combinedValidationError,
        breadcrumbs: req.breadcrumbs()
      })
    }
    return res.render('school/declaration-form', {
      formData: req.body,
      error: validationError,
      breadcrumbs: req.breadcrumbs()
    })
  }
  try {
    await school.save()
  } catch (error) {
    return next(error)
  }
  return res.redirect('/school/declaration-form-submitted')
}

const getHDFSubmitted = async (req, res, next) => {
  res.locals.pageTitle = 'Headteacher\'s declaration form submitted'
  req.breadcrumbs(res.locals.pageTitle)
  let school
  try {
    school = await School.findOne({ '_id': req.user.School }).exec()
  } catch (error) {
    return next(error)
  }
  const { hdf: { signedDate } } = school
  return res.render('school/declaration-form-submitted', {
    breadcrumbs: req.breadcrumbs(),
    signedDate: signedDate && moment(signedDate).format('Do MMMM YYYY')
  })
}

/**
 * Pupils not taking the check: initial page.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getPupilNotTakingCheck = async (req, res, next) => {
  res.locals.pageTitle = 'Pupils not taking the check'
  req.breadcrumbs(res.locals.pageTitle)
  return res.render('school/pupils-not-taking-check', {
    breadcrumbs: req.breadcrumbs()
  })
}

/**
 * Pupils not taking the check: render and sorting.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const getSelectPupilNotTakingCheck = async (req, res, next) => {
  res.locals.pageTitle = 'Select pupils not taking the check'
  req.breadcrumbs(res.locals.pageTitle)

  let attendanceCodes
  let pupilsList
  let htmlSortDirection = []
  let arrowSortDirection = []

  // Sorting
  const sortField = req.params.sortField === undefined ? 'name' : req.params.sortField
  const sortDirection = req.params.sortDirection === undefined ? 'asc' : req.params.sortDirection

  let sortingDirection = [
    {
      'key': 'name',
      'value': 'asc'
    },
    {
      'key': 'reason',
      'value': 'asc'
    }
  ]

  // Markup links and arrows
  sortingDirection.map((sd, index) => {
    if (sd.key === sortField) {
      htmlSortDirection[sd.key] = (sortDirection === 'asc' ? 'desc' : 'asc')
      arrowSortDirection[sd.key] = (htmlSortDirection[sd.key] === 'asc' ? 'sort up' : 'sort')
    } else {
      htmlSortDirection[sd.key] = 'asc'
      arrowSortDirection[sd.key] = 'sort'
    }
  })

  // Get attendance code index
  try {
    attendanceCodes = await AttendanceCode.getAttendanceCodes().exec()
  } catch (error) {
    console.log('ERROR getting attendance codes', error)
    return next(error)
  }

  // Get pupils for user' school
  const pupils = await fetchSortedPupilsData(req.user.School, 'lastName', sortDirection)
  pupilsList = await Promise.all(pupils.map(async (p) => {
    p.id = null
    p.reason = 'N/A'

    if (p.attendanceCode !== undefined && p.attendanceCode._id !== undefined) {
      let accCode = attendanceCodes.filter(ac => ac._id == p.attendanceCode._id)
      p.reason = accCode[0].reason
    }
    return p
  })).catch((error) => next(error))

  // Sorting by 'reason' needs to be done using .sort
  if (sortField === 'reason') {
    pupilsList = await pupilsList.sort((a, b) => {
      if (a.reason === 'N/A') {
        return 1
      } else if (b.reason === 'N/A') {
        return -1
      } else if (a.reason === b.reason) {
        return 0
      } else if (sortDirection === 'asc') {
        return a.reason < b.reason ? -1 : 1
      } else {
        return a.reason < b.reason ? 1 : -1
      }
    })
  }

  return res.render('school/select-pupils-not-taking-check', {
    breadcrumbs: req.breadcrumbs(),
    sortField,
    sortDirection,
    attendanceCodes,
    pupilsList,
    htmlSortDirection,
    arrowSortDirection
  })
}

/**
 * Pupils not taking the check: save reason.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const savePupilNotTakingCheck = async (req, res, next) => {
  res.locals.pageTitle = 'Save pupils not taking the check'
  req.breadcrumbs(res.locals.pageTitle)

  if (req.body.attendanceCode === undefined || req.body.pupil === undefined) {
    return res.redirect('/school/pupils-not-taking-check/select-pupils')
  }

  const todayDate = moment(moment.now()).format()
  const postedPupils = req.body.pupil
  const pupilsData = await fetchMultiplePupils(Object.values(postedPupils))

  let pupilsToSave = []
  let pupilsList
  let attendanceCodes
  let flashMessage = 'Reasons updated'

  pupilsData.map(async (pupil) => {
    pupil.attendanceCode = {
      _id: req.body.attendanceCode,
      dateRecorded: new Date(todayDate),
      byUserName: req.user.UserName,
      byUserEmail: req.user.EmailAddress
    }
    pupilsToSave.push(pupil)
  })

  // @TODO: Auditing (to be discussed)
  try {
    const savedPupils = await Pupil.create(pupilsToSave)
    if (!savedPupils) {
      return next(new Error('Cannot save pupils'))
    }
    flashMessage = `${savedPupils.length} pupil reasons updated`
    req.flash('info', flashMessage)
  } catch (error) {
    return next(error)
  }

  // Get attendance code index
  try {
    attendanceCodes = await AttendanceCode.getAttendanceCodes().exec()
  } catch (error) {
    console.log('ERROR getting attendance codes', error)
    return next(error)
  }

  let pupils = await fetchPupilsWithReasons(req.user.School)
  pupilsList = await Promise.all(pupils.map(async (p) => {
    if (p.attendanceCode !== undefined && p.attendanceCode._id !== undefined) {
      let accCode = attendanceCodes.filter(ac => JSON.stringify(ac._id) === JSON.stringify(p.attendanceCode._id))
      p.reason = accCode[0].reason
      p.highlight = (postedPupils.filter(pp => JSON.stringify(pp) === JSON.stringify(p._id))).length > 0
    }
    return p
  }))

  return res.render('school/save-pupils-not-taking-check', {
    breadcrumbs: req.breadcrumbs(),
    pupilsList,
    messages: req.flash('info')
  })
}

const removePupilNotTakingCheck = async (req, res, next) => {
  if (req.params.pupilId === undefined) {
    return res.redirect('/pupils-not-taking-check/select-pupils')
  }

  const pupilId = req.params.pupilId
  try {
    await Pupil.remove({ '_id': pupilId }).exec()
  } catch (error) {
    next(error)
  }

  return res.redirect('/pupils-not-taking-check/select-pupils/select-pupils')
}

module.exports = {
  getHome,
  getPupils,
  getResults,
  downloadResults,
  generatePins,
  getSubmitAttendance,
  postSubmitAttendance,
  getDeclarationForm,
  postDeclarationForm,
  getHDFSubmitted,
  getPupilNotTakingCheck,
  getSelectPupilNotTakingCheck,
  savePupilNotTakingCheck,
  removePupilNotTakingCheck
}
