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
      projects: [
        {entities: [
          {x: 7, y: 8, width: 5, height: 6, _type: "image", src: "http://mos.oddberries.com/wp-content/themes/oddb-storefront/_layouts/home_selection/decor-01.jpg", alt: "A banner image from the storefront" },
          {x: 0, y: 8, width: 4, height: 5, _type: "text", text: "Hello World! This is my first moodboard to test the various elements. Please be patient will they progress."},
          {x: 5, y: 1, width: 2, height: 9, _type: "product", img: { src: "http://mos.oddberries.com/wp-content/uploads/2018/08/serena-rame-front-1-768x767.jpg", alt: "" }, title: "Serena", design: "Patricia Urquiola / FLOS", price: "£729-£1528" },
          {x: 3, y: 1, width: 2, height: 7, _type: "material", img: { src: "https://matterofstuff.com/wp-content/uploads/2019/05/material-rawearth-fuga-matteobrioni-matterofstuff20180910_0553.jpg", alt: "" }, title: "Fuga", design: "TerraTon" },
          {x: 4, y: 10, width: 2, height: 2, _type: "colour", hex: "9a95b5" },
          {x: 0, y: 0, width: 2, height: 6, _type: "file", format: "pdf", name: "History of Italian Design", image: { src: "https://cdn.shopify.com/s/files/1/1709/9537/products/100977_1024x1024.jpg?v=1508977616" } },
          {x: 0, y: 16, width: 3, height: 4},
          {x: 9, y: 0, width: 3, height: 2},
          {x: 6, y: 15, width: 5, height: 4, _type: "text", text: "Please Note: the drop shadows are temporary to see where the cards are, will reevaluate later." },
        ]},
        // autoProj()
        {entities: [
          {x: 8, y: 3, width: 4, height: 2},
          {x: 3, y: 4, width: 4, height: 5},
          {x: 7, y: 5, width: 5, height: 5},
          {x: 1, y: 7, width: 2, height: 7},
          {x: 1, y: 3, width: 1, height: 2},
          {x: 0, y: 0, width: 2, height: 3},
          {x: 0, y: 3, width: 1, height: 2},
          {x: 9, y: 0, width: 3, height: 2}
        ]}
      ]
    }
  }))

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
