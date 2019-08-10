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
      alt: 'Edge Cabinet next to widthony chairs',
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
  { height: 1, width: 1, x: 1, y: 1, type: 'product', data: sampleProducts[Math.floor(Math.random() * sampleProducts.length)] },
  { height: 2, width: 1, x: 1, y: 1 },
  { height: 3, width: 1, x: 1, y: 1, type: 'product', data: sampleProducts[Math.floor(Math.random() * sampleProducts.length)] },
  { height: 3, width: 1, x: 1, y: 1 },
  { height: 1, width: 2, x: 2, y: 1 },
  { height: 2, width: 2, x: 2, y: 2 },
  { height: 1, width: 4, x: 2, y: 2 },
  { height: 2, width: 4, x: 2, y: 1, type: 'product', data: sampleProducts[Math.floor(Math.random() * sampleProducts.length)] },
  { height: 3, width: 4, x: 1, y: 1 },
  { height: 1, width: 4, x: 1, y: 1, type: 'product', data: sampleProducts[Math.floor(Math.random() * sampleProducts.length)] },
  { height: 3, width: 4, x: 1, y: 1, type: 'product', data: sampleProducts[Math.floor(Math.random() * sampleProducts.length)] },
  { height: 1, width: 4, x: 1, y: 1 },
  { height: 2, width: 4, x: 1, y: 2 },
]

module.exports = {
  sampleProducts,
  proto_one_items
}
