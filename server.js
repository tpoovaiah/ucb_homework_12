var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Daruma340912",
  database: "employee_tracker_DB",
});

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;
  start();
});

// function which prompts the user for what action they should take
const start = () => {
  inquirer
    .prompt({
      name: "todo",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View All Employees",
        "View All Employees by Department",
        "View All Employees by Manager",
        "Add Employee",
        "Remove Employee",
        "Update Employee Role",
        "Update Employee Manager",
        "View All Roles",
        "Add Role",
        "Remove Role",
      ],
    })
    .then((answer) => {
      switch (answer.todo) {
        case "View All Employees":
          return viewAllEmployees();
        case "View All Employees by Department":
          return viewByDepartment();
        case "View All Employees by Manager":
          return console.log("You are looking at all employees by Manager!");
        case "Add Employee":
          return addEmployee();
        case "Remove Employee":
          return console.log("You are looking at Remove Employee!");
        case "Update Employee Role":
          return console.log("You are looking at Update Employee Role!");
        case "Update Employee Manager":
          return console.log("You are looking at Update Employee Manager!");
        case "View All Roles":
          return console.log("You are looking at View All Roles!");
        case "Add Role":
          return console.log("You are looking at Add Role!");
        case "Remove Role":
          return console.log("You are looking at Remove Role!");
        default:
          throw "Unknown Request";
      }
    })
    .catch((err) => {
      if (err) {
        console.log("Error: ", err);
      }
    });
};

//function to View All Employees
const viewAllEmployees = () => {
  connection.query("SELECT * FROM employees", (err, results) => {
    if (err) throw err;
    console.table(results);
    start();
  });
};

//function to view all employees by department
const viewByDepartment = () => {
  const departmentArray = [];

  connection.query("SELECT name FROM department", (err, results) => {
    if (err) throw err;
    results.forEach((el) => {
      departmentArray.push(el.name);
    });

    inquirer
      .prompt({
        name: "byDepartment",
        type: "list",
        message: "Which department would you like to view?",
        choices: departmentArray,
      })
      .then((answer) => {
        let query =
          "SELECT first_name, last_name FROM employees INNER JOIN role ON (employees.role_id = role.id) INNER JOIN department ON (role.department_id = department.id) WHERE (department.name = ? AND employees.role_id = role.id AND role.department_id = department.id)";

        connection.query(query, [answer.byDepartment], (err, results) => {
          if (err) throw err;
          console.table(results);
          start();
        });
      });
  });
};

//function to add employees
const addEmployee = () => {
  const roleArray = [];
  const managerArray = ["No Manager"];

  connection.query("SELECT title FROM role", (err, results) => {
    if (err) throw err;
    results.forEach((el) => {
      roleArray.push(el.title);
    });
  });

  connection.query(
    "SELECT first_name, last_name FROM employees WHERE (employees.manager_id = 0)",
    (err, results) => {
      if (err) throw err;
      results.forEach((el) => {
        const stringName = el.first_name + " " + el.last_name;
        managerArray.push(stringName);
      });

      inquirer
        .prompt([
          {
            name: "addFirstName",
            type: "input",
            message: "What is the employee's first name?",
          },
          {
            name: "addLastName",
            type: "input",
            message: "What is the employee's last name?",
          },
          {
            name: "addRole",
            type: "list",
            message: "What is the employee's role?",
            choices: roleArray,
          },
          {
            name: "addManager",
            type: "list",
            message: "Who is the employee's manager?",
            choices: managerArray,
          },
        ])
        .then((answer) => {
          const findRoleID = () => {
            for (let i = 0; i < roleArray.length; i++) {
              if (answer.addRole === roleArray[i]) {
                return i + 1;
              }
            }
          };

          const findmanagerID = () => {
            const managerFirstName = answer.addManager.split(" ")[0];
            const managerLastName = answer.addManager.split(" ")[1];

            let query =
              "SELECT id FROM employees WHERE (employees.first_name = ? AND employees.last_name = ?)";

            connection.query(
              query,
              [managerFirstName, managerLastName],
              (err, results) => {
                if (err) throw err;
                else if (answer.addManager === "No Manager") {
                  connection.query(
                    "INSERT INTO employees SET ?",
                    {
                      first_name: answer.addFirstName,
                      last_name: answer.addLastName,
                      role_id: roleID,
                      manager_id: 0,
                    },
                    function (err) {
                      if (err) throw err;
                      console.log("Your employee was added successfully!");
                      start();
                    }
                  );
                } else {
                  const managerID = results[0].id;
                  console.log("ManagerID: " + managerID);

                  connection.query(
                    "INSERT INTO employees SET ?",
                    {
                      first_name: answer.addFirstName,
                      last_name: answer.addLastName,
                      role_id: roleID,
                      manager_id: managerID,
                    },
                    function (err) {
                      if (err) throw err;
                      console.log("Your employee was added successfully!");
                      start();
                    }
                  );
                }
              }
            );
          };
          findmanagerID();
          const roleID = findRoleID();
        });
    }
  );
};

// function to handle posting new items up for auction
// function postAuction() {
//   // prompt for info about the item being put up for auction
//   inquirer
//     .prompt([
//       {
//         name: "item",
//         type: "input",
//         message: "What is the item you would like to submit?"
//       },
//       {
//         name: "category",
//         type: "input",
//         message: "What category would you like to place your auction in?"
//       },
//       {
//         name: "startingBid",
//         type: "input",
//         message: "What would you like your starting bid to be?",
//         validate: function(value) {
//           if (isNaN(value) === false) {
//             return true;
//           }
//           return false;
//         }
//       }
//     ])
//     .then(function(answer) {
//       // when finished prompting, insert a new item into the db with that info
//       connection.query(
//         "INSERT INTO auctions SET ?",
//         {
//           item_name: answer.item,
//           category: answer.category,
//           starting_bid: answer.startingBid || 0,
//           highest_bid: answer.startingBid || 0
//         },
//         function(err) {
//           if (err) throw err;
//           console.log("Your auction was created successfully!");
//           // re-prompt the user for if they want to bid or post
//           start();
//         }
//       );
//     });
// }

// function bidAuction() {
//   // query the database for all items being auctioned
//   connection.query("SELECT * FROM auctions", function(err, results) {
//     if (err) throw err;
//     // once you have the items, prompt the user for which they'd like to bid on
//     inquirer
//       .prompt([
//         {
//           name: "choice",
//           type: "rawlist",
//           choices: function() {
//             var choiceArray = [];
//             for (var i = 0; i < results.length; i++) {
//               choiceArray.push(results[i].item_name);
//             }
//             return choiceArray;
//           },
//           message: "What auction would you like to place a bid in?"
//         },
//         {
//           name: "bid",
//           type: "input",
//           message: "How much would you like to bid?"
//         }
//       ])
//       .then(function(answer) {
//         // get the information of the chosen item
//         var chosenItem;
//         for (var i = 0; i < results.length; i++) {
//           if (results[i].item_name === answer.choice) {
//             chosenItem = results[i];
//           }
//         }

//         // determine if bid was high enough
//         if (chosenItem.highest_bid < parseInt(answer.bid)) {
//           // bid was high enough, so update db, let the user know, and start over
//           connection.query(
//             "UPDATE auctions SET ? WHERE ?",
//             [
//               {
//                 highest_bid: answer.bid
//               },
//               {
//                 id: chosenItem.id
//               }
//             ],
//             function(error) {
//               if (error) throw err;
//               console.log("Bid placed successfully!");
//               start();
//             }
//           );
//         }
//         else {
//           // bid wasn't high enough, so apologize and start over
//           console.log("Your bid was too low. Try again...");
//           start();
//         }
//       });
//   });
// }
