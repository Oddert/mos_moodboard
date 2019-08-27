let userRender;

let rows = 20
console.log({ rows })

const data = {
  username: 'no user',
  projects: []
}


// ========== Top Level Functions ==========

function convertToHex (rgb) {
  var hexDigits = new Array
        ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");

//Function to convert rgb color to hex format
function rgb2hex(rgb) {
 rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
 return hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex(x) {
  return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
 }
 return rgb2hex(rgb)
}


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
    default:
      return {}
  }
}

function serialise () {
  const all = _.map($('.grid-stack > .grid-stack-item:visible'), function (el) {
    const elem = $(el)
    const node = elem.data('_gridstack_node')
    const elementData = extractElementData(node)
    console.log(node)
    console.log(elementData)
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
  return sanitised
}

// ========== / Top Level Functions ==========


// ========== Page initialisation ==========

function initPage () {

document.querySelector('button[name=dev]').onclick = () => userRender()


function initialAjax () {
  const url = `/api/projects/sample`
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

  function addPage (each, idx) {
    const page = `
      <div class="page">
        <div class="page__wrapper">
          <h3 class="page__title">Page Title Goes Here</h3>
          <div class="page__content grid-stack">

          </div>
        </div>
      </div>
    `
    pages.innerHTML += page
  }
  data.projects.forEach(addPage)
  userRender = () => createGridContent (pages, data)
  userRender()
}

function createGridContent (pages, data) {
  const all = pages.querySelectorAll('.page .page__content')
  const options = {
    width: 12,
    minWidth: 500,
    height: rows,
    float: true,

    // cellHeight: '50',
    // cellHeightUnit: 'px'
    // // removable: '.trash'
    // removeTimeout: 100,
    acceptWidgets: '.grid-stack-item'
  }

  all.forEach(each => {
    const thisPage = $(each)
    const height = thisPage.height()
    thisPage.gridstack({
      ...options,
      cellHeight: `${(height - ((rows - 1) * 20)) / rows}`
    })
    each.style.height = '250px'
  })

  $('.page .page__content')
    .each(function (pageIdx) {
      const elem = $(this)
      const grid = elem.data('gridstack')
      if (grid) grid.removeAll()
      // console.log({ idx }, grid);
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
        createdWidget.data('mospage', `${pageIdx}`)
        if (node._type === "text") {
          createdWidget.find('.content__controls--text_edit').click(toggleTextEdit)
        }
      }, this)
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

initialiseDisplayButtons ()
initialAjax ()
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
      <p>${title}</p>
      <p>${design}</p>
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

// ========== / Content Functions ==========



// ========== Event Binding ==========

window.addEventListener('DOMContentLoaded', initPage)
window.addEventListener('resize', debounce(() => userRender(), 250))

// ========== / Event Binding ==========



// ========== Ur tawdry debounce ==========

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
