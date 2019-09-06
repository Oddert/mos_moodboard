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
  y: null
}

let rows = 20
console.log({ rows })

const data = {
  username: 'no user',
  projects: []
}


// ========== Top Level Functions ==========

function extractElementData (node) {
  const content = node.el.find('.content')
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

function newSerialise () {
  const output = []
  $('.page').each(function (idx, grid) {
    const pageItems = []
    console.log({ items: $(grid).find('.grid-stack-item:visible') })
    const items = $(grid).find('.grid-stack-item:visible')
      .map((idx, each) => {
        const node = $(each).data('_gridstack_node')
        console.log({ each: $(each), data: $(each).data(), node })
        const nodeData = extractElementData(node)
        pageItems.push ({
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
          page: node._grid._stylesId,
          ...nodeData
        })
      })
      output.push(pageItems)
  })
  console.log(output)
}

function serialise () {
  // BUG: If there are no widgets the serialise function cannot run
  // BUG: Adding page seems to unbind event listeners for new item input
  const all = _.map($('.grid-stack > .grid-stack-item:visible'), function (el) {
    const elem = $(el)
    const node = elem.data('_gridstack_node')
    const elementData = extractElementData(node)
    // console.log(node)
    // console.log(elementData)
    return {
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      page: node._grid._stylesId,
      ...elementData
    }
  }, this)

  const keys = Object.keys(all.reduce((acc, each) => {
    if (!acc[each.page]) acc[each.page] = true
    return acc
  }, {}))

  const out = []
  keys.forEach((key, idx) => {
    out[idx] = all.filter(each => each.page === key)
  })
  const sanitised = out.map((page, idx) => page.map(cell => ({ ...cell, page: idx })))
  const titles = document.querySelectorAll('.page__title h3')
  const formated = sanitised.map((entities, idx) => {
    return {
      title: titles[idx].textContent,
      entities
    }
  })
  return formated
}

function save () {
  const url = `/api/projects/test`
  const opts = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      payload: serialise()
    })
  }
  fetch(url, opts)
    .then(res => res.json())
    .then(res => console.log({ res }))
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

function render (data) {
  const pages = document.querySelector('.pages')
  pages.innerHTML = ""

  function addPage (each, idx) {
    const page = `
      <div class="page">
        <div class="page__wrapper">
          <div class="page__title">
            <h3 title="double click to edit title">${each.title ? each.title : '  '}</h3>
          </div>
          <div class="page__content grid-stack">

          </div>
        </div>
      </div>
    `
    pages.innerHTML += page
  }
  data.projects.forEach(addPage)
  $('.page').each(function () {
    $(this).find('.page__title h3').dblclick(toggleTitleEdit)
  })

  userRender = () => createGridContent (pages, data)
  userRender()
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

function addOnePageContent (page) {
  //.page__content as document.querySelector()
  const thisPage = $(page)
  const height = thisPage.height()
  thisPage.gridstack({
    ...gridstackOptions,
    cellHeight: `${(height - ((rows - 1) * 20)) / rows}`
  })
  page.style.height = '250px'
  page.dataset.mosTest = '250'
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
        // createdWidget.data('mospage', `${pageIdx}`)
        if (node._type === "text") {
          createdWidget.find('.content__controls--text_edit').click(toggleTextEdit)
        }
        if (node._type === "colour") {
          createdWidget.find('.content__controls--colour_edit').click(toggleColourEdit)
        }
        if (node._type === "image") {
          createdWidget.find('.content__controls--image_edit').click(toggleImageEdit)
        }
      }, this)
      elem.on('mousedown', function (event) {
        const { clientX, clientY, offsetX, offsetY, target } = event
        const rect = target.getBoundingClientRect()
        const newItemMenu = $('.new_item_menu--container')
        if (event.target.classList.contains('grid-stack')) {
          const absoluteTop = offsetY + rect.top + window.scrollY
          const absoluteLeft = offsetX + rect.left + window.scrollX
          newItemMenu.css({
            display: 'flex',
            top: `${absoluteTop - (newItemMenu.height() + 15)}px`,
            left: `${absoluteLeft - (newItemMenu.width() / 2)}px`
          })
          // newItemMenu.addEventListener('click', function (e) {
          //   console.log(this === e.target)
          // })
          lastClick.grid = grid,
          lastClick.gridElem = elem
          lastClick.x = offsetX + rect.left + window.scrollX
          lastClick.y = offsetY + rect.top + window.scrollY
        } else {
          newItemMenu.css({
            display: 'none',
            top: '20px',
            left: '20px'
          })
        }
      })
    })
}


function changeDisplayMode (e) {
  const displayButtons = document.querySelectorAll('.control_display button')
  const pages = document.querySelector('.pages')
  const { name } = e.target
  displayButtons.forEach(each => each.classList.remove('active'))
  switch (name) {
    case "slides":
      document.querySelector('.control_display button[name=slides]').classList.add('active')
      pages.classList.add('horizontal')
      pages.classList.remove('full_screen')
      break;
    case "scroll":
      document.querySelector('.control_display button[name=scroll]').classList.add('active')
      pages.classList.remove('horizontal')
      pages.classList.remove('full_screen')
      break;
    case "fullscreen":
      document.querySelector('.control_display button[name=fullscreen]').classList.add('active')
      pages.classList.add('horizontal')
      pages.classList.add('full_screen')
      break;
    default: break;
  }
}

function initialiseDisplayButtons () {
  const displayButtons = document.querySelectorAll('.control_display button')
  displayButtons.forEach(each =>
    each.onclick = changeDisplayMode
  )
}

function initialiseNewItemMenu () {
  const text = document.querySelector('.new_item_menu__item.text')
  const colour = document.querySelector('.new_item_menu__item.colour')
  const image = document.querySelector('.new_item_menu__item.image')
  const menu = document.querySelector('.new_item_menu--container')
  function addUserWidget (content, width = 1, height = 2) {
    menu.style.display = 'none'
    const { grid, gridElem, x, y } = lastClick
    const gridPos = grid.getCellFromPixel({ top: y, left: x }, true)
    const newWidget = $(`
      <div>
        <div
          class="grid-stack-item-content"
          data-mos-page="${gridElem.data('mosPageIdx')}"
          data-mos-item="${gridElem.children().length + 1}"
        >
          ${content}
        </div>
      </div>
    `)
    // I appologise profusely.
    let adjustedX = gridPos.x
    let adjustedY = gridPos.y
    if (gridPos.x < 2) adjustedX = 0
    if (gridPos.x > 10) adjustedX = 12 - width
    if (gridPos.y < 2) adjustedY = 0
    if (gridPos.y > 18) adjustedY = 20 - height
    if (adjustedY > 1 && adjustedY < 18) adjustedY -= 1

    const createdWidget = grid.addWidget(newWidget, adjustedX, adjustedY, width, height)
    createdWidget.find('.content__controls--delete').click(function () {
      grid.removeWidget(this.closest('.grid-stack-item'))
    })
    return createdWidget
  }
  text.onclick = e => {
    const createdWidget = addUserWidget(createText({ text: 'New Text Box' }), 2, 3)
    createdWidget.find('.content__controls--text_edit').click(toggleTextEdit)
  }
  colour.onclick = e => {
    const createdWidget = addUserWidget(createColour({ hex: randomHex() }), 1, 2)
    createdWidget.find('.content__controls--colour_edit').click(toggleColourEdit)
  }
  image.onclick = e => {
    const createdWidget = addUserWidget(createImage(defaultImg), 2, 4)
    createdWidget.find('.content__controls--image_edit').click(toggleImageEdit)
  }
}

function initColourPicker () {
  const preview = document.querySelector('.colour_picker__preview--wrapper')
  const previewInput = preview.querySelector('.colour_picker__preview__input')
  const opts = {
    width: 250,
    color: '#1bbc9b'
  }
  colourPicker = new iro.ColorPicker('.colour_picker__iro', opts)
  function handleColourChange (colour, change) {
    preview.style.backgroundColor = colour.rgbString
    previewInput.value = colour.hexString.toUpperCase()
  }
  colourPicker.on('color:change', handleColourChange)
  previewInput.onchange = e => {
    const { value } = e.target
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/gi.test(value)) {
      colourPicker.color.hexString = value
    }
    if (/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/gi.test(value)) {
      colourPicker.color.hexString = '#' + value
    }
  }
}

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

document.addEventListener('click', e => {
  const menu = document.querySelector('.new_item_menu--container')
  let hide = true
  document.querySelectorAll('.page__content').forEach(each => {
    if (each.contains(e.target)) hide = false
  })
  if (hide) {
    menu.style.display = 'none'
    menu.style.top = '20px'
    menu.style.left = '20px'
  }
})

initColourPicker()
initialiseNewItemMenu ()
initialiseDisplayButtons ()
initialAjax ()
initialisePageAdd()
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
    <div class="colour__module" style="background-color: #${hex};"></div>
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
    case "colour": return createColour (eachItem)
    case "file": return createFile (eachItem)
    default: return `<div>${JSON.stringify(eachItem)}</div>`
  }
}

// ========== / Content Creators ==========



// ========== Content Functions ==========

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
      title.appendChild(titleDisplay)
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
    title.appendChild(titleEdit)
    title.dataset.mosEdit = "active"
    setTimeout(() => {
      window.addEventListener('click', outsideClick)
    }, 1000)
  }
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

// We are free from jquery somehow woooo
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

function toggleImageEdit (event) {
  const parent = this.closest('.grid-stack-item')
  const img = parent.querySelector('.content_image__img img')
  if (parent.dataset.mosEdit === 'active') {
    hideImageInterface ()
    parent.dataset.mosEdit = 'inactive'
  } else {
    const interface = document.querySelector('.image_interface')
    const { top, left } = this.getBoundingClientRect()
    const x = left + event.offsetX + window.scrollX - (interface.scrollWidth / 2)
    const y = top + event.offsetY + window.scrollY - interface.scrollHeight - 50
    const uri = img.src
    const accept = imageUpdate => {
      img.src = imageUpdate
    }
    showImageInterface (x, y, uri, accept)
    parent.dataset.mosEdit = 'active'
    imageCurrentlyOpen = parent
  }
}

// ========== / Content Functions ==========


// ========== Interface Functions ==========
let imageCurrentlyOpen

function showColourPicker (x, y, picker, startingColour, changeCb, acceptCb, declineCb) {
  // console.log({ x, y, picker, startingColour, changeCb, acceptCb, declineCb })
  const colourPickerContainer = document.querySelector('.colour_picker')
  const decline = colourPickerContainer.querySelector('.colour_cancel')
  const accept = colourPickerContainer.querySelector('.colour_accept')
  colourPickerContainer.style.display = 'block'
  colourPickerContainer.style.top = `${y}px`
  colourPickerContainer.style.left = `${x}px`
  picker.color.rgbString = startingColour
  picker.on('color:change', changeCb ? changeCb : () => {})

  setTimeout(() => {
    window.addEventListener('click', e => {
      if (colourPickerContainer.contains(e.target)) return
      else hideColourPicker(picker)
    })
  }, 500)

  accept.onclick = () => {
    if (acceptCb) acceptCb(picker)
    hideColourPicker(picker)
  }

  decline.onclick = () => {
    hideColourPicker(picker)
    if (declineCb) declineCb(picker)
  }
}

function hideColourPicker (picker) {
  const colourPickerContainer = document.querySelector('.colour_picker')
  colourPickerContainer.style.display = 'none'
  colourPickerContainer.style.top = `0px`
  colourPickerContainer.style.left = `0px`
  if (picker) picker.on('color:change', () => {})
}


function showImageInterface (x, y, imageUri, acceptCb, declineCb) {
  const imageInterfaceContainer = document.querySelector('.image_interface')
  const url = document.querySelector('.image_url')
  const accept = imageInterfaceContainer.querySelector('.image_accept')
  const decline = imageInterfaceContainer.querySelector('.image_cancel')
  let currentUri = imageUri || url.value || ""
  imageInterfaceContainer.style.display = `flex`
  imageInterfaceContainer.style.top = `${y}px`
  imageInterfaceContainer.style.left = `${x}px`
  url.onkeyup = e => currentUri = e.target.value

  if (imageUri) url.value = imageUri

  setTimeout(() => {
    window.addEventListener('click', imageOOBListener)
  }, 500)

  function handleInput () {
    if (acceptCb) acceptCb (currentUri)
    hideImageInterface ()
  }

  accept.onclick = handleInput
  accept.onpaste = handleInput
  accept.oninput = handleInput

  decline.onclick = () => {
    if (declineCb) declineCb (currentUri)
    hideImageInterface ()
  }
}

function imageOOBListener (e) {
  const imageInterfaceContainer = document.querySelector('.image_interface')
  if (imageInterfaceContainer.contains(e.target)) return
  else hideImageInterface ()
}

function hideImageInterface () {
  const imageInterfaceContainer = document.querySelector('.image_interface')
  const url = document.querySelector('.image_url')
  imageInterfaceContainer.style.display = `none`
  imageInterfaceContainer.style.top = `0px`
  imageInterfaceContainer.style.left = `0px`
  window.removeEventListener('click', imageOOBListener)
  if (imageCurrentlyOpen) imageCurrentlyOpen.dataset.mosEdit = 'inactive'
  // console.log('removed listener')
}

// ========== / Interface Functions ==========



// ========== Event Binding ==========

window.addEventListener('DOMContentLoaded', initPage)
window.addEventListener('resize', debounce(() => userRender(), 250))

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
