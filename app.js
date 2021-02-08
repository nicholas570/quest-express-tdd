// app.js
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const connection = require('./connection');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello World!' });
});

app.get('/bookmarks/:id', (req, res) => {
  connection.query(
    'SELECT * FROM bookmark WHERE id = ?',
    [req.params.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ err });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: 'Bookmark not found' });
      }

      return res.status(200).json(result[0]);
    }
  );
});

app.post('/bookmarks', (req, res) => {
  if (!req.body.url || !req.body.title) {
    return res.status(422).json({ error: 'required field(s) missing' });
  }
  connection.query('INSERT INTO bookmark SET ?', [req.body], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    return connection.query(
      'SELECT * FROM bookmark WHERE id = ?',
      [result.insertId],
      (error, records) => {
        if (err) {
          return res.status(500).json(error);
        }
        return res.status(201).json(records[0]);
      }
    );
  });
});

module.exports = app;
