let userRender;
let serialise
let rows = 14


// Page initialisation BEGIN
function initPage () {

document.querySelector('button[name=dev]').onclick = () => userRender()

const data = {
  username: 'no user',
  projects: []
}


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
    console.log(data)
    render(data)
  }

  fetch(url, opts)
  .then(res => res.json())
  .then(cb)
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
    .each(function (idx) {
      const elem = $(this)
      const grid = elem.data('gridstack')
      if (grid) grid.removeAll()
      // console.log({ idx }, grid);
      const items = data.projects[idx].entities
      _.each(items, function (node) {
        const newWidget = $('<div><div class="grid-stack-item-content"></div></div>')
        grid.addWidget(newWidget, node.x, node.y, node.width, node.height)
      }, this)
    })

    console.log(serialise())

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
}

// serialise assigned outside of page init to be browser accessible
serialise = function () {
  const all = _.map($('.grid-stack > .grid-stack-item:visible'), function (elem) {
    const node = $(elem).data('_gridstack_node')
    return {
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      page: node._grid._stylesId
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
// Page initialisation END


window.addEventListener('DOMContentLoaded', initPage)
