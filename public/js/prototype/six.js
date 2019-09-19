const colours = [
  { r:53, g:152, b:219 }, { r:27, g:188, b:155 }, { r:154, g:89, b:181 }, { r:243, g:156, b:17 }, { r:232, g:76, b:61 },
  { r:126, g:140, b:141 }, { r:52, g:73, b:94 }, { r:241, g:196, b:15 }, { r:22, g:160, b:134 }, { r:210, g:84, b:0 }, { r:41, g:127, b:184 },
  { r:141, g:68, b:173 }, { r:193, g:57, b:43 }, { r:39, g:174, b:97 }
]

const defaultImg = {
  src: 'https://res.cloudinary.com/oddert/image/upload/v1558101908/MOS/tiles/placeholder_image-01.png',
  alt: 'Placeholder Image'
}

let userRender, colourPicker, globalHandleEditMenuChange;

let oddert

const lastClick = {
  grid: null,
  x: null,
  y: null,
  gridElem: null,
  widget: [],
  wasOnGrid: false,
  cutPasteData: {
    lastAction: null,
    attributes: [
      {
        _type: "",
        //, src, hex, url ...etc
      }
    ],
    previousPosition: [
      {
        //, x, y, width, height
      }
    ]
  }
}

// 'mon now everyone,
// lets all hold hands and summon the ghost of flux-like architecture
// chant with me now..
const editor = {
  editing: false,
  target: null,
  type: null,
  data: {
    text: 'lets test come sudo flux architecture',
    size: 'large'
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

const sanitiseSearchValue = value => value.replace(/\[|\]|\{|\}|\?|\&|http/gi, '')

function performLibSeach (extention, value, cb) {
  const url = `/api/${extention}/${value}`
  const opts = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }
  fetch(url, opts)
    .then(res => res.json())
    .then(res => {
      cb (res, value)
    })
}

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
        createdWidget.click(function (event) {
          if (lastClick.widget.length && !event.shiftKey) {
            lastClick.widget.forEach(each => each.classList.remove('user_focus'))
          }
          lastClick.widget.push(this)
          lastClick.grid = grid
          lastClick.gridElem = elem
          this.classList.add('user_focus')
        })
        // createdWidget.data('mospage', `${pageIdx}`)
        if (node._type === "text") {
          createdWidget.find('.content__controls--text_edit').click(toggleTextEdit)
          createdWidget.dblclick(openTextEditor)
        }
        if (node._type === "colour") {
          // createdWidget.find('.content__controls--colour_edit').click(toggleColourEdit)
        }
        if (node._type === "image") {
          // createdWidget.find('.content__controls--image_edit').click(toggleImageEdit)
        }
      }, this)
      // old lastClick detector:
      // elem.on('click', e => openNewItemMenu(e, elem, grid))
    })
  function initPageFocus () {
    const firstGrid = document.querySelectorAll('.page')[0]
    const gridData = $(firstGrid).data('_gridstack_node')
    focusedPage.grid = gridData
    focusedPage.gridElem = firstGrid
  }
  initPageFocus ()
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

function copy (cut = false) {
  if (lastClick.widget.length) {
    const attributes = []
    const previousPosition = []
    const { cutPasteData: { lastAction }, widget } = lastClick
    widget.forEach(each => {
      const { gsX: x, gsY: y, gsWidth: width, gsHeight: height } = each.dataset
      const { mosPageIdx: gridIdx } = each.closest('.page__content').dataset
      attributes.push(extractElementData($(each)))
      previousPosition.push({
        wasOnGrid: true,
        x, y, width, height, gridIdx
      })
    })
    lastClick.cutPasteData.attributes = attributes
    lastClick.cutPasteData.previousPosition = previousPosition
    lastClick.cutPasteData.lastAction = cut ? 'CUT' : 'COPY'
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
      copy (true)
    }
    if (event.key === 'v' && event.ctrlKey) {
      console.log('PASTE')
    }
  }
}

function openTextEditor (event) {
  const displayText = this.querySelector('.content_text__text')
  const text = displayText.textContent
  const size = displayText.className.match(/small|medium|large/gi)
  editor.editing = true
  editor.target = this
  editor.type = 'text'
  editor.data.text = text
  editor.data.size = size[0]
  document.querySelector('.edit_text__value textarea').value = text
  document.querySelectorAll('.edit_text__size button').forEach(each => {
    if (each.name === size[0]) each.classList.add('active')
    else each.classList.remove('active')
  })
  document.querySelector('.edit_text button[name=edit_text__save]').onclick = () => {
    displayText.classList.remove('small', 'medium', 'large')
    displayText.classList.add(editor.data.size)
    displayText.textContent = editor.data.text
  }
  document.querySelector('.edit_text button[name=edit_text__cancel]').onclick = () => {
    globalHandleEditMenuChange ('text', true)
  }
  globalHandleEditMenuChange ('text', false)
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

// // NOTE: For the sake of future itirations, material and product search, while using virtually
// //      the same code, are seperate functions and elements. They share a couple of functions but
// //      that's all for now.

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
  const editInterfaces = document.querySelectorAll('.item_edit__interface__variant')
  const types = ["text", "image", "product", "material", "colour", "file"]

  function swapActive (buttonContainers, type) {
    if (types.includes(type)) {
      editInterfaces.forEach(each => each.classList.remove('active'))
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
      localStorage.setItem('mos-menu-state', JSON.stringify({ lastActive: type }))
    } else {
      console.error(`Invalid type supplied to swapActive; cannot read type of: ${type}`)
    }
  }
  controlButtons.forEach(each => {
    each.querySelector('button').onclick = function () {
      swapActive(controlButtons, this.closest('.new_item_menu__item').dataset.mosType)
    }
  })
  const menuState = JSON.parse(localStorage.getItem('mos-menu-state'))
  console.log(menuState)
  if (menuState && menuState.lastActive && types.includes(menuState.lastActive)) {
    swapActive(controlButtons, menuState.lastActive)
  }
}

function handleEditMenuChange (type, close = false) {
  const controlButtons  = document.querySelectorAll('.item_menu__control .new_item_menu__item button')
  const inputInterfaces = document.querySelectorAll('.item_menu__interface__variant')
  const editInterfaces  = document.querySelectorAll('.item_edit__interface__variant')
  const types = ["text", "image", "product", "material", "colour", "file"]

  if (close) {
    editInterfaces.forEach(each => each.classList.remove('active'))
    const menuState = JSON.parse(localStorage.getItem('mos-menu-state'))
    if (menuState && menuState.lastActive && types.includes(menuState.lastActive)) {
      controlButtons.forEach(each => {
        if (each.closest('.new_item_menu__item').dataset.mosType === menuState.lastActive) each.classList.add('active')
      })
      inputInterfaces.forEach(each => {
        if (each.dataset.mosType === menuState.lastActive) each.classList.add('active')
      })
    } else {
      controlButtons[0].classList.add('active')
      inputInterfaces[0].classList.add('active')
    }
  } else {
    controlButtons.forEach(each => each.classList.remove('active'))
    inputInterfaces.forEach(each => {
      if (each.classList.contains('active')) localStorage.setItem('mos-menu-state', JSON.stringify({ lastActive: each.dataset.mosType }))
      each.classList.remove('active')
    })
    editInterfaces.forEach(each => {
      if (each.dataset.mosType === type) each.classList.add('active')
      else each.classList.remove('active')
    })
  }
}

globalHandleEditMenuChange = handleEditMenuChange

function initialiseEditMenu () {
  const closeButtons = document.querySelectorAll ('.edit_close')
  closeButtons.forEach(each => each.querySelector('button').onclick = () => {})
}

function initialiseItemMenuInterface () {
  const inputInterfaces = document.querySelectorAll('.item_menu__interface__variant')
  const newText         = document.querySelector('.item_menu__interface__variant.text')
  const newImage        = document.querySelector('.item_menu__interface__variant.image')
  const newProduct      = document.querySelector('.item_menu__interface__variant.product')
  const newMaterial     = document.querySelector('.item_menu__interface__variant.material')
  const newColour       = document.querySelector('.item_menu__interface__variant.colour')

  const editInterfaces = document.querySelectorAll('.item_edit__interface__variant')
  const editText         = document.querySelector('.item_edit__interface__variant.text')
  // const newImage        = document.querySelector('.item_menu__interface__variant.image')
  // const newProduct      = document.querySelector('.item_menu__interface__variant.product')
  // const newMaterial     = document.querySelector('.item_menu__interface__variant.material')
  // const newColour       = document.querySelector('.item_menu__interface__variant.colour')

  function initNewText (newText) {
    const add         = newText.querySelector('.new_text__insert button[name=new_text__insert]')
    const sizeButtons = newText.querySelectorAll('.new_text__size button')
    const textBox     = newText.querySelector('textarea')
    let value = ''
    let size = 'medium'
    function changeSize (e) {
      const { name } = e.target
      if (name === size) return
      else {
        newText.querySelector(`button[name=${size}]`).classList.remove('active')
        this.classList.add('active')
        size = name
      }
    }
    sizeButtons.forEach(each => each.onclick = changeSize)
    textBox.onchange = e => value = e.target.value
    add.onclick = () => {
      createTextWidget (value, size)
      textBox.value = ''
      value = ''
    }
  }

  function initNewImage (newImage) {
    const urlInput = newImage.querySelector('input[type=url]')
    const preview = newImage.querySelector('.image_interface__preview img')
    const add = newImage.querySelector('.new_image__insert button')
    function handleInput (e) {
      // WARNING: Need some sort of broken link detector, copy from Oddert/odd-blog blog engine later
      preview.src = e.target.value
    }
    urlInput.onmousedown = handleInput
    urlInput.onpaste = handleInput
    urlInput.oninput = handleInput
    add.onclick = e => createImageWidget(urlInput.value, '')
  }

  function initNewColour (newColour) {
    const add = newColour.querySelector('.new_colour__insert button')
    const preview = newColour.querySelector('.colour_picker__preview--wrapper')
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
    add.onclick = () => createColourWidget (colourPicker)
  }

  function initNewProduct (newProduct) {
    const createResultItem = ({ title, design, price, img }) => `
      <div class="result_product">
        <div class="result_product__img">
          <img src="${img ? img.src : ''}" alt="${img ? img.alt : ''}" />
        </div>
        <div class="result_product__text">
          <p class="result_product__text--title">${title}</p>
          <p class="result_product__text--design">${design}</p>
          <p class="result_product__text--price">${price}</p>
        </div>
      </div>
    `

    const searchBar = newProduct.querySelector('.product_search__input--bar')
    const resultsContainer = newProduct.querySelector('.product_search__results ul')
    const clearButton = newProduct.querySelector('.product_search__input--clear')
    const acceptButton = newProduct.querySelector('button[name=new_product__insert]')

    let lastSearchTerm
    const selected = {
      target: null,
      data: null
    }

    function clearSelect (prev) {
      if (prev) prev.classList.remove('user_focus')
      selected.target = null
      selected.data = null
    }

    function select (e, item) {
      const thisItem = e.target.closest('.result_product')
      function newTarget (prev) {
        if (prev) pre.classList.remove('user_focus')
        thisItem.classList.add('user_focus')
        selected.target = thisItem
        selected.data = item
      }
      if (selected.target && selected.target.classList) {
        if (selected.target === thisItem) {
          clearSelect (thisItem.classList.remove('user_focus'))
        } else newTarget (selected.target.classList.remove('user_focus'))
      } else newTarget ()
    }

    function renderSearchResults (res, value) {
      if (res.length) {
        const previousResults = resultsContainer.querySelectorAll('.result_product')
        previousResults.forEach((each, idx) => {
          each.removeEventListener('click', e => select(e, res[idx]))
          each.remove()
        })
        resultsContainer.innerHTML = ``
        res.forEach(each => {
          if (each) resultsContainer.innerHTML += createResultItem(each)
        })
        const allResults = resultsContainer.querySelectorAll('.result_product')
        allResults.forEach((each, idx) => {
          each.addEventListener('click', e => select(e, res[idx]))
        })
      } else resultsContainer.innerHTML = `
          <div class="result_none">
            <p>Sorry, no results for '${value}'</p>
          </div>
        `
    }

    function clearResults () {
      clearSelect (selected.target ? selected.target : null)
      searchBar.value = ''
      resultsContainer.innerHTML = ''
      searchBar.focus()
    }

    function productSearch (e) {
      const value = sanitiseSearchValue(e.target.value)
      if (value === lastSearchTerm) return
      if (!/\w/gi.test(value)) return clearResults()
      if (value.length < 3) return
      lastSearchTerm = value
      performLibSeach ('product', value, renderSearchResults)
    }

    function accept () {
      if (selected.data) createProductWidget (selected.data)
    }

    acceptButton.onclick = accept
    clearButton.onclick = clearResults
    searchBar.addEventListener('keyup', productSearch)
  }

  function initNewMaterial (newMaterial) {
    const createResultItem = ({ title, design, img }) => `
      <div class="result_product">
        <div class="result_product__img">
          <img src="${img ? img.src : ''}" alt="${img ? img.alt : ''}" />
        </div>
        <div class="result_product__text">
          <p class="result_product__text--title">${title}</p>
          <p class="result_product__text--design">${design}</p>
        </div>
      </div>
    `

    const searchBar = newMaterial.querySelector('.product_search__input--bar')
    const resultsContainer = newMaterial.querySelector('.product_search__results ul')
    const clearButton = newMaterial.querySelector('.product_search__input--clear')
    const acceptButton = newMaterial.querySelector('button[name=new_material__insert]')

    let lastSearchTerm
    const selected = {
      target: null,
      data: null
    }

    function clearSelect (prev) {
      if (prev) prev.classList.remove('user_focus')
      selected.target = null
      selected.data = null
    }

    function select (e, item) {
      const thisItem = e.target.closest('.result_product')
      function newTarget (prev) {
        if (prev) pre.classList.remove('user_focus')
        thisItem.classList.add('user_focus')
        selected.target = thisItem
        selected.data = item
      }
      if (selected.target && selected.target.classList) {
        if (selected.target === thisItem) {
          clearSelect (thisItem.classList.remove('user_focus'))
        } else newTarget (selected.target.classList.remove('user_focus'))
      } else newTarget ()
    }

    function renderSearchResults (res, value) {
      if (res.length) {
        const previousResults = resultsContainer.querySelectorAll('.result_product')
        previousResults.forEach((each, idx) => {
          each.removeEventListener('click', e => select(e, res[idx]))
          each.remove()
        })
        resultsContainer.innerHTML = ``
        res.forEach(each => {
          if (each) resultsContainer.innerHTML += createResultItem(each)
        })
        const allResults = resultsContainer.querySelectorAll('.result_product')
        allResults.forEach((each, idx) => {
          each.addEventListener('click', e => select(e, res[idx]))
        })
      } else resultsContainer.innerHTML = `
          <div class="result_none">
            <p>Sorry, no results for '${value}'</p>
          </div>
        `
    }

    function clearResults () {
      clearSelect (selected.target ? selected.target : null)
      searchBar.value = ''
      resultsContainer.innerHTML = ''
      searchBar.focus()
    }

    function productSearch (e) {
      const value = sanitiseSearchValue(e.target.value)
      if (value === lastSearchTerm) return
      if (!/\w/gi.test(value)) return clearResults()
      if (value.length < 3) return
      lastSearchTerm = value
      performLibSeach ('material', value, renderSearchResults)
    }

    function accept () {
      if (selected.data) createMaterialWidget (selected.data)
    }

    acceptButton.onclick = accept
    clearButton.onclick = clearResults
    searchBar.addEventListener('keyup', productSearch)
  }

  // ===========================================

  function initEditText (editText) {
    const save        = editText.querySelector('.edit_text button[name=edit_text__save]')
    const cancel      = editText.querySelector('.edit_text button[name=edit_text__cancel]')
    const sizeButtons = editText.querySelectorAll('.edit_text__size button')
    const textBox     = editText.querySelector('textarea')
    const sizes = ["small", "medium", "large"]
    function changeSize (e) {
      const { name } = e.target
      console.log(editor.data.size, name)
      if (editor.data.size && name === editor.data.size) return
      else {
        sizeButtons.forEach(each => each.classList.remove('active'))
        this.classList.add('active')
        editor.data.size = name
      }
    }
    sizeButtons.forEach(each => each.onclick = changeSize)
    textBox.onchange = e => editor.data.text = e.target.value
    save.onclick = () => {
      console.warn('save function not supplied')
    }
    cancel.onclick = () => {
      console.warn('cancel action not supplied')
    }
  }

  initNewText(newText)
  initNewImage(newImage)
  initNewColour(newColour)
  initNewProduct(newProduct)
  initNewMaterial(newMaterial)

  initEditText(editText)
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
initialiseItemMenuControl()
initialiseItemMenuInterface()
initDragDrop()
}

// ========== / Page initialisation ==========



// ========== Content Creators ==========

const createText = ({ text, size }) => `
  <div class="content text" data-mos-contenttype="text">
    <div class="content__controls">
      <button class="content__controls--text_edit">✎</button>
      <button class="content__controls--delete">✖</button>
    </div>
    <p class="content_text__text ${size ? size : 'medium'}">${text}</p>
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

function deselectOnGrid (event) {
  if (!!event.target.closest('.grid-stack-item')) return
  else {
    if (lastClick.widget.length) lastClick.widget.forEach(each => each.classList.remove('user_focus'))
    lastClick.widget = []
    if (editor.unsavedChanges) globalHandleEditMenuChange (null, true)
  }
}

function openNewItemMenu (event, elem, grid) {
  // if (event.target.classList.contains('grid-stack') && newItemMenu.data('mosEdit') !== 'active') {
  if (event.target.classList.contains('grid-stack')) {
    if (lastClick.widget) lastClick.widget.forEach(each => each.classList.remove('user_focus'))
    lastClick.widget = []
  }
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

// ========== / Content Functions ==========



// ========== Interface Functions ==========

function createTextWidget (value, size) {
  if (focusedPage.grid) {
    const { grid, gridElem, idx } = focusedPage
    const entityCount = $(gridElem).children().length
    const newTextWidget = $(`
      <div>
        <div class="grid-stack-item-content" data-mos-page="${idx}" data-mos-item="${entityCount + 1}">
          ${createText({ text: /\w/gi.test(value) ? value : 'New Text Box', size })}
        </div>
      </div>
    `)
    const createdTextWidget = grid.addWidget(newTextWidget, 1, 1, 3, 3, true)
    createdTextWidget.click(function (event) {
      if (lastClick.widget.length && !event.shiftKey) {
        lastClick.widget.forEach(each => each.classList.remove('user_focus'))
      }
      lastClick.widget.push(this)
      lastClick.grid = grid
      lastClick.gridElem = gridElem
      this.classList.add('user_focus')
    })
    createdTextWidget.dblclick(openTextEditor)
    createdTextWidget.find('.content__controls--delete').click(function () {
      grid.removeWidget(this.closest('.grid-stack-item'))
    })
    createdTextWidget.find('.content__controls--text_edit').click(toggleTextEdit)
  }
}

function createImageWidget (src, alt) {
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
    createdImageWidget.click(function (event) {
      if (lastClick.widget.length && !event.shiftKey) {
        lastClick.widget.forEach(each => each.classList.remove('user_focus'))
      }
      lastClick.widget.push(this)
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

function createColourWidget (picker) {
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
    createdColourWidget.click(function (event) {
      if (lastClick.widget.length && !event.shiftKey) {
        lastClick.widget.forEach(each => each.classList.remove('user_focus'))
      }
      lastClick.widget.push(this)
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

function createProductWidget (product) {
  if (focusedPage.grid) {
    const { grid, gridElem, idx } = focusedPage
    const entityCount = $(gridElem).children().length
    const newProductWidget = $(`
        <div>
          <div class="grid-stack-item-content" data-mos-page="${idx}" data-mos-item="${entityCount + 1}">
            ${createProduct(product)}
          </div>
        </div>
      `)
      const createdProductWidget = grid.addWidget(newProductWidget, null, null, 2, 7, true)
      createdProductWidget.click(function (event) {
        if (lastClick.widget.length && !event.shiftKey) {
          lastClick.widget.forEach(each => each.classList.remove('user_focus'))
        }
        lastClick.widget.push(this)
        lastClick.grid = grid
        lastClick.gridElem = gridElem
        this.classList.add('user_focus')
      })
      createdProductWidget.find('.content__controls--delete').click(function () {
        grid.removeWidget(this.closest('.grid-stack-item'))
      })
  }
}

function createMaterialWidget (product) {
  if (focusedPage.grid) {
    const { grid, gridElem, idx } = focusedPage
    const entityCount = $(gridElem).children().length
    const newMaterialWidget = $(`
        <div>
          <div class="grid-stack-item-content" data-mos-page="${idx}" data-mos-item="${entityCount + 1}">
            ${createMaterial(product)}
          </div>
        </div>
      `)
      const createdMaterialWidget = grid.addWidget(newMaterialWidget, null, null, 2, 7, true)
      createdMaterialWidget.click(function (event) {
        if (lastClick.widget.length && !event.shiftKey) {
          lastClick.widget.forEach(each => each.classList.remove('user_focus'))
        }
        lastClick.widget.push(this)
        lastClick.grid = grid
        lastClick.gridElem = gridElem
        this.classList.add('user_focus')
      })
      createdMaterialWidget.find('.content__controls--delete').click(function () {
        grid.removeWidget(this.closest('.grid-stack-item'))
      })
  }
}

// ========== / Interface Functions ==========



// ========== Event Binding ==========

window.addEventListener('DOMContentLoaded', initPage)
window.addEventListener('resize', debounce(() => userRender(), 250))
window.addEventListener('scroll', debounce(pageScrollHandler, 50))
document.querySelector('.pages').addEventListener('keydown', handleGlobalKeyPress)
document.querySelector('.pages').addEventListener('click', deselectOnGrid)

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
