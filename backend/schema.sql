-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  acc_id INT NOT NULL AUTO_INCREMENT,
  title TEXT,
  firstname TEXT,
  lastname TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL,
  PRIMARY KEY (acc_id)
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  dept_id INT NOT NULL AUTO_INCREMENT,
  emp_id INT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  employeeCount INT,
  PRIMARY KEY (dept_id),
  KEY emp_id (emp_id)
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  emp_id INT NOT NULL AUTO_INCREMENT,
  acc_id INT,
  dept_id INT,
  email TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  role TEXT NOT NULL,
  PRIMARY KEY (emp_id),
  KEY acc_id (acc_id),
  KEY dept_id (dept_id)
);

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
  req_id INT NOT NULL AUTO_INCREMENT,
  emp_id INT NOT NULL,
  type TEXT NOT NULL,
  items TEXT NOT NULL,
  status TEXT NOT NULL,
  PRIMARY KEY (req_id),
  KEY emp_id (emp_id)
);

-- Create workflows table
CREATE TABLE IF NOT EXISTS workflows (
  workflow_id INT NOT NULL AUTO_INCREMENT,
  emp_id INT NOT NULL,
  type TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (workflow_id),
  KEY emp_id (emp_id)
); 