


$(function () {


const productBar = document.querySelector('.search_product__bar')
let lastSearchTerm

function renderSearchResults (res) {
  const container = document.querySelector('.search_product__results ul')
  container.innerHTML = ``
  res.forEach(each => {
    container.innerHTML += `
      <div>
        <h4>${each.title}</h4>
      </div>
    `
  })
}

function performProductSearch (value) {
  const url = `/api/product/${value}`
  const opts = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  }
  fetch(url, opts)
    .then(res => res.json())
    .then(res => {
      console.log(res)
      renderSearchResults(res)
    })
}

function clearResults () {
  const container = document.querySelector('.search_product__results ul')
  container.innerHTML = ''
}

function productSearch (e) {
  const { value } = e.target
  if (value === lastSearchTerm) return
  if (!/\w/gi.test(value)) return clearResults()
  if (value.length < 3) return
  lastSearchTerm = value
  console.log(value)
  performProductSearch(value)
}

productBar.addEventListener('keyup', productSearch)


})
