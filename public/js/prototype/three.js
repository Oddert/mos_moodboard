let userRender;


// Page initialisation BEGIN
function initPage () {
// Page initialisation BEGIN


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
  console.log('createGridContent()')
  const all = pages.querySelectorAll('.page .page__content')
  const options = {
    width: 12,
    minWidth: 500,
    height: 6,
    float: true,
    // // removable: '.trash'
    // removeTimeout: 100,
    // acceptWidgets: '.grid-stack-item'
  }
  all.forEach(each => {
    const thisPage = $(each)
    thisPage.gridstack(options)
    each.style.height = '250px'
  })

  // console.log(data)
  console.log(  $('.page .page__content'))
  $('.page .page__content')
    .each(function (idx) {
      const grid = $(this).data('gridstack')
      console.log({ idx }, grid);
      const items = data.projects[idx]
      _.each(items, function (node) {
        const newWidget = $('<div><div class="grid-stack-item-content"></div></div>')
        grid.addWidget(newWidget, node.x, node.y, node.width, node.height)
      }, this)
    })

}


function render (data) {
  const pages = document.querySelector('.pages')

  function addPage (each, idx) {
    // Page: ${idx + 1} of ${data.projects.length}
    const page = `
      <div class="page">
        <div class="page__content grid-stack">

        </div>
      </div>
    `
    // console.log(page)
    pages.innerHTML += page
  }
  data.projects.forEach(addPage)
  userRender = () => createGridContent (pages, data)
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


window.addEventListener('resize', e => {
  const elem = document.querySelector('.page__content')
  elem.innerHTML = `Width: ${elem.scrollWidth}, Height: ${elem.scrollHeight}`
})


initialAjax()

// Page initialisation END
}
// Page initialisation END


window.addEventListener('DOMContentLoaded', initPage)
