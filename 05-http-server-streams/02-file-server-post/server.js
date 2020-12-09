const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();
const limitSizeStream = new LimitSizeStream({limit: 2 ** 20});

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      writeFileToServer(req, res, pathname, filepath);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

function writeFileToServer(req, res, pathname, filepath) {
  if (pathname.includes('/') || pathname.includes('..')) {
    res.statusCode = 400;
    res.end('Subfolders are not supported');

    return;
  }

  const folder = path.join(__dirname, 'files');

  fs.stat(folder, (error, stat) => {
    if (stat) {
      createFile(filepath, req, res);

      return;
    }

    if (error.code === 'ENOENT') {
      fs.mkdir('files', () => {
        createFile(filepath, req, res);
      });
    } else {
      res.statusCode = 500;
      res.end('Something went wrong');

      return;
    }
  });
}

function createFile(filepath, req, res) {
  fs.stat(filepath, (error, stats) => {
    if (stats) {
      res.statusCode = 409;
      res.end('File is exists');

      return;
    }

    const writeStream = fs.createWriteStream(filepath);

    writeStream.on('error', () => {
      res.statusCode = 500;
      res.end('Something went wrong');
    });

    limitSizeStream.on('error', (error) => {
      res.statusCode = 413;
      res.end(error.message);

      removeFileByPath(filepath);
    });

    req.on('error', () => {
      res.statusCode = 500;
      res.end('Something went wrong');
    });

    req.on('end', () => {
      res.statusCode = 201;
      res.end();
      console.log('end');
    });

    res.on('close', () => {
      if (res.finished) {
        return;
      }

      writeStream.destroy();
      removeFileByPath(filepath);
    });

    req
      .pipe(limitSizeStream)
      .pipe(writeStream);
  });
}

function removeFileByPath(path) {
  fs.unlink(path, () => {});
}

module.exports = server;
