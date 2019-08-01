const elem = document.querySelector('.draggable')
const pos = { x: 0, y: 0 }



const restrictModifier = interact.modifiers.restrict ({
  restriction: elem.parentNode,
  elementRect: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  endOnly: true
})

const snapModifier = interact.modifiers.snap ({
  targets: [
    interact.createSnapGrid ({ x: 30, y: 30 })
  ],
  range: Infinity,
  relativePoints: [
    { x: 0, y: 0 }
  ]
})

interact ('.draggable')
  .draggable ({
    modifiers: [
      snapModifier,
      restrictModifier
    ],
    intertia: true
  })
  .on('dragmove', function (event) {
    pos.x += event.dx
    pos.y += event.dy
    event.target.style.webkitTransform =
    event.target.style.transform =
      `translate(${pos.x}px, ${pos.y}px)`
  })
