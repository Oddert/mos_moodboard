const express     = require('express')
    , app         = express()
    , bodyParser  = require('body-parser')
    , path        = require('path')
    , cors        = require('cors')

const sd = require('./utils/sample_data.js')

const PORT = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '/public')))
app.use(cors())

app.route('/')
  .get((req, res, next) => res.redirect('/prototype/six?dataset=fora'))

app.route('/interact')
  .get((req, res, next) => res.render('interact', { interact: sd.interact }))

app.route('/interact/:file')
  .get((req, res, next) =>
    res.render(
      `interact/${req.params.file}`,
      { item: sd.interact.find(each => each.route === req.params.file) }
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
//    -Can read slide position ✓
//    -Paste / Destroy new slide ✓
//    -Re-render ✓
//    -Check that slide jump updates focused page ✓
//    -Implament extra drop menu functions for slides ???
//  -New Sidebar Layout and collapse ✓
//  -Local auto save
//    -Move widget
//    -Resize widget
//    -Edit widget
//    -Delete widget
//    -Cut Copy Paste x 2
//    -Reorder slide
//    -Delete Slide
//  -Actual ajax save (mock db for this)
//  -EXPORT TO PDF

//  -Minor Bug: Resizing still ausing issues when multiple resize handles are employed at once
