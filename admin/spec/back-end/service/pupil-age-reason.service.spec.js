/* global describe it expect spyOn */

const pupilAgeReasonService = require('../../../services/pupil-age-reason.service')
const pupilAgeReasonDataService = require('../../../services/data-access/pupil-age-reason.data.service')

describe('pupilAgeReasonService', () => {
  describe('refreshPupilAgeReason', () => {
    it('calls sqlInsertPupilAgeReason if new age reason is supplied and previous does not exist', async () => {
      spyOn(pupilAgeReasonDataService, 'sqlInsertPupilAgeReason')
      spyOn(pupilAgeReasonDataService, 'sqlUpdatePupilAgeReason')
      spyOn(pupilAgeReasonDataService, 'sqlRemovePupilAgeReason')
      await pupilAgeReasonService.refreshPupilAgeReason(1, 'new reason', null)
      expect(pupilAgeReasonDataService.sqlInsertPupilAgeReason).toHaveBeenCalled()
      expect(pupilAgeReasonDataService.sqlUpdatePupilAgeReason).not.toHaveBeenCalled()
      expect(pupilAgeReasonDataService.sqlRemovePupilAgeReason).not.toHaveBeenCalled()
    })
    it('calls sqlUpdatePupilAgeReason if new age reason is supplied and previous does exist', async () => {
      spyOn(pupilAgeReasonDataService, 'sqlInsertPupilAgeReason')
      spyOn(pupilAgeReasonDataService, 'sqlUpdatePupilAgeReason')
      spyOn(pupilAgeReasonDataService, 'sqlRemovePupilAgeReason')
      await pupilAgeReasonService.refreshPupilAgeReason(1, 'new reason', 'old reason')
      expect(pupilAgeReasonDataService.sqlInsertPupilAgeReason).not.toHaveBeenCalled()
      expect(pupilAgeReasonDataService.sqlUpdatePupilAgeReason).toHaveBeenCalled()
      expect(pupilAgeReasonDataService.sqlRemovePupilAgeReason).not.toHaveBeenCalled()
    })
    it('calls sqlUpdatePupilAgeReason if new age reason is not supplied and previous reason exist', async () => {
      spyOn(pupilAgeReasonDataService, 'sqlInsertPupilAgeReason')
      spyOn(pupilAgeReasonDataService, 'sqlUpdatePupilAgeReason')
      spyOn(pupilAgeReasonDataService, 'sqlRemovePupilAgeReason')
      await pupilAgeReasonService.refreshPupilAgeReason(1, '', 'old reason')
      expect(pupilAgeReasonDataService.sqlInsertPupilAgeReason).not.toHaveBeenCalled()
      expect(pupilAgeReasonDataService.sqlUpdatePupilAgeReason).not.toHaveBeenCalled()
      expect(pupilAgeReasonDataService.sqlRemovePupilAgeReason).toHaveBeenCalled()
    })
  })
})
