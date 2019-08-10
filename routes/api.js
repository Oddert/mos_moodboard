const router = require('express').Router()

const sd = require('../utils/sample_data')

router.route('/projects/:user')
  .get((req, res, next) => res.json({
    err: null,
    status: 200,
    success: true,
    message: 'default data',
    payload: {
      // projects: [sd.proto_one_items, sd.proto_one_items]
      projects: [[
        {x: 0, y: 0, width: 2, height: 2},
        {x: 3, y: 1, width: 1, height: 2},
        {x: 4, y: 1, width: 1, height: 1},
        {x: 2, y: 3, width: 3, height: 1},
        {x: 1, y: 4, width: 1, height: 1},
        {x: 1, y: 3, width: 1, height: 1},
        {x: 2, y: 4, width: 1, height: 1},
        {x: 2, y: 5, width: 1, height: 1}
      ],[
        {x: 0, y: 0, width: 2, height: 2},
        {x: 3, y: 1, width: 1, height: 2},
        {x: 4, y: 1, width: 1, height: 1},
        {x: 2, y: 3, width: 3, height: 1},
        {x: 1, y: 4, width: 1, height: 1},
        {x: 1, y: 3, width: 1, height: 1},
        {x: 2, y: 4, width: 1, height: 1},
        {x: 2, y: 5, width: 1, height: 1}
      ]]
    }
  }))


module.exports = router
