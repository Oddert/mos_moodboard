
const interact = [
  { route: 'one', title: 'One' },
  { route: 'two', title: 'Two' },
  { route: 'three', title: 'Three' },
  { route: 'four', title: 'Four' },
  { route: 'drag_resize', title: 'Basic Restricted Drag Example' },
  { route: 'grid', title: 'Grid Drag Example' },
  { route: 'drag_drop', title: 'Drag and Drop Example' },
  { route: 'grid_proto_one', title: 'Grid Prototype Moodboard One' },
  { route: 'gridstack_one', title: 'Gridstack Prototype Moodboard Two', items: [
    { x:0, y:0, w:2, h:2 },
    { x:3, y:1, w:1, h:2 },
    { x:4, y:1, w:1, h:1 },
    { x:2, y:3, w:3, h:1 },
    { x:2, y:5, w:3, h:1 }
  ] },
  { route: 'gridstack_copy', title: 'Gridstack Multi Board Drag Drop' }
]


const express     = require('express')
    , app         = express()
    , bodyParser  = require('body-parser')
    , path        = require('path')

const sd = require('./utils/sample_data.js')

const PORT = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '/public')))

app.route('/')
  .get((req, res, next) => res.redirect('/prototype/six?dataset=fora'))
  // .get((req, res, next) => res.status(200).json({
  //   message: 'Status OK',
  //   status: 200,
  //   route: '/'
  // }))


app.route('/interact')
  .get((req, res, next) => res.render('interact', { interact }))

app.route('/interact/:file')
  .get((req, res, next) =>
    res.render(
      `interact/${req.params.file}`,
      { item: interact.find(each => each.route === req.params.file) }
    )
  )

app.route('/prototype/one')
  .get((req, res, next) => res.render('prototype/one', { items: sd.proto_one_items }))

app.route('/prototype/:num')
  .get((req, res, next) => res.render(`prototype/${req.params.num}`))

app.route('/dynamic_search')
  .get((req, res, next) => res.render('dynamic_search'))

app.use('/api', require('./routes/api'))

const server = app.listen(
  PORT
  , () => console.log(
    `${new Date().toLocaleTimeString('en-GB')}: Server initialised on PORT: ${PORT}...`
  )
)


// =====================================
//   -=-=-=-=-  TO DO LIST  -=-=-=-=-
// =====================================

// -Find a way of binding event listeners to newly created widgets ✓
// -Implament remove funcitonality (easy) ✓
// -Add new item menu for ajax'ed products, maerials etc. ✓
// -Widget Edit Menues:
//    -Text Edit ✓
//    -Colour Picker ✓
//    -Image Uploader ✓
//    -Product / Material Browser ✓
//    -File Upload ✓
// -Implament Page Add ✓
// -Implament Page Delete (1/2) ✓
// -Implament auto-save and actual save x
// -Implament undo, redo x
//  -Item edit via selector: ✓
//    -Image ✓
//    -Product ✓
//    -Material ✓
//    -Colour ✓
//  -Design slide side-bar ✓
//    -Render hooks ✓
//    -Find a way to do thumbnail ✓
//    -Page order modification ✓
//  -How to do page sizing without vh / vh units ✓
//  -Paste Functionality (widget) ✓
//    -Can read slide position ✓
//    -Paste widget ✓
//    -Destroy old widget ✓
//  -Paste Functionality (slide)
//    -Can read slide position
//    -Paste / Destroy new slide
//    -Re-render
//    -Check that slide jump updates focused page
//  -New Sidebar Layout and collapse
//  -Local auto save
//  -Actual ajax save (mock db fro this)
