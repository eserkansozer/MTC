const winston = require('winston')
const { TYPES } = require('tedious')
const moment = require('moment')
const R = require('ramda')
const sqlService = require('../../admin/services/data-access/sql.service')
const sqlPoolService = require('../../admin/services/data-access/sql.pool.service')
const pinGenerationService = require('../../admin/services/pin-generation.service')
const schoolDataService = require('../../admin/services/data-access/school.data.service')
const pupilDataService = require('../../admin/services/data-access/pupil.data.service')
const checkStartService = require('../../admin/services/check-start.service')

async function main () {
  try {
    const chunkSize = process.env.SQL_POOL_MAX_COUNT || 10
    const numPupils = parseInt(process.argv[2])
    if (!numPupils) {
      throw new Error('Pupil length argument is not supplied or is not a valid number')
    }

    let schools, numSchools, pupilsPerSchool, pupilsRemainder, params

    schools = await sqlService.query(`SELECT * FROM ${sqlService.adminSchema}.[school]`)
    numSchools = schools.length

    // When generating less pupils than the total number of schools, slice
    // the schools array to the number of pupils and set 1 pupil per school
    pupilsPerSchool = Math.floor(numPupils / numSchools)
    if (pupilsPerSchool < 1) {
      pupilsPerSchool = 1
      schools = schools.slice(0, numPupils)
      numSchools = schools.length
      pupilsRemainder = 0
    } else {
      pupilsRemainder = numPupils - (pupilsPerSchool * numSchools)
    }

    winston.info(`Generating ${numPupils} pupils across ${numSchools} schools`)
    winston.info(`SQL Pool / Chunk size: ${chunkSize}`)

    for (let chunkIndex = 0; chunkIndex <= numSchools; chunkIndex += chunkSize) {
      let schoolsChunk = schools.slice(chunkIndex, chunkIndex + chunkSize)
      await Promise.all(schoolsChunk.map(async (school, i) => {
        let totalPupils = pupilsPerSchool
        let schoolIndex = chunkIndex + i
        if (schoolIndex < pupilsRemainder) {
          totalPupils += 1
        }
        // maybe use sqlService.generateParams
        params = [
          {
            name: 'schoolId',
            value: school.id,
            type: TYPES.Int
          },
          {
            name: 'dateOfBirth',
            value: randomDob(),
            type: TYPES.DateTimeOffset
          }
        ]
        const sql = `
      BEGIN
        DECLARE @cnt INT = 1;
        DECLARE @baseUpn INT = 80120000 + @schoolId
        WHILE @cnt <= ${totalPupils}
        BEGIN
          BEGIN TRY
            INSERT ${sqlService.adminSchema}.[pupil] (school_id, foreName, lastName, gender, dateOfBirth, upn) 
            VALUES (@schoolId, CAST(@cnt AS NVARCHAR), 'Pupil', 'M', @dateOfBirth, CAST(@baseUpn AS NVARCHAR) + CAST(@cnt AS NVARCHAR) + '1A')
          END TRY
          BEGIN CATCH
          END CATCH
          SET @cnt = @cnt + 1;
        END;
      END`
        await sqlService.query(sql, params)
        if (!school.pin) {
          let update = pinGenerationService.generateSchoolPassword(school)
          await schoolDataService.sqlUpdate(R.assoc('id', school.id, update))
        }
        const pupils = await pupilDataService.sqlFindPupilsByDfeNumber(school.dfeNumber)
        const pupilsList = pupils.map(p => p.id)
        await checkStartService.prepareCheck(pupilsList, school.dfeNumber, school.id)
      }))
    }

    winston.info('DONE')
    sqlPoolService.drain()
  } catch (error) {
    console.log('error')
    winston.info(error)
    process.exitCode = 1
    sqlPoolService.drain()
  }
}

function randomDob () {
  const rnd = Math.floor(Math.random() * (365 * 2) + 1)
  const dob = moment().utc().subtract(9, 'years').subtract(rnd, 'days')
  dob.hours(0).minute(0).second(0)
  return dob.toDate()
}

main()
