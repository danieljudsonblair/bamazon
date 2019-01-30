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

}

function addToInv() {

}

function exit() {
    connection.end();
} 