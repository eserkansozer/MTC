'use strict'
/* global describe, it, expect spyOn fail */

const resultDataService = require('../../../services/data-access/result.data.service')
const resultService = require('../../../services/result.service')

describe('result.service', () => {
  describe('getPupilsWithResults', () => {
    it('calls sqlFindResultsBySchool when school id and check window id are provided', async () => {
      spyOn(resultDataService, 'sqlFindResultsBySchool')
      const checkWindowId = 1
      const schoolId = 2
      try {
        await resultService.getPupilsWithResults(schoolId, checkWindowId)
      } catch (error) {
        fail()
      }
      expect(resultDataService.sqlFindResultsBySchool).toHaveBeenCalled()
    })
    it('throws an error if check window id is not provided', async () => {
      spyOn(resultDataService, 'sqlFindResultsBySchool')
      const checkWindowId = undefined
      const schoolId = 2
      try {
        await resultService.getPupilsWithResults(schoolId, checkWindowId)
        fail()
      } catch (error) {
        expect(error.message).toBe('check window id not found')
      }
      expect(resultDataService.sqlFindResultsBySchool).not.toHaveBeenCalled()
    })
    it('throws an error if school id is not provided', async () => {
      spyOn(resultDataService, 'sqlFindResultsBySchool')
      const checkWindowId = 1
      const schoolId = undefined
      try {
        await resultService.getPupilsWithResults(schoolId, checkWindowId)
        fail()
      } catch (error) {
        expect(error.message).toBe('school id not found')
      }
      expect(resultDataService.sqlFindResultsBySchool).not.toHaveBeenCalled()
    })
  })
  describe('getSchoolScore', () => {
    it('calls sqlFindSchoolScoreBySchoolIdAndCheckWindowId when school id and check window id are provided and returns a valid score number', async () => {
      spyOn(resultDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId').and.returnValue({ id: 1, score: 6 })
      const checkWindowId = 1
      const schoolId = 2
      let scoreRecord
      try {
        scoreRecord = await resultService.getSchoolScore(schoolId, checkWindowId)
      } catch (error) {
        fail()
      }
      expect(resultDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).toHaveBeenCalled()
      expect(scoreRecord).toEqual({ id: 1, score: 6 })
    })
    it('returns 0 as school score', async () => {
      spyOn(resultDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId').and.returnValue({ id: 1, score: 0 })
      const checkWindowId = 1
      const schoolId = 2
      let scoreRecord
      try {
        scoreRecord = await resultService.getSchoolScore(schoolId, checkWindowId)
      } catch (error) {
        fail()
      }
      expect(resultDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).toHaveBeenCalled()
      expect(scoreRecord).toEqual({ id: 1, score: 0 })
    })
    it('throws an error if check window id is not provided', async () => {
      spyOn(resultDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId')
      const checkWindowId = undefined
      const schoolId = 2
      try {
        await resultService.getSchoolScore(schoolId, checkWindowId)
        fail()
      } catch (error) {
        expect(error.message).toBe('check window id not found')
      }
      expect(resultDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).not.toHaveBeenCalled()
    })
    it('throws an error if school id is not provided', async () => {
      spyOn(resultDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId')
      const checkWindowId = 1
      const schoolId = undefined
      try {
        await resultService.getSchoolScore(schoolId, checkWindowId)
        fail()
      } catch (error) {
        expect(error.message).toBe('school id not found')
      }
      expect(resultDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).not.toHaveBeenCalled()
    })
    it('throws an error if sqlFindSchoolScoreBySchoolIdAndCheckWindowId returns an error', async () => {
      spyOn(resultDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId').and.returnValue(Promise.reject(new Error('error')))
      const checkWindowId = 1
      const schoolId = 2
      try {
        await resultService.getSchoolScore(schoolId, checkWindowId)
        fail()
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(resultDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).toHaveBeenCalled()
    })
    it('returns if sqlFindSchoolScoreBySchoolIdAndCheckWindowId returns undefined or empty object', async () => {
      spyOn(resultDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId')
      const checkWindowId = 1
      const schoolId = 2
      let scoreRecord
      try {
        scoreRecord = await resultService.getSchoolScore(schoolId, checkWindowId)
      } catch (error) {
        fail()
      }
      expect(resultDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).toHaveBeenCalled()
      expect(scoreRecord).toBeUndefined()
    })
    it('does not return if sqlFindResultsBySchool returns no score property', async () => {
      spyOn(resultDataService, 'sqlFindSchoolScoreBySchoolIdAndCheckWindowId').and.returnValue({ id: 1 })
      const checkWindowId = 1
      const schoolId = 2
      let scoreRecord
      try {
        scoreRecord = await resultService.getSchoolScore(schoolId, checkWindowId)
      } catch (error) {
        fail()
      }
      expect(resultDataService.sqlFindSchoolScoreBySchoolIdAndCheckWindowId).toHaveBeenCalled()
      expect(scoreRecord).toEqual({ id: 1 })
    })
  })
})
