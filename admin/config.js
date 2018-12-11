'use strict'
require('dotenv').config()
const os = require('os')
const toBool = require('to-bool')

const twoMinutesInMilliseconds = 120000
const oneMinuteInMilliseconds = 60000

const getEnvironment = () => {
  return process.env.ENVIRONMENT_NAME || 'Local-Dev'
}

module.exports = {
  AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING,
  GOOGLE_TRACKING_ID: process.env.GOOGLE_TRACKING_ID,
  MONGO_CONNECTION_STRING: process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost/mtc',
  NCA_TOOLS_AUTH_URL: process.env.NCA_TOOLS_AUTH_URL,
  PORT: process.env.PORT || '3001',
  PUPIL_APP_URL: process.env.PUPIL_APP_URL,
  ADMIN_SESSION_EXPIRATION_TIME_IN_SECONDS: (process.env.ADMIN_SESSION_EXPIRATION_TIME_IN_SECONDS || 10) * 60, // Expire after 10 minutes inactivity by default
  ADMIN_SESSION_DISPLAY_NOTICE_AFTER: (process.env.ADMIN_SESSION_DISPLAY_NOTICE_AFTER || 5) * 60, // Display notice after 5 minutes by default
  QUESTION_TIME_LIMIT: 6,
  RESTART_MAX_ATTEMPTS: 2,
  SESSION_SECRET: process.env.NODE_ENV === 'production' ? process.env.SESSION_SECRET : 'anti tamper for dev',
  TIME_BETWEEN_QUESTIONS: 3,
  LINES_PER_CHECK_FORM: 25,
  MIGRATE_FULL_SCHOOL_DATASET: process.env.hasOwnProperty('MIGRATE_FULL_SCHOOL_DATASET') ? toBool(process.env.MIGRATE_FULL_SCHOOL_DATASET) : true,
  // autoMark true | false - Automatically mark the check data when we receive it: boolean
  autoMark: process.env.hasOwnProperty('AUTO_MARK') ? toBool(process.env.AUTO_MARK) : true,
  Data: {
    allowedWords: process.env.ALLOWED_WORDS || 'aaa,bcd,dcd,tfg,bxx',
    pinSubmissionMaxAttempts: process.env.PIN_SUBMISSION_MAX_ATTEMPTS || 100,
    helplineNumber: process.env.HELPLINE_NUMBER || '0345 278 8080',
    pupilCensusMaxSizeFileUploadMb: process.env.PUPIL_CENSUS_MAX_FILE_UPLOAD_MB || 100 * 1024 * 1024,
    psychometricianReportMaxSizeFileUploadMb: process.env.PS_REPORT_MAX_FILE_UPLOAD_MB || 100 * 1024 * 1024
  },
  Sql: {
    Database: process.env.SQL_DATABASE || 'mtc',
    Server: process.env.SQL_SERVER || 'localhost',
    Port: process.env.SQL_PORT || 1433,
    Timeout: process.env.SQL_TIMEOUT || oneMinuteInMilliseconds,
    Encrypt: process.env.hasOwnProperty('SQL_ENCRYPT') ? toBool(process.env.SQL_ENCRYPT) : true,
    Application: {
      Name: process.env.SQL_APP_NAME || 'mtc-local-dev', // docker default
      Username: process.env.SQL_APP_USER || 'mtcAdminUser', // docker default
      Password: process.env.SQL_APP_USER_PASSWORD || 'your-chosen*P4ssw0rd_for_dev_env!' // docker default
    },
    Pooling: {
      MinCount: process.env.SQL_POOL_MIN_COUNT || 5,
      MaxCount: process.env.SQL_POOL_MAX_COUNT || 10,
      LoggingEnabled: process.env.hasOwnProperty('SQL_POOL_LOG_ENABLED') ? toBool(process.env.SQL_POOL_LOG_ENABLED) : true
    },
    Migrator: {
      Username: process.env.SQL_ADMIN_USER || 'sa', // docker default
      Password: process.env.SQL_ADMIN_USER_PASSWORD || 'Mtc-D3v.5ql_S3rv3r', // docker default
      Timeout: process.env.SQL_MIGRATION_TIMEOUT || twoMinutesInMilliseconds
    },
    Azure: {
      Scale: process.env.SQL_AZURE_SCALE
    }
  },
  Logging: {
    LogLevel: process.env.LOG_LEVEL || 'debug',
    LogDna: {
      key: process.env.LOGDNA_API_KEY,
      hostname: `${os.hostname()}:${process.pid}`,
      ip: undefined,
      mac: undefined,
      app: `MTCAdmin:${getEnvironment()}`,
      env: `${getEnvironment()}`
    },
    Express: {
      UseWinston: process.env.EXPRESS_LOGGING_WINSTON || false
    },
    SendToAppInsights: process.env.APPINSIGHTS_WINSTON_LOGGER || false
  },
  OverridePinExpiry: process.env.hasOwnProperty('OVERRIDE_PIN_EXPIRY') ? toBool(process.env.OVERRIDE_PIN_EXPIRY) : false,
  Certificates: {
    Azure: {
      BlobContainer: process.env.CERT_BLOB_CONTAINER,
      NcaToolsPublicKeyName: process.env.CERT_NCATOOLS_PUBLIC_KEY_NAME,
      MtcPrivateKeyName: process.env.CERT_MTC_PRIVATE_KEY_NAME
    },
    Local: {
      NcaToolsPublicKey: process.env.TSO_AUTH_PUBLIC_KEY,
      MtcPrivateKey: process.env.MTC_AUTH_PRIVATE_KEY
    }
  },
  Environment: getEnvironment(),
  AssetPath: process.env.ASSET_PATH || '/',
  Cors: {
    Whitelist: process.env.CORS_WHITELIST || 'http://localhost:4200' // for development
  },
  Tokens: {
    // 12 hours default expiry
    jwtTimeOutHours: process.env.JWT_TIMEOUT_HOURS || 12,
    sasTimeOutHours: process.env.SAS_TIMEOUT_HOURS || 12
  },
  Azure: {
    queuePrefix: process.env.AZURE_QUEUE_PREFIX || '',
    tablePrefix: process.env.AZURE_TABLE_PREFIX || ''
  },
  Monitoring: {
    NewRelic: {
      LicenceKey: process.env.NEW_RELIC_LICENSE_KEY,
      ApplicationName: process.env.NEW_RELIC_APP_NAME
    },
    ApplicationInsights: {
      Key: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      CollectDependencies: process.env.APPINSIGHTS_COLLECT_DEPS,
      CollectExceptions: process.env.APPINSIGHTS_COLLECT_EXCEPTIONS
    }
  }
}
