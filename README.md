# Matter of Stuff MoodBoard System

A custom built design and curration tool originaly built for Matter of Stuff.

Built to integrate with their existing site's content managment system, the tool enables collaboration with clients in a single, enclosed space, providing a frictionless and uninterupted workflow.

Using a slide-based presentation structure, users add content quickly and efficiently to an auto-snap grid. 

Content types inclde:
  - MOS Products
  - MOS Material Library Listings 
  - Internal and External Images
  - Colour swatches
  - Textboxes

The demo hosting uses dummy data and has no authentication or data persistance

## Live Demo
[https://oddert-mos-moodboard.glitch.me/](https://oddert-mos-moodboard.glitch.me/)

## Installation
```
$ git clone https://github.com/Oddert/mos_moodboard.git
$ cd mos_moodboard
$ npm i
```
### For development
```
$ npm run dev
```
### For a production build
```
$ npm start
```

## Scripts
| script | command                                        | action
|--------|------------------------------------------------|------------------------------------------------|
| start  | node app.js                                    | runs the server                                |
| server | nodemon app.js                                 | runs the server with auto restart              |
