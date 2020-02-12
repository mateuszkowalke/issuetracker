/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  mongoose.connect(CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology: true});

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
      console.log("Connection to mongoDB Successful!");
  });

  const projectSchema = new mongoose.Schema({
    _id: ObjectId,
    issue_title: String,
    issue_text: String,
    created_by: String,
    assigned_to: String,
    status_text: String,
    open: Boolean,
    created_on: Date,
    updated_on: Date
  });
  const PROJECT = mongoose.model("PROJECT", projectSchema);

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      PROJECT.find(req.body, (err, docs) => {
        if (err) return console.log(err);
        res.send(docs);
      })
    })
    
    .post(function (req, res){
      if (!(["issue_title", "issue_text", "created_by"].every((item) => Object.getOwnPropertyNames(req.body).includes(item)))) return res.json({error: "required field not filled in"});
      const id = req.body.hasOwnProperty("_id") ? req.body._id : ObjectId();
      const newEntry = new PROJECT({
        _id: id,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.hasOwnProperty("assigned_to") ? req.body.assigned_to : "",
        status_text: req.body.hasOwnProperty("status_text") ? req.body.status_text : "",
        open: true,
        created_on: new Date(),
        updated_on: new Date()
      });
      newEntry.save((err, data) => err ? console.log(err) : data);
      return res.json({
        _id: new ObjectId,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.hasOwnProperty("assigned_to") ? req.body.assigned_to : "",
        status_text: req.body.hasOwnProperty("status_text") ? req.body.status_text : "",
        open: true,
        created_on: new Date(),
        updated_on: new Date()
      });
    })
    
    .put(function (req, res){
      if (!req.body.hasOwnProperty("_id")) return res.send("no updated field sent");
      const toUpdate = PROJECT.findById(req.body._id, (err, doc) => {
        if (err) return console.log(err);
        if (!doc) return res.send("could not update " + req.body._id);
        for (let param in req.body) {
          doc[param] = req.body[param];
        }
        doc.updated_on = new Date();
        doc.save((err, data) => err ? console.log(err) : data);
        res.send("successfully updated");
      });
      if (!toUpdate) res.send("no updated field sent");
    })
    
    .delete(function (req, res){
      if (!req.body.hasOwnProperty("_id")) return res.send("_id error");
      const toDelete = PROJECT.findById(req.body._id, (err, doc) => {
        if (err) return console.log(err);
        if (!doc) return res.send("could not delete " + req.body._id);
        PROJECT.deleteOne({_id: req.body._id}, (err, data) => err ? console.log(err) : data);
        res.send("deleted " + req.body._id);
      });
    });
    
};
