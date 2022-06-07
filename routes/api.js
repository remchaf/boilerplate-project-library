/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
// MongoDb && Mongoose
require("dotenv").config();
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const bookSchema = new Schema({
  _id: ObjectId,
  title: {type: String, required: true},
  comments: [String],
});
const Book = mongoose.model("Book", bookSchema);

module.exports = function (app) {
  app
    .route("/api/books")
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]

      Book.find({}, function (err, docsArr) {
        if (err) {
          res.json(["No book found !"]);
          return;
        }

        const Books = docsArr.reduce((accu, current) => {
          const obj = {};
          obj.title = current.title;
          obj._id = current._id;
          obj.commentcount = current.comments.length;
          accu.push(obj);
          return accu;
        }, []);
        res.json(Books);
      });
    })

    .post(function (req, res) {
      let title = req.body.title;
      const _id = req.body._id || ObjectId();

      if (!req.body.title || req.body.title == undefined) {
        res.send("missing required field title");
        return;
      }

      // Creating and saving the Book from the posted title
      const book = new Book({
        _id: _id,
        title: title,
        comments: [],
      }).save(function (err, doc) {
        if (err) return console.log("An error occured when saving the Book");
        res.json({
          title: doc.title,
          _id: doc._id,
        });
        return; // console.log(doc.title + " - created !");
      });
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
      Book.deleteMany({}, (err, result) => {
        if (err) {
          res.send("Failed to drop the Books database !");
          return;
        }

        res.send("complete delete successful");
        return;
      });
    });

  app
    .route("/api/books/:id")
    .get(function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      Book.findOne({ _id: bookid })
        .select("_id title comments")
        .exec((err, doc) => {
          if (err || doc == null) {
            res.send("no book exists");
            return;
          }

          res.json(doc);
          return;
        });
    })

    .post(function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;

      if (!comment || comment == undefined) {
        res.send("missing required field comment");
        return;
      }

      Book.findOne({ _id: ObjectId(bookid) }, function (err, book) { //*************** */
        if (err || book == null) {
          res.send("no book exists");
          return;
        }
 
        book.comments.push(comment);
        book.save(function (err, updatedDoc) { 
          if (err) {
            return;
          }
          res.json({
            title: updatedDoc.title,
            _id: updatedDoc._id,
            comments: updatedDoc.comments,
          });
          return;
        });
      });
    })

    .delete(function (req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'

      Book.deleteOne({ _id: bookid }, (err, result) => {
        if (err || result.deletedCount == 0) {
          res.send("no book exists");
          return;
        }

        res.send("delete successful");
        return;
      });
    });
};
