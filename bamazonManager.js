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

menuPrompt();

function menuPrompt() {
inquirer
.prompt({
  name: "menu",
  message: "What would you like to do?",
  type: "list",
  choices: ["View Products", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
})
.then(function(ans) {
    switch(ans.menu) {
        case "Add New Product":
        addNewProd();
        break;
        case "View Products":
        viewProducts();
        break;
        case "View Low Inventory":
        viewLowInv();
        break;
        case "Add to Inventory":
        addToInv();
        break;
        case "Exit":
        exit();
        break;
    }

}).catch(function (err) {
  console.log(err);
});
}

function addNewProd() {
  inquirer
  .prompt([
  {
      name: "name",
      message: "What is the Name of the New Item?",
      type: "input"
  },
  {   
      name: "dept",
      message: "In which department should we list this item?",
      type: "input"
  },
  {
      name: "price",
      message: "What is the price per unit?",
      type: "input"
  }, 
  {
      name: "qty",
      message: "How many units are we adding?",
      type: "input"
  }
  ])
  .then(function(ans) {
      connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?,?,?,?)", [ans.name, ans.dept, ans.price, ans.qty], function(err) {
        if (err) throw err;
      })
      menuPrompt();
  })

}

function viewProducts() {
    connection.query("SELECT item_id, department_name, product_name, price, stock_quantity FROM products",function(err,res) {
        if (err) throw err;
        console.table(res);
        menuPrompt();
    })
}

function viewLowInv() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
        if (err) throw err;
        if (res.length !==0) {
        console.table(res);
        } else {
        console.log("There are no products with stock quantities less than 5");
        }
        menuPrompt();
});
}

function addToInv() {
    inquirer
    .prompt([
      {
        name: "id",
        message: "Enter the Item ID (NOT index) of the product you would like to add inventory: ",
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
          }).catch(function (err) {
            console.log(err);
          });
        }
      },
      {
        name: "qty",
        message: "Enter the number of units you would like to add to inventory: ",
        type: "input",
        validate: function(val) {
          if (!isNaN(val)) {
            return true;
          } else {
            return "Please enter a number.";
          }
        }
      }
    ]).then(function(ans) { 
        connection.query("SELECT stock_quantity, product_name FROM products WHERE item_id = ?", ans.id, function(err, res) {
            if (err) throw err;
            var newQty = parseInt(res[0].stock_quantity) + parseInt(ans.qty);
            connection.query("UPDATE products SET stock_quantity = ?  WHERE item_id = ?", [newQty, ans.id], function() {
            if (err) throw err;
            console.log("You just added " + ans.qty + " " + res[0].product_name + " to inventory");
            menuPrompt();
            })
        });
    }).catch(function (err) {
       console.log(err);
    });
}

function exit() {
    connection.end();
} 