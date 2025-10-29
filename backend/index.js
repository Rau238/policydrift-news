const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded());


app.use((req, res, next) => {
  console.log('Hello from the backend server!', req.url, req.method);
  next();
});

app.use((req, res) => {
  console.log('Request received at backend server', req.url, req.method);
  res.send('Hello from the backend server!');
});

const server = http.createServer(app);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});