const router = require('express').Router();
let Login = require('../models/login.model.js');

router.route('/').get((req, res) => {
  const user_ = req.query.user;
  const pass_ = req.query.pass;

  Login.findOne({user: user_, pass: pass_}, (err, docs) => {
    if (err) {
      console.log('Error');
    } else if (!docs) {
      res.json(false);
    } else {
      res.json(true);
    }
  })
});

router.route('/add').post((req, res) => {
  const user = req.body.user;
  const pass = req.body.pass;

  const newLogin = new Login({user, pass});

  newLogin.save()
    .then(() => res.json('Login added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;