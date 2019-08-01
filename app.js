const express     = require('express')
    , app         = express()
    , bodyParser  = require('body-parser')
    , path        = require('path')

const PORT = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '/public')))

app.route('/')
  .get((req, res, next) => res.status(200).json({
    message: 'Status OK',
    status: 200,
    route: '/'
  }))

const interact = [
  { route: 'one', title: 'One' },
  { route: 'two', title: 'Two' },
  { route: 'three', title: 'Three' },
  { route: 'four', title: 'Four' },
  { route: 'drag_resize', title: 'Basic Restricted Drag Example' },
  { route: 'grid', title: 'Grid Drag Example' },
  { route: 'drag_drop', title: 'Drag and Drop Example' },
  { route: 'grid_proto_one', title: 'Grid Prototype Moodboard One' },
]

app.route('/interact')
  .get((req, res, next) => res.render('interact', { interact }))

app.route('/interact/:file')
  .get((req, res, next) =>
    res.render(
      `interact/${req.params.file}`,
      { item: interact.find(each => each.route === req.params.file) }
    )
  )

app.route('/prototype_one')
  .get((req, res, next) => res.render('prototype_one', { items: [
    { row: 1, col: 1, x: 1, y: 1, type: 'product' },
    { row: 2, col: 1, x: 1, y: 1, type: 'product' },
    { row: 3, col: 1, x: 1, y: 1, type: 'product' },
    { row: 3, col: 1, x: 1, y: 1, type: 'product' },
    { row: 1, col: 2, x: 2, y: 1, type: 'product' },
    { row: 2, col: 2, x: 2, y: 2, type: 'product' },
    { row: 1, col: 4, x: 2, y: 2, type: 'product' },
    { row: 2, col: 4, x: 2, y: 1, type: 'product' },
    { row: 3, col: 4, x: 1, y: 1, type: 'product' },
    { row: 1, col: 4, x: 1, y: 1, type: 'product' },
    { row: 3, col: 4, x: 1, y: 1, type: 'product' },
    { row: 1, col: 4, x: 1, y: 1, type: 'product' },
    { row: 2, col: 4, x: 1, y: 2, type: 'product' },
  ] }))

const server = app.listen(
  PORT
  , () => console.log(
    `${new Date().toLocaleTimeString('en-GB')}: Server initialised on PORT: ${PORT}...`
  )
)
