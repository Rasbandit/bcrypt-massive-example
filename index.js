require('dotenv').config()

const app = require('express')(),
  bodyParser = require('body-parser'),
  massive = require('massive'),
  bcrypt = require('bcrypt');

app.use(bodyParser.json());

const saltRounds = 11;

massive(process.env.connection_string).then((db) => {
  app.set('db', db);
  app.listen(process.env.port, () => {
    console.log(`Ship docked at port ${process.env.port}`)
  });
})

app.post('/login', async (req, res) => {
  const user = await req.app.get('db').login(req.body.username);
  if (user[0]) { // if there is a matching user
    bcrypt.compare(req.body.password, user[0].password, function (err, response) {
      if (err) { //if there is an error
        console.log(err);
        res.status(500).send(err)
      } else if (response) { // if the passwords do match
        res.status(200).send()
      } else { // if the passwords do not match
        res.status(401).send()
      }
    });
  } else { // there is no matching user
    res.status(401).send()
  }
})

app.post('/register', (req, res) => {
  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(req.body.password, salt, async (err, hash) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      }
      try {
        await req.app.get('db').register(req.body.username, hash);
      } catch (err) {
        console.log(err);
        res.status(500).send(err);
      }
      res.status(200).send('u ben gisterd');
    });
  });
})
