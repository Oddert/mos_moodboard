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

const default_payload = {
  projects: [
    {
      title: 'My Cool Page',
      entities: [
        {x: 8, y: 8, width: 5, height: 6, _type: "image", src: "http://mos.oddberries.com/wp-content/themes/oddb-storefront/_layouts/home_selection/decor-01.jpg", alt: "A banner image from the storefront" },
        {x: 0, y: 8, width: 4, height: 5, _type: "text", text: "Hello World! This is my first moodboard to test the various elements. Please be patient will they progress."},
        {x: 5, y: 1, width: 2, height: 9, _type: "product", img: { src: "http://mos.oddberries.com/wp-content/uploads/2018/08/serena-rame-front-1-768x767.jpg", alt: "" }, title: "Serena", design: "Patricia Urquiola / FLOS", price: "£729-£1528" },
        {x: 3, y: 1, width: 2, height: 7, _type: "material", img: { src: "https://matterofstuff.com/wp-content/uploads/2019/05/material-rawearth-fuga-matteobrioni-matterofstuff20180910_0553.jpg", alt: "" }, title: "Fuga", design: "TerraTon" },
        {x: 4, y: 10, width: 2, height: 2, _type: "colour", hex: "9a95b5" },
        {x: 0, y: 0, width: 2, height: 6, _type: "file", format: "pdf", name: "History of Italian Design", image: { src: "https://cdn.shopify.com/s/files/1/1709/9537/products/100977_1024x1024.jpg?v=1508977616" } },
        {x: 0, y: 16, width: 3, height: 4},
        {x: 10, y: 0, width: 3, height: 2},
        {x: 6, y: 15, width: 5, height: 4, _type: "text", text: "Please Note: the drop shadows are temporary to see where the cards are, will reevaluate later." },
      ]
    },
    // autoProj()
    {
      title: 'My Not Cool Page',
      entities: [
        {x: 9, y: 3, width: 4, height: 2},
        {x: 4, y: 2, width: 4, height: 5},
        {x: 8, y: 5, width: 5, height: 5},
        {x: 1, y: 7, width: 2, height: 7},
        {x: 1, y: 3, width: 1, height: 2},
        {x: 0, y: 0, width: 2, height: 3},
        {x: 0, y: 3, width: 1, height: 2},
        {x: 10, y: 0, width: 3, height: 2}
      ]
    }
  ]
}

const fora_payload = {
  projects: [
    {
      title: '',
      entities: [
        {x: 4, y: 3, width: 5, height: 16, _type: "image", src: "https://pbs.twimg.com/profile_images/844519182024761349/SBh9U9bN.jpg", alt: "A banner image from the storefront" },
        {x: 3, y: 0, width: 7, height: 2, _type: "text", text: "Fora 42 Berners St Moodboard."},
        // {x: 5, y: 1, width: 2, height: 9, _type: "product", img: { src: "http://mos.oddberries.com/wp-content/uploads/2018/08/serena-rame-front-1-768x767.jpg", alt: "" }, title: "Serena", design: "Patricia Urquiola / FLOS", price: "£729-£1528" },
        // {x: 3, y: 1, width: 2, height: 7, _type: "material", img: { src: "https://matterofstuff.com/wp-content/uploads/2019/05/material-rawearth-fuga-matteobrioni-matterofstuff20180910_0553.jpg", alt: "" }, title: "Fuga", design: "TerraTon" },
        // {x: 4, y: 10, width: 2, height: 2, _type: "colour", hex: "9a95b5" },
        // {x: 0, y: 0, width: 2, height: 6, _type: "file", format: "pdf", name: "History of Italian Design", image: { src: "https://cdn.shopify.com/s/files/1/1709/9537/products/100977_1024x1024.jpg?v=1508977616" } },
      ]
    },
    {
      title: 'Matter of Stuff',
      entities: [
        {x: 0, y: 0, width: 13, height: 20, _type: "image", src: "https://matterofstuff.com/wp-content/uploads/2018/09/our-curated-design-shop-2000x944.jpg", alt: "A banner image from the storefront" },
      ]
    },
    {
      title: 'Page Two',
      entities: [
        {x: 4, y: 1, width: 6, height: 3, _type: "text", text: "Shapes and Inspiration"},
        {x: 1, y: 6, width: 3, height: 10, _type: "image", src: "https://cdn.mos.cms.futurecdn.net/U4BRsKHqqUrs3wcXVY49ub-768-80.jpg", alt: "A banner image from the storefront" },
        {x: 4, y: 6, width: 4, height: 10, _type: "image", src: "https://matterofstuff.com/wp-content/uploads/2018/09/our-curated-design-shop-2000x944.jpg", alt: "A banner image from the storefront" },
        {x: 8, y: 6, width: 4, height: 10, _type: "image", src: "https://matterofstuff.com/wp-content/uploads/2018/09/our-curated-design-shop-2000x944.jpg", alt: "A banner image from the storefront" },
        // {x: 0, y: 19, width: 1, height: 1, _type: "image", src: "", alt: "A banner image from the storefront" },
      ]
    },
    {
      title: 'Page Three',
      entities: [
        {x: 4, y: 1, width: 5, height: 3, _type: "text", text: "Shapes and Inspiration"},
        {x: 0, y: 4, width: 13, height: 13, _type: "image", src: "https://www.luxurylifestylemag.co.uk/wp-content/uploads/2019/08/19-0124151-IG-Creative-Collaboration.jpg", alt: "A banner image from the storefront" },
        // {x: 0, y: 19, width: 1, height: 1, _type: "image", src: "", alt: "A banner image from the storefront" },
      ]
    },
    {
      title: 'Page Four',
      entities: [
        {x: 2, y: 3, width: 3, height: 13, _type: "image", src: "https://www.extreme-design.co.uk/wp-content/uploads/2019/07/kitchen-design-trend-2019-colour-blocking-and-geometric-interior.jpg", alt: "A banner image from the storefront" },
        {x: 5, y: 3, width: 3, height: 13, _type: "image", src: "https://www.interiorsandsources.com/Portals/0/Images/2018-August/2020-trends/IS_SHAW_CALPE_2019_RGB.jpg", alt: "A banner image from the storefront" },
        {x: 8, y: 3, width: 3, height: 13, _type: "image", src: "https://de-production-media.s3.amazonaws.com/loft/3958/Moody_Colors.jpg", alt: "A banner image from the storefront" },
        // {x: 0, y: 19, width: 1, height: 1, _type: "image", src: "", alt: "A banner image from the storefront" },
      ]
    },
    {
      title: 'Page Five',
      entities: [
        {x: 4, y: 0, width: 5, height: 3, _type: "text", text: "Shample Board"},
        {x: 2, y: 4, width: 9, height: 15, _type: "image", src: "https://lodgingmagazine.com/wp-content/uploads/2019/05/Inclusivity_Palette_HR.jpg", alt: "A banner image from the storefront" },
        // {x: 0, y: 19, width: 1, height: 1, _type: "image", src: "", alt: "A banner image from the storefront" },
      ]
    },
    {
      title: 'Page Six',
      entities: [
        {x: 4, y: 0, width: 5, height: 3, _type: "text", text: "Furnature Sample Finishes"},
        {x: 4, y: 4, width: 5, height: 15, _type: "image", src: "https://static1.squarespace.com/static/56abdcec22482ec2414c1aba/59663453d2b8576106524218/5c479a7a4ae23759d4d4eb7f/1548197007245/office+design+trends%2C+2019%2C+Nashville%2C+interior+design%2C+color+schemes%2C+texture%2C+material%2C+company+culture.jpg?format=2500w", alt: "A banner image from the storefront" },
        {x: 0, y: 19, width: 1, height: 1, _type: "image", src: "", alt: "A banner image from the storefront" },
      ]
    },
    {
      title: 'Page Seven',
      entities: [
        {x: 4, y: 0, width: 5, height: 3, _type: "text", text: "Colour Moodboard"},
        {x: 1, y: 4, width: 4, height: 15, _type: "image", src: "https://essentialhome.eu/inspirations/wp-content/uploads/2018/08/Untitled-design-740x560.png", alt: "A banner image from the storefront" },
        {x: 5, y: 4, width: 3, height: 15, _type: "image", src: "https://www.livesouthshore.com/wp-content/uploads/ppg-color-of-the-year-2019-01.jpg", alt: "A banner image from the storefront" },
        {x: 8, y: 4, width: 4, height: 15, _type: "image", src: "https://cdn.interiorzine.com/wp-content/uploads/2018/02/interior-design-color-trends-2019-79.jpg", alt: "A banner image from the storefront" },
        // {x: 0, y: 19, width: 1, height: 1, _type: "image", src: "", alt: "A banner image from the storefront" },
      ]
    },
    {
      title: 'Lower Ground Floor',
      entities: [
        {x: 0, y: 0, width: 3, height: 2, _type: "text", text: "Roll out early Jully"},
        {x: 0, y: 3, width: 3, height: 8, _type: "image", src:  "https://www.sacredpixel.com/wp-content/uploads/2019/07/%20family%20opractic-business-plan-pdf-services-template-%20e2%2080%2093-guiaubuntupt-org%20--1024x1321.jpg", alt: "A banner image from the storefront" },
        {x: 3, y: 6, width: 1, height: 3, _type: "colour", hex: "6b7d77" },
        {x: 3, y: 3, width: 3, height: 3, _type: "image", src:  "https://dwg.cizimokulu.com/wp-content/uploads/2018/12/chair-A-Tolix-in-elevation-660x329.jpg", alt: "A banner image from the storefront" },
        {x: 9, y: 1, width: 4, height: 6, _type: "image", src:  "https://www.elreytuqueque.com/wp-content/uploads/2018/07/interior-design-trends-for-autumn-2017-that-are-out-in-2018-winter-7-top-home-improvement-glamorous.jpg", alt: "A banner image from the storefront" },
        {x: 0, y: 11, width: 1, height: 3, _type: "image", src:  "https://matterofstuff.com/wp-content/uploads/2019/02/Paper_Factor_WorkBook_1-017-686x1024.jpg", alt: "A banner image from the storefront" },
        {x: 0, y: 14, width: 1, height: 3, _type: "image", src:  "https://matterofstuff.com/wp-content/uploads/2019/02/Veins_concrete_paper_pulp_ruts2-600x423.jpg", alt: "A banner image from the storefront" },
        {x: 0, y: 17, width: 1, height: 3, _type: "image", src:  "https://matterofstuff.com/wp-content/uploads/2019/02/Blue-Veins-Medium-600x900.jpg", alt: "A banner image from the storefront" },
        {x: 1, y: 11, width: 2, height: 9, _type: "image", src:  "http://ourstorycreative.com/wp-content/uploads/2019/03/Our_Story_Creative_Artisan_Atelier_Editorial-86-1.jpg", alt: "A banner image from the storefront" },
        {x: 5, y: 11, width: 2, height: 9, _type: "product", img: { src: "https://matterofstuff.com/wp-content/uploads/2019/06/Mariolina_miniforms-blue-1300x1300.jpg", alt: "A banner image from the storefront" }, title: "Mariolina Chair", design: "Miniforms", price: "Price On Request" },
        {x: 3, y: 11, width: 2, height: 9, _type: "product", img: { src: "https://matterofstuff.com/wp-content/uploads/2019/06/Mariolina_2-1-1300x1300.jpg", alt: "A banner image from the storefront" }, title: "Mariolina Chair", design: "Miniforms", price: "Price On Request" },
        {x: 11, y: 19, width: 1, height: 1, _type: "image", src: "", alt: "A banner image from the storefront" },
      ]
    },
    {
      title: 'Lower Ground Floor',
      entities: [
        {x: 0, y: 0, width: 3, height: 2, _type: "text", text: "Lead Time 60 Days"},
        {x: 0, y: 2, width: 2, height: 8, _type: "image", src:  "https://www.sacredpixel.com/wp-content/uploads/2019/07/%20family%20opractic-business-plan-pdf-services-template-%20e2%2080%2093-guiaubuntupt-org%20--1024x1321.jpg", alt: "A banner image from the storefront" },
        {x: 7, y: 4, width: 6, height: 7, _type: "image", src:  "https://www.bauline.it/wp/wp-content/uploads/2016/07/Tavolo-bauline-minuetto-4-800x549.jpg", alt: "A banner image from the storefront" },
        {x: 7, y: 11, width: 6, height: 7, _type: "image", src:  "https://www.bauline.it/wp/wp-content/uploads/2016/07/Tavolo-bauline-minuetto-6-800x539.jpg", alt: "A banner image from the storefront" },
        {x: 4, y: 4, width: 3, height: 14, _type: "image", src:  "https://www.bauline.it/wp/wp-content/uploads/2016/07/Tavolo-bauline-minuetto-2-800x655.jpg", alt: "A banner image from the storefront" },
        {x: 0, y: 10, width: 3, height: 5, _type: "text", text: "3x Minuetto Console: https://www.bauline.it/en/products/minuetto/ Dimension \n(LxPxH): Closed cm 140x48x76 \nOpen cm 140x300x76 \nn° 05 external leaves, 50 cm \nCOD06 Light Oak"},
        {x: 0, y: 15, width: 3, height: 4, _type: "material", img: { src: "https://matterofstuff.com/wp-content/uploads/2019/04/Hand-Planed-1024x1022.jpg", alt: "" }, title: "Light Oak", design: "This guy" },
        {x: 0, y: 19, width: 1, height: 1, _type: "image", src: "", alt: "A banner image from the storefront" },
      ]
    },
  ]
}

module.exports = {
  sampleProducts,
  proto_one_items,

  default_payload,
  fora_payload
}
