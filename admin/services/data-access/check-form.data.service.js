'use strict'

const { TYPES } = require('./sql.service')
const R = require('ramda')
const sqlService = require('./sql.service')

const table = '[checkForm]'

const checkFormDataService = {
  /**
   * Get active forms
   * This will be deprecated when the form choice algorithm is introduced
   * @param id
   * @returns {Promise<*>}
   */
  sqlFindActiveForm: (id = undefined) => {
    let sql = 'SELECT TOP 1 * FROM [mtc_admin].[checkForm] WHERE isDeleted=0'
    const params = []
    if (id) {
      sql += ' AND id=@id'
      params.push({
        name: 'id',
        value: id,
        type: TYPES.Int
      })
    }
    return sqlService.query(sql, params)
  },

  /**
   * Get active form by id
   * This will be deprecated when the form choice algorithm is introduced
   * @param id
   * @returns {Promise<*>}
   */
  sqlGetActiveForm: (id) => {
    let sql = `SELECT TOP 1 * FROM ${sqlService.adminSchema}.[checkForm] WHERE isDeleted=0`
    const params = []
    if (id) {
      sql += ' AND [id]=@id'
      params.push({
        name: 'id',
        value: id,
        type: TYPES.Int
      })
    }
    return sqlService.query(sql, params)
  },
  /**
   * Fetch active forms (not deleted)
   * sorted by name
   * @param {Number} windowId only forms assigned to the specified window (optional)
   * @param {Boolean} sortDescending if true, sorts descending
   * @param {Boolean} isLiveCheck
   * @returns {Promise<*>}
   */
  sqlFetchSortedActiveFormsByName: (windowId, sortDescending, isLiveCheck = true) => {
    let sortOrder = 'ASC'
    if (sortDescending) {
      sortOrder = 'DESC'
    }
    const params = []
    let sql = ''
    if (windowId) {
      // Note: we should not be able to unassign forms from a currently running check window
      // Here we calculate it on the fly from the database.
      sql = `
      SELECT
        cf.*,
      IIF(cw.checkStartDate > SYSDATETIMEOFFSET(), /* TRUE */ cast(1 as bit) , /* FALSE */ cast(0 as bit)) as guiCanUnassign
      FROM ${sqlService.adminSchema}.[checkForm] cf
      LEFT JOIN ${sqlService.adminSchema}.[checkFormWindow] cfw ON (cf.id = cfw.checkForm_id)
      LEFT JOIN ${sqlService.adminSchema}.[checkWindow] cw ON (cfw.checkWindow_id = cw.id)
      WHERE cf.isDeleted = 0
      AND cw.id = @windowId
      AND isLiveCheckForm = @isLiveCheckForm
      ORDER BY cf.name ASC`

      params.push(
        {
          name: 'windowId',
          value: windowId,
          type: TYPES.Int
        },
        {
          name: 'isLiveCheckForm',
          value: isLiveCheck ? 1 : 0,
          type: TYPES.Bit
        })
    } else {
      sql = `SELECT * FROM ${sqlService.adminSchema}.[checkForm]
             WHERE isDeleted=0
             ORDER BY [name] ${sortOrder}`
    }
    return sqlService.query(sql, params)
  },

  sqlFetchSortedActiveFormsNotAssignedToWindowByName: (windowId) => {
    const params = [{
      name: 'windowId',
      value: windowId,
      type: TYPES.Int
    }]
    const sql = `SELECT * FROM ${sqlService.adminSchema}.[checkForm] WHERE isDeleted=0
      AND [id] NOT IN (SELECT DISTINCT checkForm_id FROM checkFormWindow
      WHERE checkWindow_id =@windowId) ORDER BY [name]`
    return sqlService.query(sql, params)
  },

  /**
   * Fetch active forms (not deleted)
   * sorted by window
   * @returns {Promise<*>}
   */
  sqlFetchSortedActiveFormsByWindow: (windowId, sortDescending) => {
    let sortOrder = 'ASC'
    if (sortDescending) {
      sortOrder = 'DESC'
    }
    const params = []
    let sql
    if (windowId) {
      sql = `SELECT cf.*, cw.[name] FROM ${sqlService.adminSchema}.[checkForm] cf
      INNER JOIN ${sqlService.adminSchema}.[checkFormWindow] fw
          ON cf.id = fw.checkForm_id
      INNER JOIN ${sqlService.adminSchema}.[checkWindow] cw
        ON cw.id = fw.checkWindow_id
      WHERE cf.isDeleted=0 AND fw.checkWindow_id=@windowId
      ORDER BY cw.[name] ${sortOrder}`
      params.push({
        name: 'windowId',
        value: windowId,
        type: TYPES.Int
      })
    } else {
      sql = `SELECT DISTINCT cf.id, cf.[name], cf.isDeleted FROM ${sqlService.adminSchema}.[checkForm] cf
      LEFT OUTER JOIN ${sqlService.adminSchema}.[checkFormWindow] fw
          ON cf.id = fw.checkForm_id
      LEFT OUTER JOIN ${sqlService.adminSchema}.[checkWindow] cw
        ON cw.id = fw.checkWindow_id
      WHERE cf.isDeleted=0
      ORDER BY cf.name ${sortOrder}`
    }
    return sqlService.query(sql, params)
  },
  /**
   * Create check form
   * @param checkForm
   * @returns {Promise<*>}
   */
  sqlCreate: (checkForm) => {
    return sqlService.create('[checkForm]', checkForm)
  },
  /**
   * Find check form by name.
   * @param formName
   * @returns {Promise|*}
   */
  sqlFindCheckFormByName: (formName) => {
    const sql = `SELECT * FROM ${sqlService.adminSchema}.[checkForm] WHERE isDeleted=0 AND [name]=@name`
    const params = [{
      name: 'name',
      value: formName,
      type: TYPES.NVarChar
    }]
    return sqlService.query(sql, params)
  },

  /**
   * assigns a check form to a window
   */
  sqlAssignFormToWindow: async (formId, windowId) => {
    return sqlService.create('[checkFormWindow]', { checkForm_id: formId, checkWindow_id: windowId })
  },

  sqlRemoveWindowAssignment: (formId, windowId) => {
    const params = [
      {
        name: 'formId',
        value: formId,
        type: TYPES.Int
      },
      {
        name: 'windowId',
        value: windowId,
        type: TYPES.Int
      }
    ]
    sqlService.modify(`DELETE ${sqlService.adminSchema}.[checkFormWindow] WHERE checkForm_id=@formId AND checkWindow_id=@windowId`, params)
  },

  sqlRemoveAllWindowAssignments: async (formId) => {
    const params = [
      {
        name: 'formId',
        value: formId,
        type: TYPES.Int
      }
    ]
    return sqlService.modify(`DELETE ${sqlService.adminSchema}.[checkFormWindow] WHERE checkForm_id=@formId`, params)
  },

  sqlIsAssignedToWindows: async (formId) => {
    const params = [
      {
        name: 'formId',
        value: formId,
        type: TYPES.Int
      }
    ]
    const result = sqlService.query(`SELECT COUNT(*) FROM ${sqlService.adminSchema}.[checkFormWindow] WHERE checkForm_id=@formId`, params)
    // HACK test object structure
    return result.value > 0
  },

  sqlMarkFormAsDeleted: async (formId) => {
    const params = [
      {
        name: 'formId',
        value: formId,
        type: TYPES.Int
      }
    ]
    return sqlService.modify(`UPDATE ${sqlService.adminSchema}.[checkForm] SET isDeleted=1 WHERE [id]=@formId`, params)
  },

  sqlFindByIds: async function (ids) {
    const select = `
    SELECT *
    FROM ${sqlService.adminSchema}.${table}
    `
    const { params, paramIdentifiers } = sqlService.buildParameterList(ids, TYPES.Int)
    const whereClause = 'WHERE id IN (' + paramIdentifiers.join(', ') + ')'
    const sql = [select, whereClause].join(' ')
    return sqlService.query(sql, params)
  },

  /**
   * Fetch check form by id.
   * @param id
   * @returns {Promise.<object>}
   */
  sqlFindOneById: async (id) => {
    const sql = `SELECT * FROM ${sqlService.adminSchema}.${table} WHERE isDeleted=0 AND id=@id`
    const params = [
      {
        name: 'id',
        value: id,
        type: TYPES.Int
      }
    ]
    const rows = await sqlService.query(sql, params)
    return R.head(rows)
  },

  /**
   * Fetch check form with parsed check form data by id.
   * @param id
   * @returns {Promise.<object>}
   */
  sqlFindOneParsedById: async (id) => {
    const params = [
      {
        name: 'id',
        value: id,
        type: TYPES.Int
      }
    ]
    const sql = `SELECT * FROM ${sqlService.adminSchema}.${table} WHERE isDeleted=0 AND id=@id`

    const result = await sqlService.query(sql, params)

    const first = R.head(result)
    return R.assoc('formData', (JSON.parse(first.formData)), first)
  }
}

module.exports = checkFormDataService
