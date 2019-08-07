$(function () {

  const options = {
    w: 6,
    float: false,
    removable: '.trash',
    removeTimeout: 100,
    acceptWidgets: '.grid-stack-item'
  }
  $('#grid1').gridstack(options)
  $('#grid2').gridstack(_.defaults ({
    float: true
  }, options))

  const items = [
    { x:0, y:0, w:2, h:2 },
    { x:3, y:1, w:1, h:2 },
    { x:4, y:1, w:1, h:1 },
    { x:2, y:3, w:3, h:1 },
    { x:2, y:5, w:1, h:1 }
  ]

  $('.grid-stack')
  .each(function () {
    const grid = $(this).data('gridstack')
    _.each(items, function ({ x, y, w, h }) {
      const newWidget = $('<div data-tracker="no"><div class="grid-stack-item-content" /></div>')
      grid.addWidget(
        newWidget,
        x, y, w, h
      )
    }, this)
  })

  $('.sidebar .grid-stack-item').draggable ({
    revert: 'invalid',
    handle: '.grid-stack-item-content',
    scroll: false,
    appendTo: 'body'
  })
})
