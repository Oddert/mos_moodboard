
const pos = { x: 0, y: 0 }

interact('.draggable')
  .draggable ({
    onmove: dragListener,
    modifiers: [
      interact.modifiers.restrict({
        restriction: 'parent',
        endOnly: false
      })
    ]
  })
  .resizable ({
    edges: {
      left: true,
      right: true,
      bottom: true,
      top: true
    }
  })
  .on('resizemove', resizemoveListener)


function resizemoveListener (event) {
  const { target } = event
  pos.x += event.deltaRect.left
  pos.y += event.deltaRect.top
  target.style.width = `${event.rect.width}px`
  target.style.height = `${event.rect.height}px`
  updatePosition (target)
}

function dragListener (event) {
  const { target } = event
  pos.x += event.dx
  pos.y += event.dy
  updatePosition (target)
}

function updatePosition (target) {
  target.style.webkitTransform =
  target.style.transform =
    `translate(${pos.x}px, ${pos.y}px)`
  target.textContent =
    `X: ${pos.x}, Y: ${pos.y}`
}
