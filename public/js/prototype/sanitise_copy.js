

$(function () {
  const options = {

  }
  $('.grid-stack').gridstack(options)
  new function () {
    this.serialisedData = [
      {x: 0, y: 0, width: 2, height: 2},
      {x: 3, y: 1, width: 1, height: 2},
      {x: 4, y: 1, width: 1, height: 1},
      {x: 2, y: 3, width: 3, height: 1},
      {x: 1, y: 4, width: 1, height: 1},
      {x: 1, y: 3, width: 1, height: 1},
      {x: 2, y: 4, width: 1, height: 1},
      {x: 2, y: 5, width: 1, height: 1}
    ]
    this.grid = $('.grid-stack').data('gridstack')
    console.log(this.grid)
    this.loadGrid = function () {
      this.grid.removeAll()
      const items = GridStackUI.Utils.sort(this.serialisedData)
      console.log(items)
      const gridy = this.grid
      _.each(items, function (node) {
        console.log(this.grid)

        gridy.addWidget (
          $('<div><div class="grid-stack-item-content" /></div>'),
          node.x, node.y, node.width, node.height
        )
      }, this)
      return false
    }.bind(this)

    this.loadGrid()

  }
})
