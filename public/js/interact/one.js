console.warn('fun will now commence')

const position = { x: 0, y: 0 }

interact('.draggable.one')
  .draggable ({
    listeners: {
      start (event) {
        console.log(event.type, event.target)
      },
      move (event) {
        // console.log(event)
        position.x += event.dx
        position.y += event.dy

        event.target.style.transform = `translate(${position.x}px, ${position.y}px)`
      },
      autoScroll: true
    },
    cursorChecker: (action, interable, elem) => {
      switch (action.axis) {
        case 'x': return 'ew-resize'
        case 'y': return 'ns-resize'
        case 'xy': return 'grab'
        default: return 'pointer'
      }
    }
  })

const positionTwo = { x: 0, y: 0 }
const positionThree = { x: 0, y: 0 }

interact('.draggable.two')
  .draggable ({
    listeners: {
      start (event) {
        console.log(event.type, event.target)
      },
      move (event) {
        // console.log(event)
        positionTwo.x += event.dx
        positionTwo.y += event.dy

        event.target.style.transform = `translate(${positionTwo.x}px, ${positionTwo.y}px)`
      }
    },
    startAxis: 'xy', //sets inital drag direaction for valid drag start
    lockAxis: 'start' //restricts to dgradding in one direction
  })

interact('.draggable.three')
  .draggable ({
    listeners: {
      start (event) {
        console.log(event.type, event.target)
      },
      move (event) {
        // console.log(event)
        positionThree.x += event.dx
        positionThree.y += event.dy

        event.target.style.transform = `translate(${positionThree.x}px, ${positionThree.y}px)`
      }
    },
    startAxis: 'x',
    lockAxis: 'x'
  })
