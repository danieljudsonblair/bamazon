require("dotenv").config();
var mysql = require("mysql");
var inquirer = require("inquirer");
var connection = mysql.createConnection({  
  host: "localhost",
  port: 3306,
  user: "root",
  password: process.env.PSWD,
  database: "bamazon_db"
});

connection.connect(function(err) {
    if (err) throw err;
    displayProducts();
  });

  function displayProducts() {
    connection.query("SELECT item_id, product_name, price FROM products",function(err,res) {
        if (err) throw err;
        console.table(res);
        placeOrder();
    })
}

function placeOrder() {
  inquirer
  .prompt([
    {
      name: "id",
      message: "Enter the ID number of the product you would like to buy: ",
      type: "input",
      validate: function(value) {
        return new Promise(function(resolve, reject) {
          connection.query("SELECT COUNT(item_id) AS id FROM products WHERE item_id = ?", value, function(err,res) {
            if (err) throw err;
            if (res[0].id === 1) {
              resolve(true);
            } else {
              resolve("Please enter a valid Item ID.");
            }
          });
        }).then(function(value) {
          return value;
        });
      }
    },
    {
      name: "qty",
      message: "Enter the number of units you would like to buy: ",
      type: "input",
      validate: function(val) {
        if (!isNaN(val)) {
          return true;
        } else {
          return "Please enter a number.";
        }
      }
    }
  ])
  .then(function(ans) { 
    connection.query("SELECT * FROM products WHERE item_id = ?", ans.id, function(err, res) {
      if (err) throw err;
      if (ans.qty <= res[0].stock_quantity) {
        var newQty = res[0].stock_quantity - ans.qty;
        connection.query("UPDATE products SET stock_quantity = ?  WHERE item_id = ?", [newQty, ans.id], function() {
          if (err) throw err;
          var totalPrice = res[0].price * ans.qty;
          console.log("Your Total is $" + totalPrice + " for " + ans.qty + " " + res[0].product_name);
          nextOrder();
        });
      } else {
        console.log("Insufficient quantity! (We're sold out)");
        nextOrder();
      }
    });
  });
}

function nextOrder () {
  inquirer
  .prompt({
    name: "yn",
    message: "Would you like to place another order?",
    type: "list",
    choices: ["YES", "N0"]
  })
  .then(function(ans) {
    if (ans.yn === "YES") {
      displayProducts();
    } else {
      connection.end();
    }
  });
}


