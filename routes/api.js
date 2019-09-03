const router = require('express').Router()

const sd = require('../utils/sample_data')

router.route('/projects/:user')
  .get((req, res, next) => {
    console.log(req.query)
    switch (req.query.dataset) {
      case 'fora':
        return res.json({
          err: null, status: 200, success: true, message: 'Fora dataset',
          payload: sd.fora_payload
        })
      default:
        return res.json({
          err: null,
          status: 200,
          success: true,
          message: 'default data',
          payload: sd.default_payload
        })
    }

  }
)

const ran = (multiplier, offset=0) => Math.floor(Math.random() * multiplier) + offset
const autoVal = () => ({
  x: ran(5, 0),
  y: ran(5, 0),
  width: ran(5, 1),
  height: ran(5, 2),
})
const autoProj = () => {
  const out = []
  for (let i=0; i<8; i++) out.push(autoVal())
  return out
}
console.log(autoProj())


module.exports = router
