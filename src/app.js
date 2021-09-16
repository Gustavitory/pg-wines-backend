const path = require('path');
const multer = require('multer');
require('dotenv').config();
const routes = require('./routes');

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
// Settings for let access the localhost:3000 front-end app (using cors middleware)
const config = {
  application: {
      cors: {
          server: [
              {
                  origin: "*", //servidor que deseas que consuma o (*) en caso que sea acceso libre
                  credentials: true
              }
          ]
      }
  }
};

const imageStorage = multer.diskStorage({
  destination: path.join(__dirname, '../client/images'),
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const server = express();
server.name = 'delsur-api';

server.set('json spaces', 2);
// Middlewares
server.use(cors(
  config.application.cors.server
));
server.use(express.json());
server.use(morgan('dev'));

server.use(multer({
  storage: imageStorage,
  dest: path.join(__dirname, '../client/images'),
  limits: { fileSize: 2097152 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(file.originalname);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb("Error: Image must be an image file type (Supported formats are JPEG, JPG, PNG, GIF).");
  }
}).single('image'));

server.use(express.static(path.join(__dirname, '../client')));

// if (process.env.NODE_ENV === "production") {
//   server.use(express.static(path.join(__dirname, "../client")));
// }

server.use('/', routes);

module.exports = server;
