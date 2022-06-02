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
  title: String,
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

      if (!req.body.title || req.body.title == undefined) {
        res.send("missing required field title");
        return;
      }

      // Creating and saving the Book from the posted title
      const book = new Book({
        title: title,
        comments: [],
      }).save(function (err, doc) {
        if (err) return console.log("An error occured when saving the Book");
        res.json({
          title: doc.title,
          _id: doc._id,
        });
        return;// console.log(doc.title + " - created !");
      });
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
      Book.deleteMany({}, (err, result) => {
        if (err) {
          res.send("Failed to drop the Books database !");
          return console.log("Failed to drop the Books database !");
        }

        res.send("complete delete successful");
        return console.log(result);
      });
    });

  app
    .route("/api/books/:id")
    .get(function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      Book.findOne({ _id: bookid })
        .select("_id title comments")
        .exec((err, book) => {
          if (err) {
            res.send("no book exists");
            return;
          }

          res.json(book);
          return;
        });
    })

    .post(function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      console.log(bookid, comment);

      if (!comment || comment == undefined) {
        res.send("missing required field comment");
        return console.log("no comment !");
      }

      Book.findOne({ _id: bookid }, function (err, book) {
        if (err) {
          res.send("no book exists");
          return console.log("no book exists");
        }

        book.comments.push(comment);
        book.save(function (err, updatedDoc) {
          if (err) {
            return console.log("Error occured while saving the updated Book");
          }
          res.json({
            title: updatedDoc.title,
            _id: updatedDoc._id,
            comments: updatedDoc.comments,
          });
          return console.log(updatedDoc.title + " - updated !");
        });
      });
    })

    .delete(function (req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'

      Book.deleteOne({ _id: bookid }, (err, result) => {
        if (err) {
          res.send("no book exists");
          return console.log("No Book Found !");
        }

        res.send("delete successful");
        return console.log(result);
      });
    });
};
