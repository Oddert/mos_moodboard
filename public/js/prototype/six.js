// ========== Resources ==========

const colours = [
  { r:53, g:152, b:219 }, { r:27, g:188, b:155 }, { r:154, g:89, b:181 }, { r:243, g:156, b:17 }, { r:232, g:76, b:61 },
  { r:126, g:140, b:141 }, { r:52, g:73, b:94 }, { r:241, g:196, b:15 }, { r:22, g:160, b:134 }, { r:210, g:84, b:0 }, { r:41, g:127, b:184 },
  { r:141, g:68, b:173 }, { r:193, g:57, b:43 }, { r:39, g:174, b:97 }
]

const simpleColours = [
  { r:53, g:152, b:219 }, { r:27, g:188, b:155 }, { r:154, g:89, b:181 }, { r:232, g:76, b:61 },
  { r:126, g:140, b:141 }, { r:52, g:73, b:94 }, { r:241, g:196, b:15 }
]

const defaultImg = {
  src: 'https://res.cloudinary.com/oddert/image/upload/v1558101908/MOS/tiles/placeholder_image-01.png',
  alt: 'Placeholder Image'
}

// ========== / Resources ==========



// ========== Constants / Global Vars ==========

let userRender, colourPicker, editColourPicker, globalHandleEditMenuChange;

let oddert

let settingRerenderOnSideMenu = false

let renderComplete = false

const localStoreAutosave = "mos-moodboard-autosave"

const localStoreMenuState = "mos-menu-state"

const fullscreen = {
  open: false
}

const autosave = {
  lastLocalSave: null,
  lastAction: null,
  stepSelected: 0
}

const lastClick = {
  context: null,
  grid: null,
  x: null,
  y: null,
  gridElem: null,
  slide: null,
  widget: [],
  slide: [],
  wasOnGrid: false,
  cutPasteData: {
    lastAction: null,
    slideAttrubutes: [],
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

const gridstackOptions = {
  // width: 12,
  width: 13,
  minWidth: 500,
  height: rows,
  float: true,
  animate: true,
  removable: false,
  disableOneColumnMode: true,

  // cellHeight: '50',
  // cellHeightUnit: 'px'
  // // removable: '.trash'
  // removeTimeout: 100,
  acceptWidgets: '.grid-stack-item'
}

const s = term => document.querySelector(term)
const sa = term => document.querySelectorAll(term)

// ========== Constants / Global Vars ==========



// NOTE: Syntax used states "page" refers to DOM elements and gridstack data of interactable pages
// while "slide" refers to side bar menu and associated data structure

// ### Structure:
//  -Raw data utilities
//  -Constants and Global vars
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
      text: content.find('.content_text__text')
        ? content.find('.content_text__text').text()
        : content.find('.content_text__input').val(),
      size: content.data('mosText_size')
    }
    case "image":
    return {
      _type: "image",
      src: content.find('img').attr('src') || "",
      alt: content.find('img').attr('alt') || "",
      crop: {
        top: content.find('.content_image__img__resize').css('top') || '0',
        left: content.find('.content_image__img__resize').css('left') || '0',
        width: content.find('.content_image__img__resize').css('width') || '100%',
        height: content.find('.content_image__img__resize').css('height') || '100%'
      }
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
      img: {
        src: content.css('background-image').replace('url("', '').replace('")', '')
      }
    }
    case "product":
    return {
      _type: "product",
      product_id: `${content.data('mosProduct_id')}`,
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
      material_id: `${content.data('mosMaterial_id')}`,
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
  // console.log(node)
  const { el } = node
  return extractElementData (el)
}

function createSerialisedWidget (each) {
  const node = $(each).data('_gridstack_node')
  const nodeData = extractElementDataGridstack(node)
  return {
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    page: node._grid._stylesId,
    ...nodeData
  }
}

function serialise (source) {
  console.log(`[${source || 'unknowen'}]: serialising...`)
  const output = []
  $('.page').each(function (idx, grid) {
    const title = $(grid).find('.page__title h3').text().trim()
    const entities = []
    const items = $(grid).find('.grid-stack-item:visible')
      .map((idx, each) => {
        // BUG: If serialise runs while item is being moved between grids,
        // data strucutre is diffirent,
        // causes extractElementDataGridstack to not be able to read 'el'
        // console.log(each)
        entities.push (createSerialisedWidget(each))
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
      payload: serialise('save')
    })
  }
  fetch(url, opts)
    .then(res => res.json())
    .then(res => console.log({ res }))
}

function handleAutosave (delay) {
  if (!renderComplete) return //console.log('blocking autosave; render in progress')
  function performAutoSave () {
    // console.log('autosave')
    const currentTime = new Date().getTime() - 2000
    if (autosave.lastAction < currentTime) {
      // console.log('...passed debounce')
      const serialised = serialise ('handleAutosave')
      let saveData = JSON.parse(localStorage.getItem(localStoreAutosave))

      // console.log({ saveData })
      if (!(saveData && saveData.steps)) saveData = { steps: [] }
      console.log(autosave.stepSelected)
      if (autosave.stepSelected) {
        const cut = saveData.steps.length - autosave.stepSelected
        console.log(saveData.steps, `slicing at: 0, ${cut}`)
        saveData.steps = saveData.steps.slice(0, cut)
        console.log(saveData.steps)
        autosave.stepSelected = 0
      } else if (saveData.steps.length >= 10) {
        saveData.steps.shift()
      }
      saveData.steps.push(serialised)
      saveData.lastUpdate = currentTime
      // console.log({ saveData })

      localStorage.setItem(localStoreAutosave, JSON.stringify(saveData))
      autosave.lastAction = currentTime
      console.log('autosave complete')
    }// else console.log('debounced.')
  }
  if (delay) setTimeout (performAutoSave, 500)
  else performAutoSave ()
}

// ========== / Serialise Functions ==========



// ========== Top Level Functions ==========

function updateSlideBar (event, idx, updateContext) {
  const allSlides = document.querySelectorAll('.slide')
  // TODO: make "check if in view" detection for slides later
  allSlides.forEach((each, i) => {
    if (i === idx) {
      // TODO: Multiple select
      // if (lastClick.slide.length && !event.shiftKey) {
      //   lastClick.slide.forEach(each => each.classList.remove('selected'))
      //   lastClick.slide = []
      // }
      // if (lastClick.slide[0] === each) {
      //   return
      // }
      // lastClick.slide.push(each)
      if (updateContext) {
        lastClick.slide = [each]
        lastClick.context = 'SLIDE'
      }
      const parent = each.closest('.slides--wrapper')
      const rect = each.getBoundingClientRect()
      // IDEA: This inbuilt function is a bit janky but it's good that its native
      // considder carrying on with original method:
      const scrollOpts = {
        // block: "end",
        // inline: "nearest",
        // behavior: "smooth"
      }
      if (rect.top < (0 - rect.height)) {
        // console.log(parent.scrollTop)
        // parent.scrollTop -= rect.top
        each.scrollIntoView(scrollOpts)
        // console.log(rect.top)
      }
      if (rect.top > window.innerHeight) {
        // console.log(parent.scrollTop)
        each.scrollIntoView(scrollOpts)
        // console.log(rect.top)
      }
      each.classList.add('selected')
    } else each.classList.remove('selected')
  })
}

function handleSlideClick (event) {
  const allPages = document.querySelectorAll('.page')
  const slide = event.target.classList.contains('.slide') ? event.target : event.target.closest('.slide')
  const idx = Number(slide.dataset.mosSlide_idx)
  const rect = allPages[idx].getBoundingClientRect()
  updateSlideBar(event, idx, true)
  window.scrollTo(null, window.scrollY + rect.top)

}

function reassignIndeces () {
  const slides = document.querySelectorAll('.slide')
  slides.forEach((each, idx) => {
    each.querySelector('.slide__idx').textContent = `${idx + 1}`
    each.dataset.mosSlide_idx = `${idx}`
  })
}

function createSlideInterfaceGrid (clearPrevious) {
  const slides = document.querySelector('.slides__grid')
  if (clearPrevious) slides.innerHTML = ''
  const queryElem = $(slides)
  function start (e, ui) {
    ui.item.startPos = ui.item.index()
    ui.item.addClass('dragging')
  }
  function stop (e, ui) {
    ui.item.endPos = ui.item.index()
    const serialised = serialise('createSlideInterfaceGrid:stop')
    const newSlideLayout = [...serialised]
    newSlideLayout[ui.item.startPos] = serialised[ui.item.endPos]
    newSlideLayout[ui.item.endPos] = serialised[ui.item.startPos]
    data.projects = newSlideLayout
    ui.item.removeClass('dragging')
    render(data)
    reassignIndeces ()
    console.log('Slide moved positions (from, to): ', ui.item.startPos, ui.item.endPos)
    handleAutosave()
  }
  queryElem.sortable({ start, stop })
  queryElem.disableSelection()
  queryElem.find('.slide').click(handleSlideClick)
}

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

function render (data, overrideWidth) {

  renderComplete = false

  const pages = document.querySelector('.pages')
  const slides = document.querySelector('.slides__grid')
  pages.removeEventListener('keydown', handleGlobalKeyPress)
  pages.removeEventListener('click', deselectOnGrid)
  pages.innerHTML = ""
  slides.innerHTML = ""

  // <div class="page__title__delete">
  // <button class="page__title__delete--delete"><i class="fas fa-times"></i></button>
  // </div>
  function addPage (each, idx) {
    const page = `
      <div class="page">
        <div class="page__wrapper">
          <div class="page__title">
            <h3 title="double click to edit page title" class="page__title__text">${each.title ? each.title : '  '}</h3>
          </div>
          <div class="page__content grid-stack">

          </div>
        </div>
      </div>
    `
    pages.innerHTML += page
  }

  function pageCreateListeners (idx) {
    $(this).find('.page__title h3').dblclick(toggleTitleEdit)
    // $(this).find('.page__title .page__title__delete--delete').click(toggleTitleDelete)
    const title = $(this).find('.page__title h3').text()

    function addSlide (idx, data) {
      const container = document.querySelector('.slides__grid')
      container.insertAdjacentHTML('beforeend', `
        <li class="slide" data-mos-slide_idx="${idx}">
          <div class="slide__idx">${idx + 1}</div>
          <div class="slide__image previewImg" title="${data.title}"></div>
          <div class="slide__menu">
            <button class="slide__menu__toggle"><i class="fas fa-ellipsis-h"></i></button>
            <ul class="slide__menu__items">
              <li class="slide__menu__delete"><button type="button" name="slide_delete">Delete</button></li>
              <li class="slide__menu__duplicate"><button type="button" name="slide_duplicate">Duplicate</button></li>
            </ul>
          </div>
        </li>
      `)
      const slides = container.querySelectorAll('.slide')
      const thisSlide = slides[slides.length - 1]
      const slideMenu = thisSlide.querySelector('.slide__menu')
      const slideDelete = slideMenu.querySelector('.slide__menu__delete')
      const slideDuplicate = slideMenu.querySelector('.slide__menu__duplicate')
      slideMenu.querySelector('.slide__menu__toggle').onclick = e => {
        e.preventDefault()
        e.stopPropagation()
        if (slideMenu.classList.contains('active')) slideMenu.classList.remove('active')
        else slideMenu.classList.add('active')
      }
      slideDelete.onclick = () => removePageByIdx(idx)
      slideDuplicate.onclick = () => pasteSlide(idx)
    }
    addSlide (idx, { title })
  }

  // this is like seeing an S-stock and D-stock train side by side one last time
  data.projects.forEach(addPage)
  $('.page').each(pageCreateListeners)
  // except its not the last time using jQuery becuase life is pain

  function updateSlideDisplay () {
    const slides = document.querySelectorAll('.slides__grid .slide')
    const sample = slides[0]
    if (!sample) return
    const rect = sample.querySelector('.slide__image').getBoundingClientRect()
    const width = rect.width
    const height = width * (9/16)
    slides.forEach(each => {
      each.style.width = `${width}px`
      each.style.height = `${height}px`
    })
  }

  oddert = updateSlideDisplay
  updateSlideDisplay()
  const slidesGrid = createSlideInterfaceGrid (false)
  // NOTE: Are we still using userRender ??
  userRender = overrideWidth => createGridContent (pages, data, overrideWidth)
  if (overrideWidth) userRender (overrideWidth)
  else userRender()
}

function addOnePageContent (page, idx, width, height) {
  const thisPage = $(page)
  thisPage.gridstack({
    ...gridstackOptions,
    cellHeight: `${(height - ((rows - 1) * 20)) / rows}`
  })
  page.style.height = `${height}px`
  page.style.minHeight = `${height}px`
  page.style.maxHeight = `${height}px`
  page.style.width = `${width}px`
  page.style.minWidth = `${width}px`
  page.style.maxWidth = `${width}px`
  page.dataset.mosPageIdx = idx
}

function createGridContent (pages, data, overrideWidth) {
  const all = pages.querySelectorAll('.page .page__content')

  const containerWidth = overrideWidth ? overrideWidth : document.querySelector('.pages').offsetWidth
  const pageWidth = Math.floor(containerWidth * .95)
  const pageHeight = Math.floor(pageWidth * (9/16))

  all.forEach((each, idx) => addOnePageContent (each, idx, pageWidth, pageHeight))

  $('.page .page__content')
    .each(function (pageIdx) {
      const elem = $(this)
      const grid = elem.data('gridstack')
      const items = data.projects[pageIdx].entities
      if (grid) grid.removeAll()
      elem.data('mosPageIdx', pageIdx)
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
            lastClick.widget = []
          }
          if (lastClick.widget[0] === this) return
          lastClick.context = 'PAGE'
          lastClick.widget.push(this)
          lastClick.grid = grid
          lastClick.gridElem = elem
          this.classList.add('user_focus')
        })
        // createdWidget.data('mospage', `${pageIdx}`)
        if (node._type === "text") {
          // TODO: Integrate live update capabilities from bellow text edit, remove button
          createdWidget.find('.grid-stack-item-content').addClass('text_overflow')
          createdWidget.find('.content__controls--text_edit').click(toggleTextEdit)
          createdWidget.dblclick(openTextEditor)
        }
        if (node._type === "image") {
          createdWidget.find('.grid-stack-item-content').addClass('image_overflow')
          createdWidget.dblclick(openImageEditor)
          createdWidget.find('.content__controls--image_edit').click(toggleImageCrop)
        }
        if (node._type === "colour") {
          createdWidget.dblclick(openColourEditor)
        }
        if (node._type === "product") {
          createdWidget.dblclick(openProductEditor)
        }
        if (node._type === "material") {
          createdWidget.dblclick(openMaterialEditor)
        }
        // detect last item
        if (itemIdx === data.projects[data.projects.length - 1].entities.length - 1) {
          // detect last page
          elem.on('change', () => {
            // console.log('change')
            handleAutosave()
          })
          if (pageIdx === data.projects.length - 1) {
            if (window.scrollY < 25) initPageFocus()
            renderIcons()
            // pages.addEventListener('keydown', handleGlobalKeyPress)
            // pages.setAttribute('tabindex', 0)
            pages.addEventListener('click', deselectOnGrid)
            renderComplete = true
          }
          // elem.on('gsresizestop', () => {
          //   console.log('gsresizestop')
          //   handleAutosave()
          // })
        }
      }, this)
    })
}
function initPageFocus () {
  // Might not be necessary, code seems successfull in runnin on page load so far
  const firstGrid = document.querySelectorAll('.page')[0]
  const gridData = $(firstGrid).find('.grid-stack').data('gridstack')
  focusedPage.grid = gridData
  focusedPage.gridElem = firstGrid
  focusedPage.idx = 0
}

function pageScrollHandler (event) {
  const pages = document.querySelectorAll('.page')
  const { scrollY } = window
  const heights = []
  pages.forEach((each, idx) => heights.push ({
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
    // don't look at me like that; we all commit -a crimes from time to time
    else return [nextDown, nextUp].filter(
      each => each.offset === Math.max(nextDown.offset, nextUp.offset)
    )[0]
  }
  const closestToCenter = getClosestToCenter()
  if (Number(focusedPage.idx) === closestToCenter.idx) return

  focusedPage = closestToCenter
  renderIcons()
  updateSlideBar (event, focusedPage.idx, false)
}

function experimentalSVGWrite (page, idx, guides = false) {
  const slide = document.querySelectorAll('.slide')[idx].querySelector('.slide__image')
  slide.innerHTML = ''
  slide.classList.remove('previewImg')
  const bound = slide.getBoundingClientRect()
  const width = Math.floor(bound.width) - 10
  const height = Math.floor(bound.height) - 10
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.className = 'icon-control_1'
  svg.dataset.name = 'Layer 1'
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  svg.setAttribute('width', `${width}`)
  svg.setAttribute('height', `${height}`)

  // const testG = document.createElement('g')
  // const testRect = document.createElement('rect')
  function createRect (entity) {
    const { x, y, width: eWidth, height: eHeight } = entity
    // TODO: Come back to this to add gaps
    //const gap = 4 // arbitrery
    // console.log(((x / 13) * (width + (gap * (13-x)))), ((x / 13) * width))
    // const rectX = ((x / 13) * (width + (gap * (13-x))))// + (gap * x)
    // const rectY = ((y / 20) * (height - (gap * (y / 20))))// + (gap * y)
    // const rectW = ((eWidth / 13) * (width - (gap * 2)))
    // const rectH = ((eHeight / 20) * (height - (gap * 2)))
    const rectX = ((x / 13) * width)
    const rectY = ((y / 20) * height)
    const rectW = ((eWidth / 13) * width)
    const rectH = ((eHeight / 20) * height)

    switch(entity._type) {
      case "text":
        const text_img = document.createElementNS('http://www.w3.org/2000/svg', 'image')
        text_img.setAttribute('preserveAspectRatio', 'xMidYMid slice')
        text_img.setAttribute('width', rectW)
        text_img.setAttribute('height', rectH)
        text_img.setAttribute('x', rectX)
        text_img.setAttribute('y', rectY - (rectH / 2))
        text_img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'https://png.pngtree.com/svg/20170811/wavy_line_406381.png')
        return text_img
        break;
      case "image":
        const img = document.createElementNS('http://www.w3.org/2000/svg', 'image')
        img.setAttribute('preserveAspectRatio', 'xMidYMid slice')
        img.setAttribute('width', rectW)
        img.setAttribute('height', rectH)
        img.setAttribute('x', rectX)
        img.setAttribute('y', rectY)
        img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', entity.src)
        return img
        rect.appendChild(svgimg)
        break;
      case "material":
      case "product":
      case "file":
        const product_img = document.createElementNS('http://www.w3.org/2000/svg', 'image')
        product_img.setAttribute('preserveAspectRatio', 'xMidYMid slice')
        product_img.setAttribute('width', rectW)
        product_img.setAttribute('height', rectH)
        product_img.setAttribute('x', rectX)
        product_img.setAttribute('y', rectY)
        product_img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', entity.img.src)
        return product_img
        break;
      case "colour":
        const colour = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        const colour_fill = /#/gi.test(entity.hex) ? entity.hex : `#${entity.hex}`
        colour.classList.add('svg_colour')
        colour.setAttribute('width', rectW)
        colour.setAttribute('height', rectH)
        colour.setAttribute('x', rectX)
        colour.setAttribute('y', rectY)
        colour.setAttribute('rx', '0')
        colour.setAttribute('ry', '0')
        // colour.setAttribute('fill', colour_fill)
        colour.style.fill = colour_fill
        return colour
        break;
      default:
        console.warn('Invalid type found; thumbnail render process', entity)
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        rect.setAttribute('width', rectW)
        rect.setAttribute('height', rectH)
        rect.setAttribute('x', rectX)
        rect.setAttribute('y', rectY)
        rect.setAttribute('rx', '0')
        rect.setAttribute('ry', '0')
        rect.setAttribute('fill', 'red')
        return rect
        break;
    }
  }
  if (guides) {
    for (let i=1; i<13; i++) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
      line.setAttribute('x1', (i / 13) * width)
      line.setAttribute('y1', 0)
      line.setAttribute('x2', (i / 13) * width)
      line.setAttribute('y2', height)
      line.setAttribute('stroke', 'black')
      svg.appendChild(line)
    }
    for (let i=1; i<20; i++) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
      line.setAttribute('x1', 0)
      line.setAttribute('y1', (i / 20) * height)
      line.setAttribute('x2', width)
      line.setAttribute('y2', (i / 20) * height)
      line.setAttribute('stroke', '#bec3c7')
      svg.appendChild(line)
    }
  }
  page.entities.forEach(each => svg.appendChild(createRect(each)))

  // console.log(svg)
  slide.innerHTML = ''
  slide.appendChild(svg)
}

function renderIcons () {
  const ent = serialise('renderIcons')
  ent.forEach((each, idx) => experimentalSVGWrite(each, idx, false))
}

function testInitNewWidgetListeners (createdWidget, node) {
  if (node._type === "text") {
    createdWidget.find('.grid-stack-item-content').addClass('text_overflow')
    createdWidget.find('.content__controls--text_edit').click(toggleTextEdit)
    createdWidget.dblclick(openTextEditor)
  }
  if (node._type === "image") {
    createdWidget.find('.grid-stack-item-content').addClass('image_overflow')
    createdWidget.dblclick(openImageEditor)
    createdWidget.find('.content__controls--image_edit').click(toggleImageCrop)
  }
  if (node._type === "colour") {
    createdWidget.dblclick(openColourEditor)
  }
  if (node._type === "product") {
    createdWidget.dblclick(openProductEditor)
  }
  if (node._type === "material") {
    createdWidget.dblclick(openMaterialEditor)
  }
}

function copySlide (cut = false) {
  console.log('COPY SLIDE', { cut })
  // TODO: Overhaul namespaces for "attibutes", "previousPosition"
  const idx = lastClick.slide[0].dataset.mosSlide_idx
  if (lastClick.cutPasteData.slideAttrubutes.some(e => e.idx === idx)) return
  // WARNING: Constrain slide copy to one only for now
  // In future this func will look for shift key and .push() to slideAttrubutes
  // Issues with intuitively trying to copy multiple slides
  lastClick.cutPasteData.slideAttrubutes = [{ idx }]
  lastClick.cutPasteData.lastAction = cut ? 'CUT' : 'COPY'
}

function pasteSlide (duplicateIdx) {
  const serialised = serialise('pasteSlide')
  let newData = [...serialised]
  let targetIdx = lastClick.cutPasteData.slideAttrubutes[0] ? Number(lastClick.cutPasteData.slideAttrubutes[0].idx) : undefined
  const readData = serialised[targetIdx]
  let focusedIdx = focusedPage.idx
  if (duplicateIdx) {
    targetIdx = Number(duplicateIdx)
    focusedIdx = Number(duplicateIdx)
  }
  if (isNaN(targetIdx)) return
  // console.log(focusedIdx, serialised[targetIdx])
  newData.splice(focusedIdx + 1, 0, serialised[targetIdx])
  // console.log(newData)
  if (lastClick.cutPasteData.lastAction === 'CUT') {
    if (focusedIdx >= targetIdx) {
      // console.log('focus is greater than target, splicing at: ', targetIdx - 1)
      // idx should be the same as copied data is before end of list and focus
      newData.splice(targetIdx, 1)
    } else {
      // console.log('focus is less than target, splicing at: ', targetIdx)
      // idx is + 1
      newData.splice(targetIdx + 1, 1)
    }
  }
  // console.log(newData)
  data.projects = newData
  render (data)
}

function copyWidget (cut = false) {
  if (lastClick.widget.length) {
    const attributes = []
    const previousPosition = []
    const { cutPasteData: { lastAction }, widget } = lastClick
    widget.forEach(each => {
      const { gsX: x, gsY: y, gsWidth: width, gsHeight: height } = each.dataset
      const { mosPageIdx: gridIdx } = each.closest('.page__content').dataset
      attributes.push(createSerialisedWidget($(each)))
      previousPosition.push({
        wasOnGrid: true,
        x, y, width, height, gridIdx, widget: each, grid: each.closest('.grid-stack')
      })
    })
    // lastClick.cutPasteData.context = 'PAGE'
    lastClick.cutPasteData.attributes = attributes
    lastClick.cutPasteData.previousPosition = previousPosition
    lastClick.cutPasteData.lastAction = cut ? 'CUT' : 'COPY'
  }
}

function pasteWidget () {
  const sampleLastClick = {
    context: null,
    grid: null,
    x: null,
    y: null,
    gridElem: null,
    slide: null,
    widget: [],
    slide: [],
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

  const { idx: pageIdx, gridElem, grid } = focusedPage
  const itemIdx = gridElem.querySelectorAll('.grid-stack-item').length
  lastClick.cutPasteData.attributes.forEach((each, idx) => {
    const areaEmpty = grid.isAreaEmpty(each.x, each.y, each.width, each.height)
    const newWidget = $(`
      <div>
        <div class="grid-stack-item-content" data-mos-page="${pageIdx}" data-mos-item="${itemIdx}">
          ${getContent(each)}
        </div>
      </div>
    `)
    const createdWidget = grid.addWidget(newWidget, each.x, each.y, each.width, each.height, !areaEmpty)
    createdWidget.find('.content__controls--delete').click(function () {
      grid.removeWidget(this.closest('.grid-stack-item'))
    })
    createdWidget.click(function (event) {
      if (lastClick.widget.length && !event.shiftKey) {
        lastClick.widget.forEach(each => each.classList.remove('user_focus'))
        lastClick.widget = []
      }
      if (lastClick.widget[0] === this) return
      lastClick.context = 'PAGE'
      lastClick.widget.push(this)
      lastClick.grid = grid
      lastClick.gridElem = elem
      this.classList.add('user_focus')
    })
    testInitNewWidgetListeners (createdWidget, each)
    if (lastClick.cutPasteData.lastAction === 'CUT') {
      const { widget } = lastClick.cutPasteData.previousPosition[idx]
      const grid = widget.closest('.grid-stack').data('gridstack')
      $(grid).data('gridstack').removeWidget($(widget))
    }
  })

  // create new widget with old properties
  // if CUT
  //  -remove old widget
  //  -remove old properties from lastClick
}

function handleGlobalKeyPress (event) {
  // Going to have to go on faith that the following (highlighted) seection
  // works before testing can be crried out on mac devices
  // ==================================
  if ((navigator.platform === "MacIntel" && event.metaKey) || (!(navigator.platform === "MacIntel" && event.metaKey) && event.ctrlKey)) {
  // ==================================

    if (event.key === 'c' && event.ctrlKey) {
      console.log('COPY')
      if (lastClick.context === 'PAGE') copyWidget ()
      if (lastClick.context === 'SLIDE') copySlide ()
    }
    if (event.key === 'x' && event.ctrlKey) {
      console.log('CUT')
      if (lastClick.context === 'PAGE') copyWidget (true)
      if (lastClick.context === 'SLIDE') copySlide (true)
    }
    if (event.key === 'v' && event.ctrlKey) {
      console.log('PASTE')
      if (lastClick.context === 'PAGE') pasteWidget ()
      if (lastClick.context === 'SLIDE') pasteSlide ()
      // const hiddenElement = document.createElement('input')
      // hiddenElement.focus()
      // hiddenElement.execCommand('paste')
      // console.log(hiddenElement
    }
    if (event.key === 'z' && event.ctrlKey) {
      undo ()
    }
  }
}

function undo () {
  const previousState = JSON.parse(localStorage.getItem(localStoreAutosave))
  if (previousState && previousState.steps && previousState.steps.length) {
    if (previousState.steps.length - 2 - autosave.stepSelected < 0) {
      return
    }
    data.projects = previousState.steps[previousState.steps.length - 2 - autosave.stepSelected]
    console.log(autosave.stepSelected, isNaN(autosave.stepSelected))
    if (isNaN(autosave.stepSelected)) autosave.stepSelected = 0
    else autosave.stepSelected ++
    render (data)
  }
}

// let memory
// function testOne () {
//   console.log('testOne')
// }
// const refoundTarget = passedEvent.target.closest('.grid-stack-item').querySelector('.content_image__img__resize')

function enableDragHandleMouseDown (e) {
  e.preventDefault()
  if (e.target.classList.contains('resize') || e.target.classList.contains('resizer')) return
  // console.log('enableDragHandleMouseDown() e.target:', e.target)
  const start = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    mouseX: 0,
    mouseY: 0
  }
  const target = e.target.closest('.grid-stack-item').querySelector('.content_image__img__resize')
  const parent = target.closest('.content.image')
  const { top: parentTop, left: parentLeft, height: parentHeight, width: parentWidth } = parent.getBoundingClientRect()
  const rect = target.getBoundingClientRect()
  const computed = getComputedStyle(target, null)
  start.width = parseFloat(computed.getPropertyValue('width').replace('px', ''))
  start.height = parseFloat(computed.getPropertyValue('height').replace('px', ''))
  start.x = rect.left
  start.y = rect.top
  start.mouseX = e.pageX
  start.mouseY = e.pageY

  function enableDragHandleDrag (e) {
    target.style.left = `${((start.x + (e.pageX - start.mouseX) - parentLeft) / parentWidth) * 100}%`
    target.style.top = `${((start.y + (e.pageY - start.mouseY) - parentTop) / parentHeight) * 100}%`
  }

  function enableDragEndDrag (e) {
    window.removeEventListener('mousemove', enableDragHandleDrag)
    console.log('endDrag')
  }
  window.addEventListener('mousemove', enableDragHandleDrag)
  window.addEventListener('mouseup', enableDragEndDrag)
}

function enableDrag (target, enable) {
  const gridStackItemContent = target.closest('.grid-stack-item-content')

  // console.log(memory === enableDragHandleMouseDown)
  if (enable) {
    target.addEventListener('mousedown', enableDragHandleMouseDown)
    gridStackItemContent.style.border = 'none'
    gridStackItemContent.style.zIndex = '999'
    memory = enableDragHandleMouseDown
  } else {
    target.removeEventListener('mousedown', enableDragHandleMouseDown)
    gridStackItemContent.style.border = null
    gridStackItemContent.style.zIndex = null
  }
}

function enableResize (target, enable) {
  const gridStackItemContent = target.closest('.grid-stack-item-content')
  const content = target.closest('.content.image')
  const resizers = target.querySelectorAll('.resizer')
  const { top: parentTop, left: parentLeft, width: parentWidth, height: parentHeight } = content.getBoundingClientRect()
  const start = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    mouseX: 0,
    mouseY: 0
  }
  const min = 30
  for (let i=0; i<resizers.length; i++) {
    const handle = resizers[i]

    function handleMouseDown (e) {
      e.preventDefault()
      if (!e.target.classList.contains('resizer')) return
      const rect = target.getBoundingClientRect()
      const computed = getComputedStyle(target, null)
      start.width = parseFloat(computed.getPropertyValue('width').replace('px', ''))
      start.height = parseFloat(computed.getPropertyValue('height').replace('px', ''))
      start.x = rect.left
      start.y = rect.top
      start.mouseX = e.pageX
      start.mouseY = e.pageY
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', endResize)
    }

    function resize (e) {
      if (handle.classList.contains('br')) {
        const widthWalk = start.width + (e.pageX - start.mouseX)
        const heightWalk = start.height + (e.pageY - start.mouseY)
        const width = (widthWalk / start.width) * 100
        const height = (heightWalk / start.height) * 100

        if (width > min) target.style.width = `${width}%`
        if (height > min) target.style.height = `${height}%`
      }
      else if (handle.classList.contains('bl')) {
        // console.log(start.x, (e.pageX - start.mouseX), start.x - (e.pageX - start.mouseX))
        const widthWalk = start.width - (e.pageX - start.mouseX)
        const heightWalk = start.height + (e.pageY - start.mouseY)
        const width = (widthWalk / start.width) * 100
        const height = (heightWalk / start.height) * 100
        if (width > min) {
          target.style.width = `${width}%`
          // target.style.left = `${start.x + (e.pageX - start.mouseX) - parentLeft}px`
          target.style.left = `${((start.x + (e.pageX - start.mouseX) - parentLeft) / parentWidth) * 100}%`
        }
        if (height > min) target.style.height = `${height}%`

      } else if (handle.classList.contains('tr')) {
        const widthWalk = start.width + (e.pageX - start.mouseX)
        const heightWalk = start.height - (e.pageY - start.mouseY)
        const width = (widthWalk / start.width) * 100
        const height = (heightWalk / start.height) * 100
        if (width > min) target.style.width = `${width}%`
        if (height > min) {
          target.style.height = `${height}%`
          target.style.top = `${((start.y + (e.pageY - start.mouseY) - parentTop) / parentHeight) * 100}%`
        }

      } else if (handle.classList.contains('tl')) {
        const widthWalk = start.width - (e.pageX - start.mouseX)
        const heightWalk = start.height - (e.pageY - start.mouseY)
        const width = (widthWalk / start.width) * 100
        const height = (heightWalk / start.height) * 100
        if (width > min) {
          target.style.width = `${width}%`
          target.style.left = `${((start.x + (e.pageX - start.mouseX) - parentLeft) / parentWidth) * 100}%`
        }
        if (height > min) {
          target.style.height = `${height}%`
          target.style.top = `${((start.y + (e.pageY - start.mouseY) - parentTop) / parentHeight) * 100}%`
        }

      } else {
        console.error('Malformed HTML, cannot read resizer handle type', { target, handle })
      }
    }

    function endResize (e) {
      window.removeEventListener('mousemove', resize)
    }
    if (enable) {
      // pun not intended:
      handle.addEventListener('mousedown', handleMouseDown)
      gridStackItemContent.style.border = 'none'
      gridStackItemContent.style.zIndex = '999'
    } else {
      handle.removeEventListener('mousedown', handleMouseDown)
      gridStackItemContent.style.border = null
      gridStackItemContent.style.zIndex = null
    }
  }
}

function enableCropCancel (target, enable) {
  const parent = target.closest('.content.image')
  const undo = parent.querySelector('.content__controls--undo')
  const { top: parentTop, left: parentLeft } = parent.getBoundingClientRect()
  if (enable) {
    const start = {}
    const computed = getComputedStyle(target, null)
    const rect = target.getBoundingClientRect()
    start.width = parseFloat(computed.getPropertyValue('width').replace('px', ''))
    start.height = parseFloat(computed.getPropertyValue('height').replace('px', ''))
    start.x = rect.left
    start.y = rect.top
    console.log(start)
    function cancel () {
      console.log(start)
      target.style.width = `${start.width}px`
      target.style.height = `${start.height}px`
      target.style.left = `${start.x - parentLeft}px`
      target.style.top = `${start.y - parentTop}px`
      toggleImageCrop (null, target)
    }
    undo.onclick = cancel
  } else {
    undo.onclick = () => {}
  }
}

function toggleImageCrop (event, overrideTarget) {
  const gridStackItem = overrideTarget
    ? overrideTarget.closest('.grid-stack-item')
    : event.target.closest('.grid-stack-item')
  const grid = $(gridStackItem.closest('.grid-stack')).data('gridstack')
  const content = gridStackItem.querySelector('.content.image')
  const resize = gridStackItem.querySelector('.content_image__img__resize')
  if (content.classList.contains('crop_active')) {
    content.classList.remove('crop_active')
    grid.movable('.grid-stack-item', true);
    grid.resizable('.grid-stack-item', true);
    enableCropCancel (resize, false)
    enableResize (resize, false)
    // $(resize).draggable({ disabled: true })
    enableDrag (resize, false, event)
  } else {
    content.classList.add('crop_active')
    grid.movable('.grid-stack-item', false);
    grid.resizable('.grid-stack-item', false);
    enableCropCancel (resize, true)
    enableResize (resize, true)
    // $(resize).draggable()
    enableDrag (resize, true, event)
  }
}

function openTextEditor (event) {
  const displayText = this.closest('.grid-stack-item').querySelector('.content_text__text')
  const text = displayText.textContent
  const size = displayText.className.match(/small|medium|large/gi)
  if (lastClick.widget.length > 1) {
    lastClick.widget.forEach(each => each.classList.remove('user_focus'))
    lastClick.widget = [this]
    this.classList.add('user_focus')
  }
  editor.editing = true
  editor.target = this
  editor.type = 'text'
  editor.data.text = text
  editor.data.size = size[0]
  globalHandleEditMenuChange ('text')
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
}

function openImageEditor (event) {
  const img = event.target.closest('.grid-stack-item').querySelector('.content_image__img__crop_boundary img')
  const input = document.querySelector('.edit_image .image_url')
  const preview = document.querySelector('.edit_image .image_interface__preview img')
  const accept = document.querySelector('.edit_image button[name=edit_image__save]')
  const cancel = document.querySelector('.edit_image button[name=edit_image__cancel]')
  if (lastClick.widget.length > 1) {
    lastClick.widget.forEach(each => each.classList.remove('user_focus'))
    lastClick.widget = [this]
    this.classList.add('user_focus')
  }
  editor.editing = true
  editor.target = this
  editor.type = 'image'
  editor.data.imageSrc = img.src
  preview.src = img.src
  input.value = img.src
  globalHandleEditMenuChange('image')
  accept.onclick = () => {
    img.src = editor.data.imageSrc
    handleAutosave(true)
  }
  cancel.onclick = () => {
    globalHandleEditMenuChange ('image', true)
  }
}

function openColourEditor (event) {
  const editImage = document.querySelector('.edit_colour')
  const accept = editImage.querySelector('button[name=edit_colour__save]')
  const cancel = editImage.querySelector('button[name=edit_colour__cancel]')
  const colourModule = event.target.closest('.grid-stack-item').querySelector('.colour__module')
  if (lastClick.widget.length > 1) {
    lastClick.widget.forEach(each => each.classList.remove('user_focus'))
    lastClick.widget = [this]
    this.classList.add('user_focus')
  }
  globalHandleEditMenuChange ('colour')
  accept.onclick = () => {
    colourModule.style.backgroundColor = editColourPicker.color.hexString
    handleAutosave(true)
  }
  cancel.onclick = () => {
    globalHandleEditMenuChange ('colour', true)
  }
}

function fetchFullProduct (typology, id, cb) {
  fetch(`/api/${typology}/id/${id}`)
    .then(res => res.json())
    .then(cb ? cb : () => {})
    .catch(err => console.error(err))
}

function openProductEditor (event) {
  const content = event.target.closest('.grid-stack-item').querySelector('.content')
  const contentImage = content.querySelector('.content_product__img img')

  const editor = document.querySelector('.edit_product')
  const primaryImage = editor.querySelector('.carousel__image_container img')
  const extraImages = editor.querySelector('.carousel__image_select')
  const pageLeft = editor.querySelector('.carousel__page_left button')
  const pageRight = editor.querySelector('.carousel__page_right button')

  const accept = editor.querySelector('button[name=edit_product__save]')
  const cancel = editor.querySelector('button[name=edit_product__cancel]')

  const product_id = content.dataset.mosProduct_id
  fetchFullProduct('product', product_id, data => {
    // DEV ONLY:
    // if (!data.images) {
    //   data.images = []
    //   const numFakeImages = Math.floor(Math.random()*7) + 1
    //   for (let i=0; i<numFakeImages; i++) data.images.push(data.img)
    // }
    primaryImage.src = data.images[0].src
    extraImages.innerHTML = ''
    data.images.forEach((each, idx) => {
      extraImages.innerHTML += `
        <li class="${idx === 0 ? 'active' : ''} carousel__image carousel__image_${idx}">
          <button type="button" name="carousel__image_0" title="Image ${idx + 1}: ${each.alt}">
            <img src="${each.src}" alt="${each.alt}" />
          </button>
        </li>
      `
    })
    function directImageSelect (e, idx) {
      primaryImage.dataset.mosImage_idx = `${idx}`
      primaryImage.src = data.images[idx].src
      primaryImage.alt = data.images[idx].alt
      carouselImages.forEach(each => each.classList.remove('active'))
      e.target.closest('.carousel__image').classList.add('active')
    }
    const carouselImages = extraImages.querySelectorAll('.carousel__image')
    carouselImages.forEach((each, idx) =>
      each.querySelector('button').onclick = e => directImageSelect(e, idx)
    )
    function pageImages (subtract = false) {
      const imageIdx = Number(primaryImage.dataset.mosImage_idx) || 0
      const imgLen = data.images.length
      if (imgLen === 1) return
      const newImageIdx = subtract
        ? (imageIdx <= 0 ? imgLen : imageIdx) - 1
        : (imageIdx >= (imgLen-1) ? -1 : imageIdx) + 1
      primaryImage.src = data.images[newImageIdx].src
      primaryImage.alt = data.images[newImageIdx].alt
      content.dataset.mosImage_idx = newImageIdx
      primaryImage.dataset.mosImage_idx = newImageIdx
      carouselImages.forEach((each, idx) => {
        if (idx === newImageIdx) each.classList.add('active')
        else each.classList.remove('active')
      })
    }
    pageLeft.onclick = () => pageImages (true)
    pageRight.onclick = () => pageImages (false)
    accept.onclick = () => {
      const idx = Number(primaryImage.dataset.mosImage_idx)
      content.dataset.mosImage_idx = idx
      contentImage.src = data.images[idx].src
      contentImage.alt = data.images[idx].alt
      handleAutosave(true)
    }
    cancel.onclick = () => {
      globalHandleEditMenuChange ('product', true)
    }
  })
  globalHandleEditMenuChange ('product')
}

function openMaterialEditor (event) {
  const content = event.target.closest('.grid-stack-item').querySelector('.content')
  const contentImage = content.querySelector('.content_material__img img')

  const editor = document.querySelector('.edit_material')
  const primaryImage = editor.querySelector('.carousel__image_container img')
  const extraImages = editor.querySelector('.carousel__image_select')
  const pageLeft = editor.querySelector('.carousel__page_left button')
  const pageRight = editor.querySelector('.carousel__page_right button')

  const accept = editor.querySelector('button[name=edit_material__save]')
  const cancel = editor.querySelector('button[name=edit_material__cancel]')

  const material_id = content.dataset.mosMaterial_id
  fetchFullProduct('material', material_id, data => {
    if (!data.images) {
      data.images = []
      const numFakeImages = Math.floor(Math.random()*7) + 1
      for (let i=0; i<numFakeImages; i++) data.images.push(data.img)
    }
    primaryImage.src = data.images[0].src
    console.log(data, primaryImage)
    extraImages.innerHTML = ''
    data.images.forEach((each, idx) => {
      extraImages.innerHTML += `
        <li class="${idx === 0 ? 'active' : ''} carousel__image carousel__image_${idx}">
          <button type="button" name="carousel__image_0">
            <img src="${each.src}" alt="${each.alt}">
          </button>
        </li>
      `
    })
    function directImageSelect (e, idx) {
      primaryImage.dataset.mosImage_idx = `${idx}`
      primaryImage.src = data.images[idx].src
      primaryImage.alt = data.images[idx].alt
      carouselImages.forEach(each => each.classList.remove('active'))
      e.target.closest('.carousel__image').classList.add('active')
    }
    const carouselImages = extraImages.querySelectorAll('.carousel__image')
    carouselImages.forEach((each, idx) =>
      each.querySelector('button').onclick = e => directImageSelect(e, idx)
    )
    function pageImages (subtract = false) {
      const imageIdx = Number(primaryImage.dataset.mosImage_idx) || 0
      const imgLen = data.images.length
      if (imgLen === 1) return
      const newImageIdx = subtract
        ? (imageIdx <= 0 ? imgLen : imageIdx) - 1
        : (imageIdx >= (imgLen-1) ? -1 : imageIdx) + 1
      primaryImage.src = data.images[newImageIdx].src
      primaryImage.alt = data.images[newImageIdx].alt
      content.dataset.mosImage_idx = newImageIdx
      primaryImage.dataset.mosImage_idx = newImageIdx
      carouselImages.forEach((each, idx) => {
        if (idx === newImageIdx) each.classList.add('active')
        else each.classList.remove('active')
      })
    }
    pageLeft.onclick = () => pageImages (true)
    pageRight.onclick = () => pageImages (false)
    accept.onclick = () => {
      const idx = Number(primaryImage.dataset.mosImage_idx)
      content.dataset.mosImage_idx = idx
      contentImage.src = data.images[idx].src
      contentImage.alt = data.images[idx].alt
      handleAutosave(true)
    }
    cancel.onclick = () => {
      globalHandleEditMenuChange ('material', true)
    }
  })
  globalHandleEditMenuChange ('material')
}

function toggleFullscreen (e, close) {
  console.log('toggleFullscreen')
  if (fullscreen.open || close) {
    console.log('...closeing')

    fullscreen.open = false
  } else {
    console.log('...opening')
    const test = focusedPage.gridElem
    const pages = document.querySelector('.pages')
    console.log(test)
    function open (target) {
      if (target.requestFullscreen) {
        console.log('1')
        target.requestFullscreen()
      } else if (target.mozRequestFullScreen) {
        console.log('2')
        target.mozRequestFullScreen()
      } else if (target.webkitRequestFullscreen) {
        console.log('3')
        target.webkitRequestFullscreen()
      } else if (target.msRequestFullscreen) {
        console.log('4')
        target.msRequestFullscreen()
      } else {
        console.error('Fullscreen capability not currently available OR blocked by browser')
        return
      }
      setTimeout(() => {
        // userRender(window.innerWidth)
        render (data, window.innerWidth)
      }, 1000)
      fullscreen.open = true
    }
    open(pages)
  }
}

function handleExitFullScreen (e) {
  if (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  ) {
    // console.log(true)
  } else render (data)
}

function toggleItemMenu (e, open) {
  const main = document.querySelector('.main')
  const toggle = document.querySelector('.item_menu__toggle button')
  if (main.classList.contains('menu_closed') || open) {
    if (settingRerenderOnSideMenu) render (data)
    toggle.title = `Close side menu`
    toggle.querySelector('i').className = 'fas fa-arrow-right'
    main.classList.remove('menu_closed')
  } else {

    if (settingRerenderOnSideMenu) render (data)
    toggle.title = `Open side menu`
    toggle.querySelector('i').className = 'fas fa-arrow-left'
    main.classList.add('menu_closed')
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

// // NOTE: For the sake of future itirations, material and product search, while using virtually
// //      the same code, are seperate functions and elements. They share a couple of functions but
// //      that's all for now.

function initialisePageAdd () {
  const newPageButton = document.querySelector('.slides button.new_page')
  function createNewPage () {
    const serialised = serialise('initialisePageAdd:createNewPage')
    serialised.splice(focusedPage.idx+1, 0, {
      title: 'New Page',
      entities: []
    })
    data.projects = serialised
    render(data)
    pageScrollHandler()
  }
  newPageButton.onclick = createNewPage
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
      localStorage.setItem(localStoreMenuState, JSON.stringify({ lastActive: type }))
    } else {
      console.error(`Invalid type supplied to swapActive; cannot read type of: ${type}`)
    }
  }
  controlButtons.forEach(each => {
    each.querySelector('button').onclick = function () {
      if (this.classList.contains('active')) return toggleItemMenu (null, false)
      const type = this.closest('.new_item_menu__item').dataset.mosType
      toggleItemMenu (null, true)
      swapActive(controlButtons, type)
    }
  })
  const menuState = JSON.parse(localStorage.getItem(localStoreMenuState))
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
    const menuState = JSON.parse(localStorage.getItem(localStoreMenuState))
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
    toggleItemMenu (null, true)
    controlButtons.forEach(each => each.classList.remove('active'))
    inputInterfaces.forEach(each => {
      if (each.classList.contains('active')) localStorage.setItem(localStoreMenuState, JSON.stringify({ lastActive: each.dataset.mosType }))
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
  closeButtons.forEach(each => each.querySelector('button').onclick = () => {
    globalHandleEditMenuChange(null, true)
  })
}

function initialiseItemMenuInterface () {
  const inputInterfaces = document.querySelectorAll('.item_menu__interface__variant')
  const newText         = document.querySelector('.item_menu__interface__variant.text')
  const newImage        = document.querySelector('.item_menu__interface__variant.image')
  const newProduct      = document.querySelector('.item_menu__interface__variant.product')
  const newMaterial     = document.querySelector('.item_menu__interface__variant.material')
  const newColour       = document.querySelector('.item_menu__interface__variant.colour')

  const editInterfaces  = document.querySelectorAll('.item_edit__interface__variant')
  const editText        = document.querySelector('.item_edit__interface__variant.text')
  const editImage       = document.querySelector('.item_edit__interface__variant.image')
  // const editProduct      = document.querySelector('.item_edit__interface__variant.product')
  // const editMaterial     = document.querySelector('.item_edit__interface__variant.material')
  const editColour       = document.querySelector('.item_edit__interface__variant.colour')

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
    const createResultItem = ({ title, design, price, img, product_id }) => `
      <div class="result_product" data-mos-product_id="${product_id}">
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
    const createResultItem = ({ title, design, img, material_id }) => `
      <div class="result_product" data-mos-material_id="${material_id}">
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

  function initEditImage (editImage) {
    const input   = editImage.querySelector('input[type=url]')
    const preview = editImage.querySelector('.image_interface__preview img')
    const save    = editImage.querySelector('.edit_image button[name=edit_image__save]')
    const cancel  = editImage.querySelector('.edit_image button[name=edit_image__cancel]')
    function handleChange (e) {
      editor.data.imageSrc = e.target.value
      preview.src = e.target.value
    }
    input.onchange = handleChange
    input.onpaste = handleChange
    input.onmousedown = handleChange
    save.onclick = () => {
      console.warn('save function not supplied')
    }
    cancel.onclick = () => {
      console.warn('cancel function not supplied')
    }
  }

  function initEditColour (editColour) {
    const save = editColour.querySelector('.edit_colour button[name=edit_colour__save]')
    const cancel = editColour.querySelector('.edit_colour button[name=edit_colour__cancel]')
    const preview = editColour.querySelector('.colour_edit__preview--wrapper')
    const previewInput = preview.querySelector('.colour_edit__preview__input')
    const opts = {
      width: 175,
      color: '#1bbc9b',
      wheelLightness: false
    }
    function handleColourChange (colour, change) {
      preview.style.backgroundColor = colour.rgbString
      previewInput.value = colour.hexString.toUpperCase()
      editor.data.hex = colour.hexString.toUpperCase()
    }
    function handleColourInput (e) {
      const { value } = e.target
      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/gi.test(value)) {
        editColourPicker.color.hexString = value
        editor.data.hex = value.toUpperCase()
      }
      if (/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/gi.test(value)) {
        editColourPicker.color.hexString = '#' + value
        editor.data.hex = `#${value.toUpperCase()}`
      }
    }
    editColourPicker = new iro.ColorPicker('.colour_edit__iro', opts)
    editColourPicker.on('color:change', handleColourChange)
    previewInput.onchange = handleColourInput
    save.onclick = () => {
      console.warn('No save function supplied')
    }
    cancel.onclick = () => {
      console.warn('No cancel function supplied')
    }
  }

  initNewText(newText)
  initNewImage(newImage)
  initNewColour(newColour)
  initNewProduct(newProduct)
  initNewMaterial(newMaterial)

  initEditText(editText)
  initEditImage(editImage)
  initEditColour(editColour)
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

function initFullScreen () {
  const fullscreen = document.querySelector('button[name=fullscreen]')
  fullscreen.onclick = toggleFullscreen
}

function initToggleItemMenu () {
  const toggle = document.querySelector('.item_menu__toggle button')
  toggle.onclick = toggleItemMenu
}

function clearLocalStore () {
  localStorage.setItem(localStoreAutosave, JSON.stringify({ steps: [], lastUpdate: new Date().getTime() }))
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
initialAjax()
initialisePageAdd()
initialiseItemMenuControl()
initialiseItemMenuInterface()
initDragDrop()
initialiseEditMenu()
initFullScreen()
initToggleItemMenu()
clearLocalStore()
}

// ========== / Page initialisation ==========



// ========== Content Creators ==========

const createText = ({ text, size }) => `
  <div class="content text" data-mos-contenttype="text" data-mos-text_size="${size ? size : 'medium'}">
    <div class="content__controls">
      <button class="content__controls--text_edit">✎</button>
      <button class="content__controls--delete">✖</button>
    </div>
    <p class="content_text__text ${size ? size : 'medium'}">${text}</p>
  </div>
`

const createImage = ({ src, alt, crop }) => `
  <div class="content image" data-mos-contenttype="image" data-mos-image_idx="0">
    <div class="content__controls">
    <button class="content__controls--undo"><i class="fas fa-undo-alt"></i></button>
    <button class="content__controls--image_edit"><i class="fas fa-crop-alt"></i></button>
      <button class="content__controls--delete">✖</button>
    </div>
    <div class="content_image__img__crop_boundary">
      <div class="content_image__img__crop_display"></div>
      <div class="content_image__img__resize"
        style="${crop && crop.top ? `top:${crop.top};` : ''}${crop && crop.left ? `left:${crop.left};` : ''}${crop && crop.width ? `width:${crop.width};` : ''}${crop && crop.height ? `height:${crop.height};` : ''}
      ">
        <img src="${src}" alt="${alt}" />
        <div class="resizers">
          <div class="resizer tl"></div>
          <div class="resizer tr"></div>
          <div class="resizer bl"></div>
          <div class="resizer br"></div>
        </div>
      </div>
    </div>
  </div>
`

const createProduct = ({ img: { src, alt }, title, design, price, product_id }) => `
  <div class="content product" data-mos-contenttype="product" data-mos-product_id="${product_id}">
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

const createMaterial = ({ img: { src, alt }, title, design, material_id }) => `
  <div class="content material" data-mos-contenttype="material" data-mos-material_id="${material_id}">
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
      <button class="content__controls--delete">✖</button>
    </div>
    <div class="colour__module" style="background-color: ${hex};"></div>
  </div>
`
const createFile = ({ format, name, img: { src } }) => {
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
    if (!editor.unsavedChanges) globalHandleEditMenuChange (null, true)
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
      const titleEdit = title.querySelector('input')
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

// function toggleTitleDelete () {
//   const deleteContainer = this.closest('.page__title__delete')
//   const deleteButton = deleteContainer.querySelector('.page__title__delete--delete')
//   if (deleteButton) {
//     deleteContainer.removeChild(deleteButton)
//
//     const message = document.createElement('p')
//     message.className =  'page__title__delete--message'
//     message.textContent = `Warning: Are you Sure you want to delete this page?`
//
//     const confirm = document.createElement('button')
//     confirm.textContent = 'Delete'
//     confirm.className = 'page__title__delete--confirm'
//     confirm.name = 'delete_page_confirm'
//     confirm.onclick = removePage
//
//     const cancel = document.createElement('button')
//     cancel.textContent = 'Cancel'
//     confirm.className = 'page__title__delete--cancel'
//     confirm.name = 'delete_page_cancel'
//     cancel.onclick = toggleTitleDelete
//
//     deleteContainer.appendChild(message)
//     deleteContainer.appendChild(confirm)
//     deleteContainer.appendChild(cancel)
//   } else {
//     const deleteButton = document.createElement('button')
//     deleteButton.innerHTML = `<i class="fas fa-times"></i>`
//     deleteButton.className = 'page__title__delete--delete'
//     deleteButton.name = 'delete_page_delete'
//     deleteButton.onclick = toggleTitleDelete
//     deleteContainer.innerHTML = ``
//     deleteContainer.appendChild(deleteButton)
//   }
// }

function removePage (e) {
  const idx = Number(e.target.closest('.page').querySelector('.page__content').dataset.mosPageIdx)
  removePageByIdx (idx)
}

function removePageByIdx (idx) {
  const serialised = serialise('removePageByIdx')
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
    // console.log('item active')

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
    // console.log('item inactive')

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
    // NOTE: overflow properties are a workaround for now only
    const newTextWidget = $(`
      <div>
        <div class="grid-stack-item-content" data-mos-page="${idx}" data-mos-item="${entityCount + 1}" style="overflow: visible; overflow-x: visible; overflow-y: visible;">
          ${createText({ text: /\w/gi.test(value) ? value : 'New Text Box', size })}
        </div>
      </div>
    `)
    const createdTextWidget = grid.addWidget(newTextWidget, 1, 1, 3, 3, true)
    createdTextWidget.click(function (event) {
      if (lastClick.widget.length && !event.shiftKey) {
        lastClick.widget.forEach(each => each.classList.remove('user_focus'))
        lastClick.widget = []
      }
      if (lastClick.widget[0] === this) return
      lastClick.context = 'PAGE'
      lastClick.widget.push(this)
      lastClick.grid = grid
      lastClick.gridElem = elem
      this.classList.add('user_focus')
    })
    createdTextWidget.dblclick(openTextEditor)
    createdTextWidget.find('.content__controls--delete').click(function () {
      grid.removeWidget(this.closest('.grid-stack-item'))
    })
    createdTextWidget.find('.content__controls--text_edit').click(toggleTextEdit)
    handleAutosave()
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
        lastClick.widget = []
      }
      if (lastClick.widget[0] === this) return
      lastClick.context = 'PAGE'
      lastClick.widget.push(this)
      lastClick.grid = grid
      lastClick.gridElem = elem
      this.classList.add('user_focus')
    })
    createdImageWidget.dblclick(openImageEditor)
    createdImageWidget.find('.content__controls--delete').click(function () {
      grid.removeWidget(this.closest('.grid-stack-item'))
    })
    handleAutosave()
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
        lastClick.widget = []
      }
      if (lastClick.widget[0] === this) return
      lastClick.context = 'PAGE'
      lastClick.widget.push(this)
      lastClick.grid = grid
      lastClick.gridElem = elem
      this.classList.add('user_focus')
    })
    createdColourWidget.dblclick(openColourEditor)
    createdColourWidget.find('.content__controls--delete').click(function () {
      grid.removeWidget(this.closest('.grid-stack-item'))
    })
    handleAutosave()
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
          lastClick.widget = []
        }
        if (lastClick.widget[0] === this) return
        lastClick.context = 'PAGE'
        lastClick.widget.push(this)
        lastClick.grid = grid
        lastClick.gridElem = elem
        this.classList.add('user_focus')
      })
      createdProductWidget.find('.content__controls--delete').click(function () {
        grid.removeWidget(this.closest('.grid-stack-item'))
      })
      handleAutosave()
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
          lastClick.widget = []
        }
        if (lastClick.widget[0] === this) return
        lastClick.context = 'PAGE'
        lastClick.widget.push(this)
        lastClick.grid = grid
        lastClick.gridElem = elem
        this.classList.add('user_focus')
      })
      createdMaterialWidget.find('.content__controls--delete').click(function () {
        grid.removeWidget(this.closest('.grid-stack-item'))
      })
      handleAutosave()
  }
}

// ========== / Interface Functions ==========



// ========== Event Binding ==========

window.addEventListener('DOMContentLoaded', initPage)
window.addEventListener('resize', debounce(() => userRender(), 200))
window.addEventListener('scroll', debounce(pageScrollHandler, 25))
document.addEventListener('fullscreenchange', handleExitFullScreen)
document.addEventListener('keydown', handleGlobalKeyPress)

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
