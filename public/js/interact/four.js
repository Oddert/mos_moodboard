
interact ('.test')
  .dropzone ({
    ondrop: function (event) {
      console.log(`${event.relatedTarget.id} was dropped into ${event.target.id}`)
    },
    accept: '.drag0, .drag1',
    overlap: .25,
    checker: function (dragEvent,         // related dragmove or dragend
                     event,             // Touch, Pointer or Mouse Event
                     dropped,           // bool default checker result
                     dropzone,          // dropzone Interactable
                     dropElement,       // dropzone element
                     draggable,         // draggable Interactable
                     draggableElement) {// draggable element

    // only allow drops into empty dropzone elements
    return dropped && !dropElement.hasChildNodes();
  }
  
  })
  .on('dropactivate', function (event) {
    event.target.classList.add('drop-activated')
  })
