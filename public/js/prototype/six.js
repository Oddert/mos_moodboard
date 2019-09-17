const colours = [
  { r:53, g:152, b:219 }, { r:27, g:188, b:155 }, { r:154, g:89, b:181 }, { r:243, g:156, b:17 }, { r:232, g:76, b:61 },
  { r:126, g:140, b:141 }, { r:52, g:73, b:94 }, { r:241, g:196, b:15 }, { r:22, g:160, b:134 }, { r:210, g:84, b:0 }, { r:41, g:127, b:184 },
  { r:141, g:68, b:173 }, { r:193, g:57, b:43 }, { r:39, g:174, b:97 }
]

const defaultImg = {
  src: 'https://res.cloudinary.com/oddert/image/upload/v1558101908/MOS/tiles/placeholder_image-01.png',
  alt: 'Placeholder Image'
}

let userRender, colourPicker;

const lastClick = {
  grid: null,
  x: null,
  y: null,
  gridElem: null,
  widget: null,
  cutPasteData: {
    _type: "",
    lastAction: null,
    attributes: {
      //, src, hex, url ...etc
    },
    previousPosition: {
      wasOnGrid: false
      //, x, y, width, height
    }
  }
}

let newItemMenuState = 'text'

let focusedPage = {
  offset: 0,
  grid: null,
  gridElem: null,
  idx: 0
}

let rows = 20
console.log({ rows })

const data = {
  username: 'no user',
  projects: []
}


// ### Structure:
//  -Constants and data containers
//  -Serialise Functions
//  -Top Level Functions
//  -Page initislisatin
//  -Content Creators
//  -Content Functions
//  -Interface Functions
//  -Event Binding
//  -Standard Functions



// ========== Serialise Functions ==========

function extractElementData (jQueryElem) {
  const content = jQueryElem.find('.content')
  const dataType = content.data('mosContenttype')
  switch (dataType) {
    case "text":
    return {
      _type: "text",
      text: content.find('.content_text__text') ? content.find('.content_text__text').text() : content.find('.content_text__input').val()
    }
    case "image":
    return {
      _type: "image",
      src: content.find('img').attr('src') || "",
      alt: content.find('img').attr('alt') || ""
    }
    case "colour":
    return {
      _type: "colour",
      hex: convertToHex(content.find('.colour__module').css('background-color')) || "000000"
    }
    case "file":
    return {
      _type: "file",
      format: content.find('.file__data').data('mosFormat'),
      name: content.find('.file__cover__title p').text(),
      image: {
        src: content.css('background-image').replace('url("', '').replace('")', '')
      }
    }
    case "product":
    return {
      _type: "product",
      img: {
        src: content.find('.content_product__img img').attr('src'),
        alt: content.find('.content_product__img img').attr('alt')
      },
      title: content.find('.content_product__text--title').text(),
      design: content.find('.content_product__text--design').text(),
      price: content.find('.content_product__text--price').text()
    }
    case "material":
    return {
      _type: "material",
      img: {
        src: content.find('.content_material__img img').attr('src'),
        alt: content.find('.content_material__img img').attr('alt')
      },
      title: content.find('.content_material__text--title').text(),
      design: content.find('.content_material__text--design').text()
    }
    default:
    return {}
  }
}

function extractElementDataGridstack (node) {
  const { el } = node
  return extractElementData (el)
}

function serialise () {
  const output = []
  $('.page').each(function (idx, grid) {
    const title = $(grid).find('.page__title h3').text().trim()
    const entities = []
    const items = $(grid).find('.grid-stack-item:visible')
      .map((idx, each) => {
        const node = $(each).data('_gridstack_node')
        const nodeData = extractElementDataGridstack(node)
        entities.push ({
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
          page: node._grid._stylesId,
          ...nodeData
        })
      })
      output.push({ title, entities })
  })
  return output
}

function save () {
  const url = `/api/projects/test`
  const opts = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify ({
      payload: serialise()
    })
  }
  fetch(url, opts)
    .then(res => res.json())
    .then(res => console.log({ res }))
}

// ========== / Serialise Functions ==========



// ========== Top Level Functions ==========

function render (data) {
  const pages = document.querySelector('.pages')
  pages.innerHTML = ""

  function addPage (each, idx) {
    const page = `
      <div class="page">
        <div class="page__wrapper">
          <div class="page__title">
            <h3 title="double click to edit page title" class="page__title__text">${each.title ? each.title : '  '}</h3>
            <div class="page__title__delete">
              <button class="page__title__delete--delete"><i class="fas fa-times"></i></button>
            </div>
          </div>
          <div class="page__content grid-stack">

          </div>
        </div>
      </div>
    `
    pages.innerHTML += page
  }

  function pageCreateListeners () {
    $(this).find('.page__title h3').dblclick(toggleTitleEdit)
    $(this).find('.page__title .page__title__delete--delete').click(toggleTitleDelete)
  }

  data.projects.forEach(addPage)
  $('.page').each(pageCreateListeners)

  // NOTE: Are we still using user render ??
  userRender = () => createGridContent (pages, data)
  userRender()
}

function createGridContent (pages, data) {
  const all = pages.querySelectorAll('.page .page__content')

  all.forEach(addOnePageContent)

  $('.page .page__content')
    .each(function (pageIdx) {
      const elem = $(this)
      elem.data('mosPageIdx', pageIdx)
      const grid = elem.data('gridstack')
      if (grid) grid.removeAll()
      const items = data.projects[pageIdx].entities
      _.each(items, function (node, itemIdx) {
        const newWidget = $(`
          <div>
            <div class="grid-stack-item-content" data-mos-page="${pageIdx}" data-mos-item="${itemIdx}">
              ${getContent(node)}
            </div>
          </div>
        `)
        const createdWidget = grid.addWidget(newWidget, node.x, node.y, node.width, node.height)
        createdWidget.find('.content__controls--delete').click(function () {
          grid.removeWidget(this.closest('.grid-stack-item'))
        })
        createdWidget.click(function () {
          if (lastClick.widget) lastClick.widget.classList.remove('user_focus')
          lastClick.widget = this
          lastClick.grid = grid
          lastClick.gridElem = elem
          this.classList.add('user_focus')
        })
        // createdWidget.data('mospage', `${pageIdx}`)
        if (node._type === "text") {
          createdWidget.find('.content__controls--text_edit').click(toggleTextEdit)
        }
        if (node._type === "colour") {
          // createdWidget.find('.content__controls--colour_edit').click(toggleColourEdit)
        }
        if (node._type === "image") {
          // createdWidget.find('.content__controls--image_edit').click(toggleImageEdit)
        }
      }, this)
      // old lastClick detector:
      elem.on('click', e => openNewItemMenu(e, elem, grid))
    })
}

const gridstackOptions = {
  // width: 12,
  width: 13,
  minWidth: 500,
  height: rows,
  float: true,
  animate: true,
  removable: false,

  // cellHeight: '50',
  // cellHeightUnit: 'px'
  // // removable: '.trash'
  // removeTimeout: 100,
  acceptWidgets: '.grid-stack-item'
}

function addOnePageContent (page, idx) {
  //.page__content as document.querySelector()
  const thisPage = $(page)
  const height = thisPage.height()
  thisPage.gridstack({
    ...gridstackOptions,
    cellHeight: `${(height - ((rows - 1) * 20)) / rows}`
  })
  page.style.height = '250px'
  page.dataset.mosTest = '250'
  page.dataset.mosPageIdx = idx
}

function pageScrollHandler () {
  const pages = document.querySelectorAll('.page')
  const { scrollY } = window
  const heights = []
  pages.forEach((each, idx) => heights.push({
    offset: each.offsetTop + (each.scrollHeight / 2),
    gridElem: each,
    grid: $(each).find('.page__content').data('gridstack'),
    idx
  }))

  const nextDown = heights.filter(each => each.offset < scrollY).pop()
  const nextUp = heights.filter(each => each.offset > scrollY).shift()

  function getClosestToCenter () {
    if (!nextDown) return nextUp
    if (!nextUp) return nextDown
    // get whole object instead of just offsets from Maths.Min
    else return [nextDown, nextUp].filter(
      each => each.offset === Math.max(nextDown.offset, nextUp.offset)
    )[0]
  }
  focusedPage = getClosestToCenter()
}

function copy () {
  const copyOfLastClicked = {
    grid: null,
    x: null,
    y: null,
    gridElem: null,
    widget: null,
    cutPasteData: {
      lastAction: null,
      attributes: {
        _type: "",
        //, src, hex, url ...etc
      },
      previousPosition: {
        wasOnGrid: false
        //, x, y, width, height
      }
    }
  }
  if (lastClick.widget) {
    const { cutPasteData: { lastAction }, widget } = lastClick
    const { gsX: x, gsY: y, gsWidth: width, gsHeight: height } = widget.dataset
    const { mosPageIdx: gridIdx } = widget.closest('.page__content').dataset
    lastClick.cutPasteData.lastAction = 'COPY'
    lastClick.cutPasteData.attributes = extractElementData ($(widget))
    lastClick.cutPasteData.previousPosition = {
      wasOnGrid: true,
      x, y, width, height, gridIdx
    }
  }
}

function handleGlobalKeyPress (event) {
      // Going to have to go on faith that this works before testing
      // can be crried out on mac devices
  // ==================================
  if ((navigator.platform === "MacIntel" && event.metaKey) || (!(navigator.platform === "MacIntel" && event.metaKey) && event.ctrlKey)) {
  // ==================================
    if (event.key === 'c' && event.ctrlKey) {
      console.log('COPY')
      copy ()
    }
    if (event.key === 'x' && event.ctrlKey) {
      console.log('CUT')
    }
    if (event.key === 'v' && event.ctrlKey) {
      console.log('PASTE')
    }
  }
}

// ========== / Top Level Functions ==========



// ========== Page initialisation ==========

function initPage () {

const devButton = document.querySelector('button[name=dev]')
if (devButton) devButton.onclick = () => userRender()

function initialAjax () {
  const params = new URLSearchParams(window.location.search)
  const dataset = params.get('dataset')
  const url = dataset ? `/api/projects/sample?dataset=${dataset}` : `/api/projects/sample`
  // console.log(params, dataset, url)
  const opts = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }

  function cb (res) {
    console.log(res)
    const { projects } = res.payload
    data.projects = projects
    render(data)
  }

  fetch(url, opts)
  .then(res => res.json())
  .then(cb)
}
//
// function initialiseNewItemMenu () {
//   const text = document.querySelector('.new_item_menu__item.text button')
//   const colour = document.querySelector('.new_item_menu__item.colour button')
//   const image = document.querySelector('.new_item_menu__item.image button')
//   const product = document.querySelector('.new_item_menu__item.product button')
//   const material = document.querySelector('.new_item_menu__item.material button')
//   const menu = document.querySelector('.new_item_menu--container')
//   function addUserWidget (content, width = 1, height = 2) {
//     menu.style.display = 'none'
//     const { grid, gridElem, x, y } = lastClick
//     const gridPos = grid.getCellFromPixel({ top: y, left: x }, true)
//     const newWidget = $(`
//       <div>
//         <div
//           class="grid-stack-item-content"
//           data-mos-page="${gridElem.data('mosPageIdx')}"
//           data-mos-item="${gridElem.children().length + 1}"
//         >
//           ${content}
//         </div>
//       </div>
//     `)
//     // I appologise profusely.
//     let adjustedX = gridPos.x
//     let adjustedY = gridPos.y
//     if (gridPos.x < 2) adjustedX = 0
//     if (gridPos.x > 10) adjustedX = 12 - width
//     if (gridPos.y < 2) adjustedY = 0
//     if (gridPos.y > 18) adjustedY = 20 - height
//     if (adjustedY > 1 && adjustedY < 18) adjustedY -= 1
//
//     const createdWidget = grid.addWidget(newWidget, adjustedX, adjustedY, width, height)
//     createdWidget.find('.content__controls--delete').click(function () {
//       grid.removeWidget(this.closest('.grid-stack-item'))
//     })
//     return createdWidget
//   }
//   text.onclick = e => {
//     const createdWidget = addUserWidget(createText({ text: 'New Text Box' }), 2, 3)
//     createdWidget.find('.content__controls--text_edit').click(toggleTextEdit)
//   }
//   colour.onclick = e => {
//     const createdWidget = addUserWidget(createColour({ hex: randomHex() }), 1, 2)
//     createdWidget.find('.content__controls--colour_edit').click(toggleColourEdit)
//   }
//   image.onclick = e => {
//     const createdWidget = addUserWidget(createImage(defaultImg), 2, 4)
//     createdWidget.find('.content__controls--image_edit').click(toggleImageEdit)
//   }
//   product.onclick = toggleProductSearch
//   material.onclick = toggleMaterialSearch
// }
//

// REMOVED initColourPicker

//
// function performLibSeach (extention, value, cb) {
//   const url = `/api/${extention}/${value}`
//   const opts = {
//     method: 'GET',
//     headers: { 'Content-Type': 'application/json' }
//   }
//   fetch(url, opts)
//     .then(res => res.json())
//     .then(res => {
//       cb (res, value)
//     })
// }
//
// const filterSearchValue = value => value.replace(/\[|\]|\{|\}|\?|\&|http/gi, '')
//
// // NOTE: For the sake of future itirations, material and product search, while using virtually
// //      the same code, are seperate functions and elements. They share a couple of functions but
// //      that's all for now.
// function initProductSearch () {
//   const productSearchContainer = document.querySelector('.product_search')
//
//   const createResultItem = ({ title, design, price, img }) => `
//     <div class="result_product">
//       <div class="result_product__img">
//         <img src="${img ? img.src : ''}" alt="${img ? img.alt : ''}" />
//       </div>
//       <div class="result_product__text">
//         <p class="result_product__text--title">${title}</p>
//         <p class="result_product__text--design">${design}</p>
//         <p class="result_product__text--price">${price}</p>
//       </div>
//     </div>
//   `
//
//   const productBar = productSearchContainer.querySelector('.product_search__input--bar')
//   const resultsContainer = productSearchContainer.querySelector('.product_search__results ul')
//   const clearButton = productSearchContainer.querySelector('.product_search__input--clear')
//
//   let lastSearchTerm
//
//   function addProductWidget (event, each) {
//     const width = 1, height = 2
//     const { grid, gridElem, x, y } = lastClick
//     const gridPos = grid.getCellFromPixel({ top: y, left: x }, true)
//     const newWidget = $(`
//       <div>
//         <div
//           class="grid-stack-item-content"
//           data-mos-page="${gridElem.data('mosPageIdx')}"
//           data-mos-item="${gridElem.children().length + 1}"
//         >
//           ${createProduct(each)}
//         </div>
//       </div>
//     `)
//
//     const createdWidget = grid.addWidget(newWidget, gridPos.x - 1, gridPos.y - 4, 3, 9)
//     createdWidget.find('.content__controls--delete').click(function () {
//       grid.removeWidget(this.closest('.grid-stack-item'))
//     })
//     hideProductSearch()
//   }
//
//   function renderSearchResults (res, value) {
//     if (res.length) {
//       resultsContainer.innerHTML = ``
//       res.forEach(each => {
//         if (each) resultsContainer.innerHTML += createResultItem(each)
//       })
//       const allResults = resultsContainer.querySelectorAll('.result_product')
//       allResults.forEach((each, idx) => {
//         each.addEventListener('click', e => addProductWidget(e, res[idx]))
//       })
//     } else resultsContainer.innerHTML = `
//         <div class="result_none">
//           <p>Sorry, no results for '${value}'</p>
//         </div>
//       `
//   }
//
//   function clearResults () {
//     productBar.value = ''
//     resultsContainer.innerHTML = ''
//     productBar.focus()
//   }
//
//   function productSearch (e) {
//     const value = filterSearchValue(e.target.value)
//     if (value === lastSearchTerm) return
//     if (!/\w/gi.test(value)) return clearResults()
//     if (value.length < 3) return
//     lastSearchTerm = value
//     performLibSeach ('product', value, renderSearchResults)
//   }
//
//   clearButton.onclick = clearResults
//   productBar.addEventListener('keyup', productSearch)
//   $(productSearchContainer).draggable()
// }
// function initMaterialSearch () {
//   const materialSearchContainer = document.querySelector('.material_search')
//
//   const createResultItem = ({ title, design, img }) => `
//     <div class="result_material">
//       <div class="result_material__img">
//         <img src="${img ? img.src : ''}" alt="${img ? img.alt : ''}" />
//       </div>
//       <div class="result_material__text">
//         <p class="result_material__text--title">${title}</p>
//         <p class="result_material__text--design">${design}</p>
//       </div>
//     </div>
//   `
//
//   const materialBar = materialSearchContainer.querySelector('.material_search__input--bar')
//   const resultsContainer = materialSearchContainer.querySelector('.material_search__results ul')
//   const clearButton = materialSearchContainer.querySelector('.material_search__input--clear')
//
//   let lastSearchTerm
//
//   function addMaterialWidget (event, each) {
//     const width = 1, height = 2
//     const { grid, gridElem, x, y } = lastClick
//     const gridPos = grid.getCellFromPixel({ top: y, left: x }, true)
//     const newWidget = $(`
//       <div>
//         <div
//           class="grid-stack-item-content"
//           data-mos-page="${gridElem.data('mosPageIdx')}"
//           data-mos-item="${gridElem.children().length + 1}"
//         >
//           ${createMaterial(each)}
//         </div>
//       </div>
//     `)
//
//     const createdWidget = grid.addWidget(newWidget, gridPos.x - 1, gridPos.y - 3, 2, 6)
//     createdWidget.find('.content__controls--delete').click(function () {
//       grid.removeWidget(this.closest('.grid-stack-item'))
//     })
//     hideMaterialSearch()
//   }
//
//   function renderSearchResults (res, value) {
//     if (res.length) {
//       resultsContainer.innerHTML = ``
//       res.forEach(each => {
//         if (each) resultsContainer.innerHTML += createResultItem(each)
//         else resultsContainer.innerHTML += `<div class="result_material"></div>`
//       })
//       const allResults = resultsContainer.querySelectorAll('.result_material')
//       allResults.forEach((each, idx) => {
//         each.addEventListener('click', e => addMaterialWidget(e, res[idx]))
//       })
//     } else resultsContainer.innerHTML = `
//         <div class="result_none">
//           <p>Sorry, no results for '${value}'</p>
//         </div>
//       `
//   }
//
//   function clearResults () {
//     materialBar.value = ''
//     resultsContainer.innerHTML = ''
//     materialBar.focus()
//   }
//
//   const filter = value => value.replace(/\[|\]|\{|\}|\?|\&|http/gi, '')
//
//   function materialSearch (e) {
//     const value = filterSearchValue(e.target.value)
//     if (value === lastSearchTerm) return
//     if (!/\w/gi.test(value)) return clearResults()
//     if (value.length < 3) return
//     lastSearchTerm = value
//     performLibSeach ('material', value, renderSearchResults)
//   }
//
//   clearButton.onclick = clearResults
//   materialBar.addEventListener('keyup', materialSearch)
//   $(materialSearchContainer).draggable()
// }

function initialisePageAdd () {
  const newPage = document.querySelector('.new_page button')
  newPage.onclick = () => {
    const serialised = serialise()
    serialised.push({
      title: 'New Page',
      entities: []
    })
    data.projects = serialised
    render(data)
  }
}

function initialiseItemMenuControl () {
  const controlButtons = document.querySelectorAll('.item_menu__control .new_item_menu__item')
  const interfaces = document.querySelectorAll('.item_menu__interface__variant')
  function swapActive (buttonContainers, type) {
    buttonContainers.forEach(each => {
      const button = each.querySelector('button')
      if (each.dataset.mosType === type) {
        button.classList.add('active')
        newItemMenuState = type
      } else button.classList.remove('active')
    })
    interfaces.forEach(each => {
      if (each.dataset.mosType === type) each.classList.add('active')
      else each.classList.remove('active')
    })
  }
  controlButtons.forEach(each => {
    each.querySelector('button').onclick = function () {
      swapActive(controlButtons, this.closest('.new_item_menu__item').dataset.mosType)
    }
  })
}

function initialiseItemMenuInterface () {
  const interfaces = document.querySelectorAll('.item_menu__interface__variant')
  const text = document.querySelector('.item_menu__interface__variant.text')
  const image = document.querySelector('.item_menu__interface__variant.image')
  const colour = document.querySelector('.item_menu__interface__variant.colour')

  function initText (text) {
    const add = text.querySelector('.new_text__insert button')
    add.onclick = newTextBox
  }

  function initImage (image) {
    const urlInput = image.querySelector('input[type=url]')
    const preview = image.querySelector('.image_interface__preview img')
    const add = image.querySelector('.new_image__insert button')
    function handleInput (e) {
      // WARNING: Need some sort of broken link detector, copy from Oddert/odd-blog blog engine later
      preview.src = e.target.value
    }
    urlInput.onmousedown = handleInput
    urlInput.onpaste = handleInput
    urlInput.oninput = handleInput
    add.onclick = e => newImage(urlInput.value, '')
  }

  function initColour (colour) {
    const add = colour.querySelector('.new_colour__insert button')
    const preview = colour.querySelector('.colour_picker__preview--wrapper')
    const previewInput = preview.querySelector('.colour_picker__preview__input')
    const opts = {
      width: 175,
      color: '#1bbc9b',
      wheelLightness: false
    }
    function handleColourChange (colour, change) {
      preview.style.backgroundColor = colour.rgbString
      previewInput.value = colour.hexString.toUpperCase()
    }
    function handleColourInput (e) {
      const { value } = e.target
      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/gi.test(value)) {
        colourPicker.color.hexString = value
      }
      if (/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/gi.test(value)) {
        colourPicker.color.hexString = '#' + value
      }
    }
    colourPicker = new iro.ColorPicker('.colour_picker__iro', opts)
    colourPicker.on('color:change', handleColourChange)
    previewInput.onchange = handleColourInput
    add.onclick = () => newColour (colourPicker)
  }

  initText(text)
  initImage(image)
  initColour(colour)
}

function initDragDrop () {
  const pages = document.querySelector('.pages')
  function nodrop (e) {
    e.preventDefault()
    e.stopPropagation()
  }
  function drop (e) {
    e.preventDefault()
    e.stopPropagation()
    const url = e.dataTransfer.getData('text/plain')
    newImage (url, '')
  }
  pages.addEventListener('dragenter', nodrop, false)
  pages.addEventListener('dragexit', nodrop, false)
  pages.addEventListener('dragover', nodrop, false)
  pages.addEventListener('drop', drop, false)
}

// document.addEventListener('click', e => {
//   const menu = document.querySelector('.new_item_menu--container')
//   let hide = true
//   document.querySelectorAll('.page__content').forEach(each => {
//     if (each.contains(e.target)) hide = false
//   })
//   if (hide) {
//     menu.style.display = 'none'
//     menu.style.top = '20px'
//     menu.style.left = '20px'
//   }
// })

// initColourPicker ()
// initialiseNewItemMenu ()
initialAjax ()
initialisePageAdd ()
// initProductSearch ()
// initMaterialSearch ()
initialiseItemMenuControl()
initialiseItemMenuInterface()
initDragDrop()
}

// ========== / Page initialisation ==========



// ========== Content Creators ==========

const createText = ({ text }) => `
  <div class="content text" data-mos-contenttype="text">
    <div class="content__controls">
      <button class="content__controls--text_edit">✎</button>
      <button class="content__controls--delete">✖</button>
    </div>
    <p class="content_text__text">${text}</p>
  </div>
`

const createImage = ({ src, alt }) => `
  <div class="content image" data-mos-contenttype="image">
    <div class="content__controls">
      <button class="content__controls--image_edit">✎</button>
      <button class="content__controls--delete">✖</button>
    </div>
    <div class="content_image__img">
      <img src="${src}" alt="${alt}" />
    </div>
  </div>
`

const createProduct = ({ img: { src, alt }, title, design, price }) => `
  <div class="content product" data-mos-contenttype="product">
    <div class="content__controls">
      <button class="content__controls--product_edit">✎</button>
      <button class="content__controls--delete">✖</button>
    </div>
    <div class="content_product__img">
      <img src="${src}" alt="${alt}" />
    </div>
    <div class="content_product__text">
      <p class="content_product__text--title">${title}</p>
      <p class="content_product__text--design">${design}</p>
      <p class="content_product__text--price">${price}</p>
    </div>
  </div>
`

const createMaterial = ({ img: { src, alt }, title, design }) => `
  <div class="content material" data-mos-contenttype="material">
    <div class="content__controls">
      <button class="content__controls--material_edit">✎</button>
      <button class="content__controls--delete">✖</button>
    </div>
    <div class="content_material__img">
      <img src="${src}" alt="${alt}" />
    </div>
    <div class="content_material__text">
      <p class="content_material__text--title">${title}</p>
      <p class="content_material__text--design">${design}</p>
    </div>
  </div>
`

const createColour = ({ hex }) => `
  <div class="content colour" data-mos-contenttype="colour">
    <div class="content__controls">
      <button class="content__controls--colour_edit">✎</button>
      <button class="content__controls--delete">✖</button>
    </div>
    <div class="colour__module" style="background-color: ${hex};"></div>
  </div>
`
const createFile = ({ format, name, image: { src } }) => {
  switch (format) {
    case 'pdf':
      return `
        <div class="content file format_pdf" data-mos-contenttype="file" style="background-image: url('${src}');">
          <div class="content__controls">
            <button class="content__controls--file_edit">✎</button>
            <button class="content__controls--delete">✖</button>
          </div>
          <div
            class="file__data" data-mos-format="${format}"
          />
          <div class="file__cover">
            <div class="file__cover__icon">📁</div>
            <div class="file__cover__title">
              <p>${name}</p>
            </div>
          </div>
        </div>
      `
    default:
      return `
        <div class="content file format_undefined" data-mos-contenttype="undef">
        </div>
      `
  }
}

function getContent (eachItem) {
  switch (eachItem._type) {
    case "text": return createText (eachItem)
    case "image": return createImage (eachItem)
    case "product": return createProduct (eachItem)
    case "material": return createMaterial (eachItem)
    case "colour": return createColour ({ hex: '#' + eachItem.hex })
    case "file": return createFile (eachItem)
    default: return `<div>${JSON.stringify(eachItem)}</div>`
  }
}

// ========== / Content Creators ==========



// ========== Content Functions ==========

function openNewItemMenu (event, elem, grid) {
  // NOTE: Revamp this asap.
  //  -Target widgets and grids => use as "select" implamentation
  // const { clientX, clientY, offsetX, offsetY, target } = event
  // const rect = target.getBoundingClientRect()
  // const newItemMenu = $('.new_item_menu--container')

  // if (event.target.classList.contains('grid-stack') && newItemMenu.data('mosEdit') !== 'active') {
  if (event.target.classList.contains('grid-stack')) {
    if (lastClick.widget) lastClick.widget.classList.remove('user_focus')
    lastClick.widget = null
    // const absoluteTop = offsetY + rect.top + window.scrollY
    // const absoluteLeft = offsetX + rect.left + window.scrollX
    // newItemMenu.css({
    //   display: 'flex',
    //   top: `${absoluteTop - (newItemMenu.height() + 15)}px`,
    //   left: `${absoluteLeft - (newItemMenu.width() / 2)}px`
    // })
    // lastClick.grid = grid,
    // lastClick.gridElem = elem
    // lastClick.x = offsetX + rect.left + window.scrollX
    // lastClick.y = offsetY + rect.top + window.scrollY
    // newItemMenu.data('mosEdit', 'active')
  } //else {
  //   newItemMenu.data('mosEdit', 'inactive')
  //   newItemMenu.css ({
  //     display: 'none',
  //     top: '20px',
  //     left: '20px'
  //   })
  // }
}

function toggleTitleEdit () {
  const title = this.closest('.page__title')
  console.log(title, title.dataset.mosEdit === "active")
  function outsideClick (e) {
    // console.log(e.target, !e.target.classList.contains('page__title__edit'))
    if (!e.target.classList.contains('page__title__edit')) {
      const titleEdit= title.querySelector('input')
      const titleDisplay = document.createElement('h3')
      titleDisplay.textContent = titleEdit.value
      title.removeChild(titleEdit)
      title.prepend(titleDisplay)
      title.dataset.mosEdit = "inactive"
      window.removeEventListener('click', outsideClick)
    }
  }

  if (title.dataset.mosEdit === "active") {
    const titleEdit= title.querySelector('input')
    const titleDisplay = document.createElement('h3')
    titleDisplay.textContent = titleEdit.value
    title.removeChild(titleEdit)
    title.appendChild(titleDisplay)
    title.dataset.mosEdit = "inactive"
    window.removeEventListener('click', outsideClick)
  } else {
    const titleDisplay = title.querySelector('h3')
    const titleEdit = document.createElement('input')
    titleEdit.value = titleDisplay.textContent
    titleEdit.type = "text"
    titleEdit.className = 'page__title__edit'
    title.removeChild(titleDisplay)
    title.prepend(titleEdit)
    titleEdit.focus()
    title.dataset.mosEdit = "active"
    setTimeout(() => {
      window.addEventListener('click', outsideClick)
    }, 1000)
  }
}

function toggleTitleDelete () {
  const deleteContainer = this.closest('.page__title__delete')
  const deleteButton = deleteContainer.querySelector('.page__title__delete--delete')
  if (deleteButton) {
    deleteContainer.removeChild(deleteButton)

    const message = document.createElement('p')
    message.className =  'page__title__delete--message'
    message.textContent = `Warning: Are you Sure you want to delete this page?`

    const confirm = document.createElement('button')
    confirm.textContent = 'Delete'
    confirm.className = 'page__title__delete--confirm'
    confirm.name = 'delete_page_confirm'
    confirm.onclick = removePage

    const cancel = document.createElement('button')
    cancel.textContent = 'Cancel'
    confirm.className = 'page__title__delete--cancel'
    confirm.name = 'delete_page_cancel'
    cancel.onclick = toggleTitleDelete

    deleteContainer.appendChild(message)
    deleteContainer.appendChild(confirm)
    deleteContainer.appendChild(cancel)
  } else {
    const deleteButton = document.createElement('button')
    deleteButton.innerHTML = `<i class="fas fa-times"></i>`
    deleteButton.className = 'page__title__delete--delete'
    deleteButton.name = 'delete_page_delete'
    deleteButton.onclick = toggleTitleDelete
    deleteContainer.innerHTML = ``
    deleteContainer.appendChild(deleteButton)
  }
}

function removePage (e) {
  const idx = Number(e.target.closest('.page').querySelector('.page__content').dataset.mosPageIdx)
  const serialised = serialise()
  const serialisedRemoved = [...serialised.slice(0, idx), ...serialised.slice(idx + 1)]
  data.projects = serialisedRemoved
  render(data)
}

function saveOneText (x, y, page, item, content, payload) {
  console.log({ x, y, page, item, content, payload })
  const { text } = payload
  data.projects[page].entities[item].text = text
  console.log(data.projects[page].entities[item].text)
}

function saveOne (gridStackItem, payload) {
  const content = gridStackItem.querySelector('.grid-stack-item-content')
  const { gsX: x, gsY: y } = gridStackItem.dataset
  const { mosPage: page, mosItem: item } = content.dataset
  const type = content.querySelector('.content').dataset.mosContenttype
  switch (type) {
    case "text":
      saveOneText(x, y, page, item, content, payload)
      break;
    default:
      console.error('ERROR ln 309: No Such data type', type)
      break;
  }
}

function toggleTextEdit () {
  const parent = this.closest('.grid-stack-item')
  console.log(parent.dataset)
  const content = parent.querySelector('.content')

  if (parent.dataset.mosEdit === 'active') {
    console.log('item active')

    if (parent.querySelector('.content_text__input')) {
      const textInput = content.querySelector('.content_text__input')
      const { value } = textInput
      saveOne(parent, { text: value })
      const textShow = document.createElement('p')
      textShow.className = 'content_text__text'
      textShow.textContent = value
      content.removeChild(textInput)
      content.appendChild(textShow)
    }

    parent.dataset.mosEdit = 'inactive'
  } else {
    console.log('item inactive')

    if (parent.querySelector('.content_text__text')) {
      const textShow = content.querySelector('.content_text__text')
      const { textContent } = textShow
      const textInput = document.createElement('textarea')
      textInput.className = 'content_text__input'
      textInput.value = textContent
      content.removeChild(textShow)
      content.appendChild(textInput)
    }

    parent.dataset.mosEdit = 'active'
  }
}

// function hideProductSearch () {
//   const productSearch = document.querySelector('.product_search')
//   productSearch.style.top = '0px'
//   productSearch.style.left = '0px'
//   productSearch.style.display = 'none'
// }
// function showProductSearch (event) {
//   const productSearch = document.querySelector('.product_search')
//   const searchBar = productSearch.querySelector('.product_search__input--bar')
//   productSearch.style.display = 'flex'
//
//   const { offsetX, offsetY, target } = event
//   const rect = target.getBoundingClientRect()
//
//   const absoluteTop = offsetY + rect.top + window.scrollY - (50)
//   const absoluteLeft = offsetX + rect.left + window.scrollX - (productSearch.offsetWidth / 2)
//
//   productSearch.style.top = `${absoluteTop}px`
//   productSearch.style.left = `${absoluteLeft}px`
//   searchBar.focus()
// }
// function toggleProductSearch (event) {
//   const productSearch = document.querySelector('.product_search')
//   if (productSearch.dataset.mosEdit === 'active') {
//     hideProductSearch()
//     productSearch.dataset.mosEdit = 'inactive'
//   } else {
//     showProductSearch(event)
//     productSearch.dataset.mosEdit = 'active'
//   }
// }
// function hideMaterialSearch () {
//   const materialSearch = document.querySelector('.material_search')
//   materialSearch.style.top = '0px'
//   materialSearch.style.left = '0px'
//   materialSearch.style.display = 'none'
// }
// function showMaterialSearch (event) {
//   const materialSearch = document.querySelector('.material_search')
//   const searchBar = materialSearch.querySelector('.material_search__input--bar')
//   materialSearch.style.display = 'flex'
//
//   const { offsetX, offsetY, target } = event
//   const rect = target.getBoundingClientRect()
//
//   const absoluteTop = offsetY + rect.top + window.scrollY - (50)
//   const absoluteLeft = offsetX + rect.left + window.scrollX - (materialSearch.offsetWidth / 2)
//
//   materialSearch.style.top = `${absoluteTop}px`
//   materialSearch.style.left = `${absoluteLeft}px`
//   searchBar.focus()
// }
// function toggleMaterialSearch (event) {
//   const materialSearch = document.querySelector('.material_search')
//   if (materialSearch.dataset.mosEdit === 'active') {
//     hideMaterialSearch()
//     materialSearch.dataset.mosEdit = 'inactive'
//   } else {
//     showMaterialSearch(event)
//     materialSearch.dataset.mosEdit = 'active'
//   }
// }
function toggleColourEdit (event) {
  const parent = this.closest('.grid-stack-item')
  const colourModule = parent.querySelector('.colour__module')
  if (parent.dataset.mosEdit === 'active') {
    hideColourPicker (colourPicker)
    parent.dataset.mosEdit = 'inactive'
  } else {
    const pickerElem = document.querySelector('.colour_picker')
    const { top, left } = this.getBoundingClientRect()
    const x = left + event.offsetX + window.scrollX - (pickerElem.scrollWidth / 2)
    const y = top + event.offsetY + window.scrollY - pickerElem.scrollHeight - 50
    const startingColour = colourModule.style.backgroundColor
    const accept = picker => {
      colourModule.style.backgroundColor = picker.color.rgbString
    }
    const decline = () => {}
    showColourPicker(x, y, colourPicker, startingColour, null, accept, decline)
    parent.dataset.mosEdit = 'active'
  }
}
// function toggleImageEdit (event) {
//   const parent = this.closest('.grid-stack-item')
//   const img = parent.querySelector('.content_image__img img')
//   if (parent.dataset.mosEdit === 'active') {
//     hideImageInterface ()
//     parent.dataset.mosEdit = 'inactive'
//   } else {
//     const interface = document.querySelector('.image_interface')
//     interface.style.display = `flex`
//     const { top, left } = this.getBoundingClientRect()
//
//     const x = left + event.offsetX + window.scrollX - (interface.clientWidth / 2)
//     const y = top + event.offsetY + window.scrollY - (interface.clientHeight + 50)
//     const uri = img.src
//     const accept = imageUpdate => {
//       img.src = imageUpdate
//     }
//     showImageInterface (x, y, uri, accept)
//     parent.dataset.mosEdit = 'active'
//     imageCurrentlyOpen = parent
//   }
// }

// ========== / Content Functions ==========



// ========== Interface Functions ==========

function newTextBox () {
  if (focusedPage.grid) {
    const { grid, gridElem, idx } = focusedPage
    const entityCount = $(gridElem).children().length
    const newTextWidget = $(`
      <div>
        <div class="grid-stack-item-content" data-mos-page="${idx}" data-mos-item="${entityCount + 1}">
          ${createText({ text: 'New Text Box' })}
        </div>
      </div>
    `)
    const createdTextWidget = grid.addWidget(newTextWidget, 1, 1, 3, 3, true)
    createdTextWidget.click(function () {
      if (lastClick.widget) lastClick.widget.classList.remove('user_focus')
      lastClick.widget = this
      lastClick.grid = grid
      lastClick.gridElem = gridElem
      this.classList.add('user_focus')
    })
    createdTextWidget.find('.content__controls--delete').click(function () {
      grid.removeWidget(this.closest('.grid-stack-item'))
    })
    createdTextWidget.find('.content__controls--text_edit').click(toggleTextEdit)
  }
}

function newImage (src, alt) {
  if (focusedPage.grid) {
    const { grid, gridElem, idx } = focusedPage
    const entityCount = $(gridElem).children().length
    const newColourWidget = $(`
      <div>
        <div class="grid-stack-item-content" data-mos-page="${idx}" data-mos-item="${entityCount + 1}">
          ${createImage({ src, alt })}
        </div>
      </div>
    `)
    const createdImageWidget = grid.addWidget(newColourWidget, 1, 1, 2, 4, true)
    createdImageWidget.click(function () {
      if (lastClick.widget) lastClick.widget.classList.remove('user_focus')
      lastClick.widget = this
      lastClick.grid = grid
      lastClick.gridElem = gridElem
      this.classList.add('user_focus')
    })
    createdImageWidget.find('.content__controls--delete').click(function () {
      grid.removeWidget(this.closest('.grid-stack-item'))
    })
    // createdTextWidget.find('.content__controls--image_edit').click(toggleImageEdit)
  }
}

function newColour (picker) {
  if (focusedPage.grid) {
    const { grid, gridElem, idx } = focusedPage
    const entityCount = $(gridElem).children().length
    const newColourWidget = $(`
      <div>
        <div class="grid-stack-item-content" data-mos-page="${idx}" data-mos-item="${entityCount + 1}">
          ${createColour({ hex: picker.color.hexString })}
        </div>
      </div>
    `)
    const createdColourWidget = grid.addWidget(newColourWidget, 1, 1, 1, 3, true)
    createdColourWidget.click(function () {
      if (lastClick.widget) lastClick.widget.classList.remove('user_focus')
      lastClick.widget = this
      lastClick.grid = grid
      lastClick.gridElem = gridElem
      this.classList.add('user_focus')
    })
    createdColourWidget.find('.content__controls--delete').click(function () {
      grid.removeWidget(this.closest('.grid-stack-item'))
    })
    // createdColourWidget.find('.content__controls--colour_edit').click(toggleColourEdit)
  }
}

// let imageCurrentlyOpen
//
// function showColourPicker (x, y, picker, startingColour, changeCb, acceptCb, declineCb) {
//   const colourPickerContainer = document.querySelector('.colour_picker')
//   const decline = colourPickerContainer.querySelector('.colour_cancel')
//   const accept = colourPickerContainer.querySelector('.colour_accept')
//   colourPickerContainer.style.display = 'block'
//   colourPickerContainer.style.top = `${y}px`
//   colourPickerContainer.style.left = `${x}px`
//   picker.color.rgbString = startingColour
//   picker.on('color:change', changeCb ? changeCb : () => {})
//
//   setTimeout(() => {
//     window.addEventListener('click', e => {
//       if (colourPickerContainer.contains(e.target)) return
//       else hideColourPicker(picker)
//     })
//   }, 500)
//
//   accept.onclick = () => {
//     if (acceptCb) acceptCb(picker)
//     hideColourPicker(picker)
//   }
//
//   decline.onclick = () => {
//     hideColourPicker(picker)
//     if (declineCb) declineCb(picker)
//   }
// }

// function hideColourPicker (picker) {
//   const colourPickerContainer = document.querySelector('.colour_picker')
//   colourPickerContainer.style.display = 'none'
//   colourPickerContainer.style.top = `0px`
//   colourPickerContainer.style.left = `0px`
//   if (picker) picker.on('color:change', () => {})
// }
//
// function showImageInterface (x, y, imageUri, acceptCb, declineCb) {
//   const imageInterfaceContainer = document.querySelector('.image_interface')
//   const url = document.querySelector('.image_url')
//   const accept = imageInterfaceContainer.querySelector('.image_accept')
//   const decline = imageInterfaceContainer.querySelector('.image_cancel')
//   let currentUri = imageUri || url.value || ""
//   imageInterfaceContainer.style.top = `${y}px`
//   imageInterfaceContainer.style.left = `${x}px`
//   url.onkeyup = e => currentUri = e.target.value
//
//   if (imageUri) url.value = imageUri
//
//   setTimeout(() => {
//     window.addEventListener('click', imageOOBListener)
//   }, 500)
//
//   function handleInput () {
//     if (acceptCb) acceptCb (currentUri)
//     hideImageInterface ()
//   }
//
//   accept.onclick = handleInput
//   accept.onpaste = handleInput
//   accept.oninput = handleInput
//
//   decline.onclick = () => {
//     if (declineCb) declineCb (currentUri)
//     hideImageInterface ()
//   }
// }
//
// function imageOOBListener (e) {
//   const imageInterfaceContainer = document.querySelector('.image_interface')
//   if (imageInterfaceContainer.contains(e.target)) return
//   else hideImageInterface ()
// }
//
// function hideImageInterface () {
//   const imageInterfaceContainer = document.querySelector('.image_interface')
//   const url = document.querySelector('.image_url')
//   imageInterfaceContainer.style.display = `none`
//   imageInterfaceContainer.style.top = `0px`
//   imageInterfaceContainer.style.left = `0px`
//   window.removeEventListener('click', imageOOBListener)
//   if (imageCurrentlyOpen) imageCurrentlyOpen.dataset.mosEdit = 'inactive'
//   // console.log('removed listener')
// }

// ========== / Interface Functions ==========



// ========== Event Binding ==========

window.addEventListener('DOMContentLoaded', initPage)
window.addEventListener('resize', debounce(() => userRender(), 250))
window.addEventListener('scroll', debounce(pageScrollHandler, 50))
window.addEventListener('keydown', handleGlobalKeyPress)

// ========== / Event Binding ==========



// ========== Standard Functions ==========

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};


function convertToHex (rgb) {
  var hexDigits = new Array
        ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");

  function rgb2hex(input) {
    rgb = input.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
  }

  function hex(x) {
    return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
  }

  return rgb2hex(rgb)
}

function randomHex () {
  const ran = colours[Math.floor(Math.random() * colours.length)]
  return convertToHex(`rgb(${ran.r}, ${ran.g}, ${ran.b})`)
}


// <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.5.0-beta4/html2canvas.min.js"></script>
// <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.5.0-beta4/html2canvas.svg.min.js"></script>
