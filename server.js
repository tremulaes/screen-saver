const express = require('express');

const app = express();

app.use(express.json());

app.get('/', (req, res) => res.status(200).json({message: 'Hello worlddd'}));
app.use(express.static('public'));

let server;
module.exports = {
  start(port) {
    server = app.listen(port, () => {
      console.log(`App started on port ${port}`);
    });
    return app;
  },
  stop() {
    server.close();
  }
};
