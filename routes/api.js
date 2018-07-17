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

const DATABASE = process.env.DATABASE; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  
  // APITEST
  app.route('/api/issues/:project')

    .get(function (req, res) {
        let project = req.params.project;
        let query = req.query || {};


        MongoClient.connect(DATABASE, function (err, db) {
            db.collection(project).find(query).toArray((err, issues) => {
                if (err) console.log(err);
                res.json(issues);
            })
            db.close();
        })
    })

  
  
    .post(function (req, res){
    
        if( !req.body.issue_title || !req.body.issue_text || !req.body.created_by ) return res.send("Required fields cannot be left empty.");

        // Issue Object
        let issueObject = {};
        let project = req.params.project;
        issueObject.issue_title = req.body.issue_title;
        issueObject.issue_text = req.body.issue_text;
        issueObject.created_by = req.body.created_by;
        issueObject.assigned_to = req.body.assigned_to || '';
        issueObject.status_text = req.body.status_text || '';
        issueObject.created_on = new Date().toISOString();
        issueObject.updated_on = new Date().toISOString();
        issueObject.open = 'true';
        
        // Check if Issue already Exists
        MongoClient.connect(DATABASE, function(err, db) {
 
          // If not create a new Issue
          db.collection(project).insert(issueObject, (err, doc) => {
              if (err) { console.log("ERR: " + err); db.close(); }
              else {
                  let json = [{
                      "_id": issueObject._id,
                      "issue_title": issueObject.issue_title,
                      "issue_text": issueObject.issue_text,
                      "created_on": issueObject.created_on,
                      "updated_on": issueObject.updated_on,
                      "created_by": issueObject.created_by,
                      "assigned_to": issueObject.assigned_to,
                      "open": issueObject.status,
                      "status_text": issueObject.status_text
                  }]
                  db.close();
                  return res.json(json);
              }
            
          }) // db
        }); // mongo
      })
 

    .put(function (req, res) {
      // Create update object
      let update = {};
      let project = req.params.project;

      // Check Valid Input
      if (req.body._id.length != 24) return res.send(`Could not update ${req.body._id}`);

      // Find by ID
      MongoClient.connect(DATABASE, function(err, db) {
          db.collection(project).find({ _id: ObjectId(req.body._id) }).toArray((err, issue) => {
              if (err || issue.length == 0) { console.log(err); return res.send(`Could not update ${req.body._id}.`); }
              else if (issue) {
                  // Assign issue
                  issue = issue[0];

                  // Create new Update Object
                  Object.keys(issue).forEach(key => {
                      update[key] = issue[key];
                  })

                  /// Get request body object
                  let count = 0;
                  if (req.body.issue_title && req.body.issue_title !== '') { update.issue_title = req.body.issue_title; count++ };
                  if (req.body.issue_text && req.body.issue_text !== '') { update.issue_text = req.body.issue_text; count++ };
                  if (req.body.created_by && req.body.created_by !== '') { update.created_by = req.body.created_by; count++ };
                  if (req.body.assigned_to && req.body.assigned_to !== '') { update.assigned_to = req.body.assigned_to; count++ };
                  if (req.body.status_text && req.body.status_text !== '') { update.status_text = req.body.status_text; count++ };
                  if (req.body.open) { update.open = req.body.open; count++ };
                  update.updated_on = new Date().toISOString();

                  // If fields have changed
                  if (count > 0) {
                      db.collection(project).updateOne({ _id: ObjectId(req.body._id) }, update, (err, response) => {
                          if (err) { console.log("ERR: " + err); throw err; }
                          else if (response && response.modifiedCount == 0) return res.send(`Could not update ${req.body._id}`);
                          else if (response) return res.send('successfully updated');
                      });
                  }
                  // If nothing changed dont update
                  else { return res.send(`no updated field sent`); }
                  db.close();
              }
          }) // end db.collection
        })
      }) // End Put





  
    .delete (function (req, res) {
      let project = req.params.project;

      if (req.body._id.length != 24 || req.body._id == undefined) {return res.send('_id error')}

      MongoClient.connect(DATABASE, function (err, db) {
          db.collection(project).deleteOne({ _id: ObjectId(req.body._id) }, (err, response) => {
              if (err || response.deletedCount == 0) {
                  console.log(err);
                  return res.send(`failed: 'could not delete' ${req.body._id}`);
              }
              else if (response) {
                  return res.send(`success: 'deleted' ${req.body._id}`);
              }
          });
          db.close();
      })
    })

} // End App Export
      

