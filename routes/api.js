const router = require('express').Router()

const sd = require('../utils/sample_data')

router.route('/projects/:user')
  .get((req, res, next) => res.json({
    err: null,
    status: 200,
    success: true,
    message: 'default data',
    payload: {
      projects: [sd.proto_one_items]
    }
  }))


module.exports = router
