'use strict'

const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const base64Img = require('base64-img');
const path = require('path');
const url = require('url');
const ejs = require('ejs');

const app = express();

app.set('views', 'views');  // Specify the folder to find templates
app.set('view engine', 'ejs');

app.use(bodyParser.json({
  limit: '50mb',
  type:'application/json',
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
}));

app.post('/upload', function(req, res) {
  base64Img.img(req.body.image, 'uploads/', Date.now(), function(err, filepath) {});
});



app.use('/serve', function(req, res) {
  //use the url to parse the requested url and get the image name
  var query = url.parse(req.url,true).query;
  var pic = query.image;
  var imageDir = 'uploads/'

  if (typeof pic === 'undefined') {
    getImages(imageDir, function (err, files) {
        var imageLists = '<ul>';
        var images = [];
        for (var i=0; i<files.length; i++) {
            // imageLists += '<li><img src="../' + imageDir + files[i] + '" width="200"></li>';
            // imageLists += '../' + imageDir + files[i];
            images.push('../' + imageDir + files[i]);
        }
        imageLists += '</ul>';
        // res.writeHead(200, {'Content-type':'text/html'});
        res.render('index', {images : images})
        res.end();
        // res.end(imageLists);
    });
  } else {
    //read the image using fs and send the image content back in the response
    fs.readFile(imageDir + pic, function (err, content) {
        if (err) {
            res.writeHead(400, {'Content-type':'text/html'})
            console.log(err);
            res.end("No such image");    
        } else {
            //specify the content type in the response will be an image
            res.writeHead(200,{'Content-type':'image/jpg'});
            res.end(content);
        }
    });
  }
})

function getImages(imageDir, callback) {
  var fileType = '.png',
      files = [], i;
  fs.readdir(imageDir, function (err, list) {
      for(i=0; i<list.length; i++) {
          if(path.extname(list[i]) === fileType) {
              files.push(list[i]); //store the file name into the array files
          }
      }
      callback(err, files);
  });
}

app.use('/uploads', express.static('uploads'));

app.use('/', express.static('pwa'))

app.use(express.static(__dirname + '/public'));

app.listen(3000, function (err) {
  if (err) {
    throw err
  }
  console.log('Server started on port 3000')
});
