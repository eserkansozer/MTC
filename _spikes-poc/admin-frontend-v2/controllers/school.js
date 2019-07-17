'use strict'
const controller = {}

/**
 * Display school landing page.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
controller.getSchoolLandingPage = async (req, res, next) => {
  res.locals.pageTitle = 'School Homepage'
  try {
    // Fetch set of flags to determine pin generation allowance on UI
    return res.render('school/school-home', {
      schoolName: 'Example School One'
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = controller
