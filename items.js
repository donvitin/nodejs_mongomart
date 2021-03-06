/*
  Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


function ItemDAO(database) {
    "use strict";

    this.db = database;

    this.getCategories = function(callback) {
        "use strict";

        
        
        var itemsPipeline = function(db, callback) {
            var collection = db.collection('item');
            collection.aggregate([    { $match: { "category":  { $exists: true } } },  
                                    { $project: {"_id": 0, "category": 1}}, 
                                    {$group: { _id : "$category", num: { $sum:1} }}, 
                                    {$sort: {"_id":1} } ], 
            function(err, categories) {
                assert.equal(err,null);
                console.log("Results lenghts: ", categories.length);
                
                var category = {
                    _id: "All",
                    num: 9999
                };
                
                var total_num = 0;
               
                categories.forEach(function(doc) {
                    console.log("doc ", doc.num,+" "+doc._id);
                     total_num += doc.num;
                });
                
                category.num = total_num;
                categories.unshift(category);
                console.log("Categories: ", categories.length);
               
                callback(categories);
            }
          );
        };
        itemsPipeline(this.db,callback);
       
    };


    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict";

        /*
         * TODO-lab1B
         *
         * LAB #1B: Implement the getItems() method.
         *
         * Create a query on the "item" collection to select only the items
         * that should be displayed for a particular page of a given category.
         * The category is passed as a parameter to getItems().
         *
         * Use sort(), skip(), and limit() and the method parameters: page and
         * itemsPerPage to identify the appropriate products to display on each
         * page. Pass these items to the callback function.
         *
         * Sort items in ascending order based on the _id field. You must use
         * this sort to answer the final project questions correctly.
         *
         * Note: Since "All" is not listed as the category for any items,
         * you will need to query the "item" collection differently for "All"
         * than you do for other categories.
         *
         */

        var findDocuments = function(db, category, page, itemsPerPage, callback) {
          // Get the documents collection
             var collection = db.collection('item');
             
             var cond = {};
            if (category !== "All") {
                  cond = {"category": category};
                 
            }
            // NUMBER_OF_ITEMS * (PAGE_NUMBER - 1)         
            console.log("Cond: ", cond);
             collection.find(cond).sort({"_id": 1}).skip(itemsPerPage * (page)).limit(itemsPerPage).toArray()
                .then(function(pageItems){
                
                console.log("num Of PAge Items: ", pageItems.length);
                console.log("Found the following records: ", pageItems);
                
                callback(pageItems);
                });
          
        };
        
        findDocuments(this.db,category, page, itemsPerPage,callback);
        // TODO-lab1B Replace all code above (in this method).

        // TODO Include the following line in the appropriate
        // place within your code to pass the items for the selected page
        // to the callback.
        // callback(pageItems);
    }; //end getItems


    this.getNumItems = function(category, callback) {
        "use strict";

        // var numItems = 0;

        /*
         * TODO-lab1C:
         *
         * LAB #1C: Implement the getNumItems method()
         *
         * Write a query that determines the number of items in a category
         * and pass the count to the callback function. The count is used in
         * the mongomart application for pagination. The category is passed
         * as a parameter to this method.
         *
         * See the route handler for the root path (i.e. "/") for an example
         * of a call to the getNumItems() method.
         *
         */

         // TODO Include the following line in the appropriate
         // place within your code to pass the count to the callback.
         
         var findCount= function(db, category, callback) {
          // Get the documents collection
            console.log("CAt: ", category);
            var cond = {};
            if (category !== "All") {
                  cond = {"category": category};
             }
            console.log("Cond: ",cond);
             var collection = db.collection('item');
             
             
             collection.find(cond).count()
              .then(function(numItems) {
                  console.log("Num of GetItems: ",numItems); 
                  callback(numItems);
            });
            
         };
    
        findCount(this.db,category,callback);
    };


    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict";

        /*
         * TODO-lab2A
         *
         * LAB #2A: Implement searchItems()
         *
         * Using the value of the query parameter passed to searchItems(),
         * perform a text search against the "item" collection.
         *
         * Sort the results in ascending order based on the _id field.
         *
         * Select only the items that should be displayed for a particular
         * page. For example, on the first page, only the first itemsPerPage
         * matching the query should be displayed.
         *
         * Use limit() and skip() and the method parameters: page and
         * itemsPerPage to select the appropriate matching products. Pass these
         * items to the callback function.
         *
         * searchItems() depends on a text index. Before implementing
         * this method, create a SINGLE text index on title, slogan, and
         * description. You should simply do this in the mongo shell.
         *
         */

        
        var findDocuments = function(db, query, page, itemsPerPage, callback) {
              // Get the documents collection
              var collection = db.collection('item');
              // Find some documents
              collection.find({ '$text': {'$search' : query } } ).sort({"_id": 1}).skip(itemsPerPage * (page)).limit(itemsPerPage).toArray()
              .then(function(items) {
                console.log("Found the following records",  items);
                console.log("Items count: ", items.length);
                callback(items);  
              });
        };

        findDocuments(this.db,query,page,itemsPerPage,callback);
        // TODO-lab2A Replace all code above (in this method).

        // TODO Include the following line in the appropriate
        // place within your code to pass the items for the selected page
        // of search results to the callback.
        //callback(items);
    };


    this.getNumSearchItems = function(query, callback) {
        "use strict";

        //var numItems = 0;

        /*
        * TODO-lab2B
        *
        * LAB #2B: Using the value of the query parameter passed to this
        * method, count the number of items in the "item" collection matching
        * a text search. Pass the count to the callback function.
        *
        * getNumSearchItems() depends on the same text index as searchItems().
        * Before implementing this method, ensure that you've already created
        * a SINGLE text index on title, slogan, and description. You should
        * simply do this in the mongo shell.
        */
       
         var findTxtCount = function(db, query, callback) {
              // Get the documents collection
              var collection = db.collection('item');
              // Find some documents
              collection.find({ '$text': {'$search' : query } } ).count()
              .then(function(numitems) {
                console.log("Items count: ", numitems);
                callback(numitems);  
              });
        };

        findTxtCount(this.db,query,callback);
        
    };


    this.getItem = function(itemId, callback) {
        "use strict";
         var findItem = function(db, itemId, callback) {
          // Get the documents collection
             var collection = db.collection('item');
             console.log("Item ID:", itemId);
   
              collection.findOne({"_id": itemId}, function(err,item) { 
                  assert.equal(err,null);
                  console.log("ItemID: ", item._id);
                  console.log("Item Name: ", item.title);
                  callback(item);
              }); 
            
        };
        
        findItem(this.db,itemId,callback);        

    };


    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };


    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict";

        /*
         * TODO-lab4
         *
         * LAB #4: Implement addReview().
         *
         * Using the itemId parameter, update the appropriate document in the
         * "item" collection with a new review. Reviews are stored as an
         * array value for the key "reviews". Each review has the fields:
         * "name", "comment", "stars", and "date".
         *
         */

        // var reviewDoc = {
        //     name: name,
        //     comment: comment,
        //     stars: stars,
        //     date: Date.now()
        // }
        // var doc = this.createDummyItem();
        // doc.reviews = [reviewDoc];
        
             var UpdateReviews = function(db, itemId, comment, name, stars, callback) {
                var collection = db.collection('item');
                console.log("Item ID:", itemId);
                
                var myquery = { "_id": itemId  };
                 console.log("myquery:", myquery);
                
                var reviewDoc = {
                    name: name,
                    comment: comment,
                    stars: stars,
                    date: Date.now()
                };
                
                var newvalues = { $addToSet: {"reviews": reviewDoc }};
                console.log("newvalues",newvalues);
                
                collection.updateOne(myquery, newvalues, function(err, doc) {
                    assert.equal(err, null);
                    console.log("1 document updated");
                    console.log(doc.result.nModified);
                    console.log(doc);
                    callback(doc);
                });
             };   
            
            UpdateReviews(this.db, itemId, comment, name, stars, callback);
    };
  

    this.createDummyItem = function() {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            reviews: []
        };

        return item;
    };
}


module.exports.ItemDAO = ItemDAO;
