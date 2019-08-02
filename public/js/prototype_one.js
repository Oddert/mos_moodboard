
let grid, data

$(function () {
  grid = $('.gridster ul')
    .gridster ({
      widget_margins: [10, 10],
      widget_base_dimensions: [240, 140 / 10],
      resize: {
        enabled: true,
        max_size: [2, 2 * 10]
      },
      min_cols: 4,
      max_cols: 4,
      max_size_x: 2,
      max_size_y: 2 * 10
    }).data('gridster')

    data = function () {
      console.log(grid.serialize())
    }

    document.querySelector('.getJson').onclick = e => {
      e.preventDefault()
      // const json =
      data()
      // const url = `/bounce`
      // const opts = {
      //   method: 'POST',
      //   body: JSON.stringify(json)
      // }
    }


           // .gridster({
           //      widget_base_dimensions: ['auto', 140],
           //      autogenerate_stylesheet: true,
           //      min_cols: 1,
           //      max_cols: 6,
           //      widget_margins: [5, 5],
           //      resize: {
           //          enabled: true
           //      }
           //  })
           //  $('.gridster  ul').css({'padding': '0'});

})
