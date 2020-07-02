USE employee_tracker_DB;


INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Tanya", "Poovaiah", 1, 0), ("Lee", "Yek", 4, 0), ("Tu", "Vo", 2, 1), ("Arianna", "Vander Weele", 3, 4), ("Rick", "Chen", 6, 5), ("Nathan", "Irvin", 5, 0);


INSERT INTO role (title, salary, department_id)
VALUES ("Lead Animator", 100000, 1),("Animator", 60000, 1), ("DP", 80000, 2), ("Technical Director", 100000, 2), ("Editor", 80000, 3), ("Post FX", 90000, 3);

INSERT INTO department (name)
VALUES ("Animation"), ("Lighting"), ("Editing");