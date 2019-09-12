const router = require('express').Router()
const fs = require('fs')

const sd = require('../utils/sample_data')

let sampleProductData
let sampleMaterialsData
fs.readFile('./utils/sample_products.txt', 'utf8', (err, data) => {
  // console.log(err, data)
  // console.log(JSON.parse(data).products[0])
  sampleProductData = JSON.parse(data).products
})
fs.readFile('./utils/material.txt', 'utf8', (err, data) => {
  sampleMaterialData = JSON.parse(data).materials
})
let sampleProducts = () => sampleProductData
let sampleMaterials = () => sampleMaterialData

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

  })
  .put((req, res, next) => {
    console.log(req.body)
    fs.writeFile('test.txt', JSON.stringify(req.body.payload), err => {
      if (err) {
        console.log(err)
        res.json({ success: false, err, message: 'oops' })
      } else {
        console.log('success!')
        res.json({ success: true, message: 'sal good' })
      }
    })
  })

router.route('/product')
  .get((req, res, next) => {
    res.json(sampleProducts())
  })

router.route('/product/:searchTerm')
  .get((req, res, next) => {
    const search = new RegExp(req.params.searchTerm, 'gi')
    const data = () => [...sampleProducts()].filter(each => {
      if (!each) return false
      else return each.title.match(search)
    })
    res.json(data())
  })

router.route('/material/:searchTerm')
  .get((req, res, next) => {
    const search = new RegExp(req.params.searchTerm, 'gi')
    const data = () => [...sampleMaterials()].filter(each => {
      if (!each) return false
      else return each.title.match(search)
    })
    res.json(data())
  })

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
