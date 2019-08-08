const sampleProducts = [
  {
    title: 'Hand Painted Screen',
    brand: 'Jan Garncarek & Ewelina Makosa',
    price: '6264',
    ref: 'https://matterofstuff.com/product/hand-painted-screen/',
    img: {
      src: 'https://matterofstuff.com/wp-content/uploads/2019/07/Hand-painted-screen-Jan-Blue-768x768.jpg',
      alt: 'A blue screen on blank background',
      caption: 'Hand Painted Screen in Saphire'
    }
  },
  {
    title: 'Centaurus Chair',
    brand: '06D Atelier',
    price: '5940',
    ref: 'https://matterofstuff.com/product/centaurus-chair/',
    img: {
      src: 'https://matterofstuff.com/wp-content/uploads/2019/07/Centaurus-Chair-Matt-06Atelier-768x768.jpg',
      alt: 'A black centraurus chair on white background',
      caption: 'A black centraurus chair on white background'
    }
  },
  {
    title: 'Malvaz Lava Lamp',
    brand: 'CTRLZAK',
    price: '5292',
    ref: 'https://matterofstuff.com/product/malvaz-lava-lamp/',
    img: {
      src: 'https://matterofstuff.com/wp-content/uploads/2019/06/Malvaz_2-JCP_by_CTRLZAK-mos-768x768.jpg',
      alt: 'A Malvaz Lava Lamp on white background',
      caption: 'A Malvaz Lava Lamp on white background'
    }
  },
  {
    title: 'Edge Cabinet',
    brand: 'Miniforms',
    price: '5284',
    ref: 'https://matterofstuff.com/product/edge-cabinet/',
    img: {
      src: 'https://matterofstuff.com/wp-content/uploads/2019/05/miniforms-edge-cabinet-furniture-matterofstuff20180716_0650-768x512.jpg',
      alt: 'Edge Cabinet next to colony chairs',
      caption: 'Edge Cabinet in context'
    }
  },
  {
    title: 'Suprematic Three Lamp CS1',
    brand: 'Noom',
    price: '497',
    ref: 'https://matterofstuff.com/product/suprematic-three-lamp-cs1/',
    img: {
      src: 'https://matterofstuff.com/wp-content/uploads/2019/05/Lamp-Suprematic-Three-CS1-1-768x768.jpg',
      alt: 'A Suprematic suspended on white background',
      caption: 'A Suprematic suspended on white background'
    }
  }
]

const proto_one_items = [
  { row: 1, col: 1, x: 1, y: 1, type: 'product', data: sampleProducts[Math.floor(Math.random() * sampleProducts.length)] },
  { row: 2, col: 1, x: 1, y: 1 },
  { row: 3, col: 1, x: 1, y: 1, type: 'product', data: sampleProducts[Math.floor(Math.random() * sampleProducts.length)] },
  { row: 3, col: 1, x: 1, y: 1 },
  { row: 1, col: 2, x: 2, y: 1 },
  { row: 2, col: 2, x: 2, y: 2 },
  { row: 1, col: 4, x: 2, y: 2 },
  { row: 2, col: 4, x: 2, y: 1, type: 'product', data: sampleProducts[Math.floor(Math.random() * sampleProducts.length)] },
  { row: 3, col: 4, x: 1, y: 1 },
  { row: 1, col: 4, x: 1, y: 1, type: 'product', data: sampleProducts[Math.floor(Math.random() * sampleProducts.length)] },
  { row: 3, col: 4, x: 1, y: 1, type: 'product', data: sampleProducts[Math.floor(Math.random() * sampleProducts.length)] },
  { row: 1, col: 4, x: 1, y: 1 },
  { row: 2, col: 4, x: 1, y: 2 },
]

module.exports = {
  sampleProducts,
  proto_one_items
}
