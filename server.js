var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
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
          return viewByManager();
        case "Add Employee":
          return addEmployee();
        case "Remove Employee":
          return removeEmployee();
        case "Update Employee Role":
          return console.log(
            "You are looking at Update Employee Role! Feature coming soon." 
          );
        case "Update Employee Manager":
          return console.log(
            "You are looking at Update Employee Manager! Feature coming soon."
          );
        case "View All Roles":
          return viewAllRoles();
        case "Add Role":
          return addRole();
        case "Remove Role":
          return removeRole();
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
  let departmentArray = [];

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

// function to remove employees
const removeEmployee = () => {
  connection.query(
    "SELECT first_name, last_name FROM employees",
    (err, results) => {
      if (err) throw err;
      employeeArray = [];
      results.forEach((el) => {
        const stringName = el.first_name + " " + el.last_name;
        employeeArray.push(stringName);
      });
      console.log("All Employees: " + employeeArray);

      inquirer
        .prompt({
          name: "chooseEmployee",
          type: "list",
          message: "Which employee would you like to remove?",
          choices: employeeArray,
        })
        .then((answer) => {
          const employeeFirstName = answer.chooseEmployee.split(" ")[0];
          const employeeLastName = answer.chooseEmployee.split(" ")[1];

          let query =
            "DELETE FROM employees WHERE (employees.first_name = ? AND employees.last_name = ?)";

          connection.query(
            query,
            [employeeFirstName, employeeLastName],
            (err, results) => {
              if (err) throw err;
              console.log("Employee successfully removed!");
              start();
            }
          );
        });
    }
  );
};

//function to view all roles
const viewAllRoles = () => {
  connection.query("SELECT * FROM role", (err, results) => {
    if (err) throw err;
    console.table(results);
    start();
  });
};

//function to add a role
const addRole = () => {
  let departmentArray = [];

  connection.query("SELECT name FROM department", (err, results) => {
    if (err) throw err;
    results.forEach((el) => {
      departmentArray.push(el.name);
    });
  });

  inquirer
    .prompt([
      {
        name: "roleName",
        type: "input",
        message: "Please input the name of the role you would like to add:",
      },
      {
        name: "roleSalary",
        type: "input",
        message: "Please enter a number for the salary of this role",
      },
      {
        name: "addDepartment",
        type: "list",
        message: "Please choose a department for this role",
        choices: departmentArray,
      },
    ])
    .then((answer) => {
      const findDepartmentID = () => {
        for (let i = 0; i < departmentArray.length; i++) {
          if (answer.addDepartment === departmentArray[i]) {
            return i + 1;
          }
        }
      };
      let roleID = findDepartmentID();

      connection.query(
        "INSERT INTO role SET ?",
        {
          title: answer.roleName,
          salary: answer.roleSalary,
          department_id: roleID,
        },
        function (err) {
          if (err) throw err;
          console.log("New role was added successfully!");
          start();
        }
      );
    });
};

//function to remove a role
const removeRole = () => {
  connection.query("SELECT title FROM role", (err, results) => {
    if (err) throw err;
    let roleArray = [];
    results.forEach((el) => {
      roleArray.push(el.title);
    });

    inquirer
      .prompt({
        name: "chooseRole",
        type: "list",
        message: "Which role would you like to remove?",
        choices: roleArray,
      })
      .then((answer) => {
        let query = "DELETE FROM role WHERE (role.title = ?)";

        connection.query(query, [answer.chooseRole], (err, results) => {
          if (err) throw err;
          console.log("Role successfully removed!");
          start();
        });
      });
  });
};

//function to view all employees by manager
const viewByManager = () => {
  let managerArray = [];

  connection.query(
    "SELECT first_name, last_name FROM employees WHERE (employees.manager_id = 0)",
    (err, results) => {
      if (err) throw err;
      results.forEach((el) => {
        const stringName = el.first_name + " " + el.last_name;
        managerArray.push(stringName);
      });

      inquirer
        .prompt({
          name: "byManager",
          type: "list",
          message: "Which manager's employees would you like to view?",
          choices: managerArray,
        })
        .then((answer) => {
          const managerFirstName = answer.byManager.split(" ")[0];
          const managerLastName = answer.byManager.split(" ")[1];

          let query =
            "SELECT id FROM employees WHERE (employees.first_name = ? AND employees.last_name = ?)";

          connection.query(
            query,
            [managerFirstName, managerLastName],
            (err, results) => {
              if (err) throw err;

              const managerID = results[0].id;
              //console.log("ManagerID: " + managerID);

              connection.query(
                "SELECT * FROM employees WHERE employees.manager_id=?",
                [managerID],
                (err, results) => {
                  if (err) throw err;
                  console.table(results);
                  start();
                }
              );
            }
          );
        });
    }
  );
};
