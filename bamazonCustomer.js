var mysql = require("mysql");
var inquirer = require("inquirer");
var divider = "--------------------------------------------"
// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: process.env.PSWD,
  database: "bamazon_db"
});

connection.connect(function(err) {
    if (err) throw err;
    displayProducts();
  });

  function displayProducts() {
    connection.query("SELECT * FROM products",function(err,res) {
        if (err) throw err;
        console.log(divider);
        res.map(i => console.log("Item ID: " + i.item_id + ", Item: " + i.product_name + ", Price: $" + i.price + "\n" + divider));
        connection.end(); 

    })
}