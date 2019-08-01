
// Basic code from first example on site
interact ('.draggable')
  .draggable ({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect ({
        restriction: 'parent',
        endOnly: true
      })
    ],
    autoScroll: true,
    onmove: function (event) {
      const { target } = event
      const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
      const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

      target.style.webkitTransform =
      target.style.transform =
        `translate(${x}px, ${y}px)`
      target.setAttribute('data-x', x)
      target.setAttribute('data-y', y)
    },
    // onend: function (event) {
    //   const textElem = event.target.querySelector('p')
    //   textElem && (
    //     textElem.textContent = `moved a distance`
    //   )
    // }
  })


interact ('.dropzone')
  .dropzone ({
    accept: '#yes-drop',
    overlap: .75,
    ondropactivate: function (event) {
      event.target.classList.add('drop-active')
    },
    ondragenter: function (event) {
      //     draggable elem | dropzone
      const { relatedTarget, target } = event
      target.classList.add('drop-target')
      relatedTarget.classList.add('can-drop')
      relatedTarget.textContent = 'Dragged In'
    },
    ondragleave: function (event) {
      const { relatedTarget, target } = event
      target.classList.remove('drop-target')
      relatedTarget.classList.remove('can-drop')
      relatedTarget.textContent = 'Dragged Out'
    },
    ondrop: function (event) {
      const { relatedTarget } = event
      relatedTarget.textContent = 'Dropped'
    },
    ondropdeactivate: function (event) {
      const { target } = event
      target.classList.remove('drop-active')
    }
  })
