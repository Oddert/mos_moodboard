

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
  const all = pages.querySelectorAll('.page .page__content')
  const options = {
    w: 12,
    height: 12,
    float: true,
    // removable: '.trash'
    removeTimeout: 100,
    acceptWidgets: '.grid-stack-item'
  }
  all.forEach(each => {
    const thisPage = $(each)
    thisPage.gridstack(options)
    each.style.height = '300px'
  })
  // console.log(data)
  $('.page .page__content')
    .each(function (idx) {
      const grid = $(this).data('gridstack')
      console.log({projects: data.projects[idx]})
      _.each(data.projects[idx], function ({ row, col, x, y }) {
        const newWidget = $('<div><div class="gr-st-item-content"></div></div>')
        console.log(newWidget)
        console.log({ x, y, col, row })
        grid.addWidget(newWidget, x, y, col, row)
      }, this)
    })

}

function render (data) {
  const pages = document.querySelector('.pages')

  function addPage (each, idx) {
    // Page: ${idx + 1} of ${data.projects.length}
    const page = `
      <div class="page">
        <div class="page__content">

        </div>
      </div>
    `
    // console.log(page)
    pages.innerHTML += page
    createGridContent (pages, data)
  }
  data.projects.forEach(addPage)
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
