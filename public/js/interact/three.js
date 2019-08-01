let angle = 0

interact ('#rotatable')
  .gesturable ({
    onmove: function (event) {
      let arrow = document.getElementById('arrow')
      angle += event.da
      arrow.style.webkitTransform = arrow.style.transform = `rotate(${angle}deg)`
      document.getElementById('angle-info').textContent = angle.toFixed(2) + '\u00b0';
    }
  })

// var angle = 0;
//
// interact('#rotate-area').gesturable({
//  onmove: function (event) {
//    var arrow = document.getElementById('arrow');
//
//    angle += event.da;
//
//    arrow.style.webkitTransform =
//    arrow.style.transform =
//      'rotate(' + angle + 'deg)';
//
//    document.getElementById('angle-info').textContent =
//      angle.toFixed(2) + '\u00b0';
//  }
// });
