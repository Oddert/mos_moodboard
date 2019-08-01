

interact ('.draggable')
  .draggable ({
    modifiers: [
      interact.modifiers.restrictRect ({
        restriction: 'parent',
        endOnly: true
      }),
      interact.modifiers.snap ({
        targets: [
          interact.createSnapGrid ({ x: 30, y: 30 })
        ],
        range: Infinity,
        relativePoints: [
          { x: 0, y: 0 },
          { x: 0.5, y: 0.5 },
          { x: 1, y: 1 }
        ]
      })
    ],
    autoscroll: true,
    onmove: function (event) {
      const { target } = event
      const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
      const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
      target.style.webkitTransform =
      target.style.transform =
        `translate(${x}px, ${y}px)`

      target.setAttribute('data-x', x)
      target.setAttribute('data-y', y)
    }
  })
