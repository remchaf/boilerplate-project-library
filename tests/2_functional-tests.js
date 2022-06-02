/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const Browser = require("zombie");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  const browser = new Browser();
  browser.site = "localhost:3000";

  suiteSetup(function (done) {
    return browser.visit("/", done);
  });
    var id;
    this.beforeAll(function (done) {
      chai
        .request(server)
        .post("/api/books")
        .send({
          title: "coucou",
        })
        .end(function (err, res) {
          id = res.body._id;
          console.log(id);
          done();
        });
    });
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  // test("#example Test GET /api/books", function (done) {
  //   chai
  //     .request(server)
  //     .get("/api/books")
  //     .end(function (err, res) {
  //       assert.equal(res.status, 200);
  //       assert.isArray(res.body, "response should be an array");
  //       assert.property(
  //         res.body[0],
  //         "commentcount",
  //         "Books in array should contain commentcount"
  //       );
  //       assert.property(
  //         res.body[0],
  //         "title",
  //         "Books in array should contain title"
  //       );
  //       assert.property(
  //         res.body[0],
  //         "_id",
  //         "Books in array should contain _id"
  //       );
  //       done();
  //     });
  // });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function () {

    suite(
      "POST /api/books with title => create book object/expect book object",
      function () {
        test("#1 - Test POST /api/books with title", function (done) {
          chai
            .request(server)
            .post("/api/books")
            .send({
              title: "my legendary book",
            })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.property(res.body, "_id");
              assert.property(res.body, "title");
              assert.equal(res.body.title, "my legendary book");
              done();
            });
        });

        test("#2 - Test POST /api/books with no title given", function (done) {
          chai
            .request(server)
            .post("/api/books")
            .send({title: ""})
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "missing required field title");
              done();
            });
        });
      }
    );

    suite("GET /api/books => array of books", function () {
      test("#3 - Test GET /api/books", function (done) {
        chai
          .request(server)
          .get("/api/books")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(
              res.body,
              "A get request to /api/books should return an array"
            );
            assert.property(
              res.body[0],
              "title",
              "Every book should have title property"
            );
            assert.property(
              res.body[0],
              "_id",
              "Every book should have an _id property"
            );
            assert.property(
              res.body[0],
              "commentcount",
              "Every book should have a commentcount property"
            );
            done();
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function () {
      test("#4 - Test GET /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .get("/api/books/randomidnotindb")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");
            done();
          });
      });

      test("#5 - Test GET /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .get("/api/books/" + id)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, "_id");
            assert.property(res.body, "title");
            assert.typeOf(res.body.comments, "array");
            done();
          });
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function () {
        test("#6 - Test POST /api/books/[id] with comment", function (done) {
          chai
            .request(server)
            .post("/api/books/" + id)
            .send({
              comment: "new comment",
            })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.property(res.body, "_id");
              assert.property(res.body, "title");
              assert.typeOf(res.body.comments, "array");
              done();
            });
        });

        test("#7 - Test POST /api/books/[id] without comment field", function (done) {
          chai
            .request(server)
            .post("/api/books/" + id)
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "missing required field comment");
              done();
            });
        });

        test("#8 - Test POST /api/books/[id] with comment, id not in db", function (done) {
          chai
            .request(server)
            .post("/api/books/faeigbergnjofvlnefbvj")
            .send({ comment: "kjkbsefn" })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "no book exists");
              done();
            });
        });
      }
    );

    suite("DELETE /api/books/[id] => delete book object id", function () {
      test("#9 - Test DELETE /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .delete("api/books/" + id)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "delete successful");
            done();
          });
      });

      test("#10 - Test DELETE /api/books/[id] with  id not in db", function (done) {
        chai
          .request(server)
          .delete("/api/books/idnotindb")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");
            done();
          });
      });
    });
  });
});
