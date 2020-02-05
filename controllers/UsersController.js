var User = require('../models/User')
const md5 = require('md5')
var { ValidationError } = require('objection')

module.exports = {
  get: async function(req, res) {
    let user = null
    if(req.query.except) {
      user = await User.query()
        .withGraphFetched(`[message, avatar]`)
        .modifyGraph('message', builder => {
          builder.where('receiver_id', req.query.except)
          builder.where('read_at', null)
        })
        .whereNot({
          id: req.query.except
        })
    } else {
      user = await User.query()
    }

    if(user) {
      res.jsonData(200, "Success", user);
    } else {
      res.jsonStatus(400, "Failed");
    }
  },

  find: async function(req, res) {
    const user = await User.query().findById(req.params.id);
    if(user) 
      res.jsonData(200, "Success", user);

    res.jsonStatus(404, "Resource not found.");
  },

  store: async function(req, res) {
    try {
      await User.query()
        .insert({
          name: req.body.name,
          email: req.body.email,
          username: req.body.username,
          password: md5(req.body.password),
          active: req.body.active
        });
      
      res.jsonStatus(200, "Success");
    } catch (err) {
      if(err instanceof ValidationError) {
        res.jsonError(302, "Validation error.", err.data);
      }
      
      res.jsonData(500, "Server error.", err.message);
    }
  },

  update: async function(req, res) {
    try {
      let user = await User.query()
        .patchAndFetchById(req.params.id, {
          name: req.body.name,
          email: req.body.email,
          username: req.body.username,
          // password: md5(req.body.password),
          // active: req.body.active
        });

      if(! user) res.jsonStatus(404, "Resource not found.");
      
      res.jsonStatus(200, "Success.");
    } catch (err) {
      if(err instanceof ValidationError) {
        res.jsonError(302, "Validation error.", err.data);
      }

      res.jsonError(500, "Server error.", err.message);
    }
  },

  toggleActivate: async function(req, res) {
    let user = await User.query()
      .findById(req.params.id);

    if(!user) res.jsonStatus(404, "Resource Not Found.");

    await User.query()
      .patch({
        active: !user.active
      })
      .findById(user.id);

    res.jsonStatus(200, "Success.");
  },

  delete: async function(req, res) {
    await User.query()
      .deleteById(req.params.id);

    res.jsonStatus(200, "Success.");
  },

  profileFromToken: (req, res) => {
    res.json({
      auth: req.auth()
    })
  }, 
}