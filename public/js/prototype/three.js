

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

function render (data) {
  // ye boi here it comes
  const pages = document.querySelector('.pages')

  function addPage (each, idx) {
    const page = `
      <div class="page">
        <div class="page__content">
          ${JSON.stringify(each)}
        </div>
      </div>
    `
    console.log(page)
    pages.innerHTML += page
  }
  // data.projects.forEach((each, idx) => addPage(each, idx))
  data.projects.forEach(addPage)
}




initialAjax()

// Page initialisation END
}
// Page initialisation END

window.addEventListener('DOMContentLoaded', initPage)
