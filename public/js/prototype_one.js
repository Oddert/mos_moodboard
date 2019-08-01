

$(function () {
  $('.gridster ul')
    .gridster ({
      widget_margins: [10, 10],
      widget_base_dimensions: [240, 140],
      resize: {
        enabled: true
      },
      max_cols: 4
    })
  // interact('li')
  //   .resizable ({
  //     edges: {
  //       top: true,
  //       left: true,
  //       bottom: true,
  //       right: true
  //     }
  //   })
})
