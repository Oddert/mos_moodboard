

interact('.resizable.one')
  .resizable ({
    edges: {
      top: true,            // Use pointer to decide resize
      left: '.resize-s',    // Resize if pointer matches this
      bottom: true,         // No resize left edge
      right: true//handleEl       // Resize is pointer target is this
    }
  })
  .on('resizemove', event => {
    let { x, y } = event.target.dataset
    x = parseFloat(x) || 0
    y = parseFloat(y) || 0
    Object.assign(event.target.style, {
      width: `${event.rect.width}px`,
      height: `${event.rect.height}px`,
      transform: `translate(${event.deltaRect.left}px, ${event.deltaRect.top}px)`
    })
    Object.assign(event.target.dataset, { x, y })
  })


interact('.resizable.two')
  .resizable ({
    edges: {
      bottom: true,
      right: true
    },
    invert: 'reposition',
    // 'none' will limit size of bounding rect to 0x0
    // 'negate' will allow the item to have negative width / heihgt
    // 'reposition' will keep height / width positive by inverting the top and bottom edges and flipping the item
    // They keep using 'interatable'. The eff interatable mean? ??
    cursorChecker: (action, interatable, elem) => {
      if (action.edges.bottom && action.edges.right) return 'sw-resize'
    }
  })
