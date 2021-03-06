import { IQueueService, SasTokenService } from './sas-token-service'
import * as azurestorage from 'azure-storage'
import moment from 'moment'

const mockQService: IQueueService = {
  getUrl () { return 'url' },
  generateSharedAccessSignature (queueName: string, sharedAccessPolicy: azurestorage.common.SharedAccessPolicy) {
    return 'sas'
  }
}
let sut: SasTokenService

describe('sas token service', () => {
  beforeEach(() => {
    sut = new SasTokenService(mockQService)
  })
  test('should be defined', () => {
    expect(sut).toBeDefined()
  })
  test('should return url provided by queue service implementation', () => {
    const token = sut.generateSasToken('', moment())
    expect(token.url).toBe('url')
  })
  test('should return token provided by queue service implementation', () => {
    const token = sut.generateSasToken('', moment())
    expect(token.token).toBe('sas')
  })
  test('should throw an error when expiryDate is invalid', () => {
    const invalidMoment = moment('2019-13-41')
    try {
      sut.generateSasToken('', invalidMoment)
      fail('error should have been thrown due to invalid moment')
    } catch (error) {
      expect(error.message).toBe('Invalid expiryDate')
    }
  })
})
