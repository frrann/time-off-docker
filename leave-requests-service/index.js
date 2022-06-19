const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieSession = require('cookie-session');
const axios = require('axios');
const { currentUser } = require('./middlewares/current-user');
const keys = require('./keys');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(
    cookieSession({
        signed: false,
        secure: false
    })
);

// Postgres Client Setup

const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});


pgClient.on("connect", (client) => {
    client
      .query(`CREATE TABLE IF NOT EXISTS "employees" (
	    "id" SERIAL,
	    "lastname" VARCHAR(50) NOT NULL,
	    "firstname" VARCHAR(50) NOT NULL,
        "title" VARCHAR(50) NOT NULL,
        "email" VARCHAR(50) NOT NULL,
        "department" VARCHAR(50) NOT NULL,
	    PRIMARY KEY ("id")
    );`)
    .then(() => {
        return client
        .query(`CREATE TABLE IF NOT EXISTS "requests" (
          "id" SERIAL,
          "employeeid" VARCHAR(50) NOT NULL,
          "fromdate" VARCHAR(50) NOT NULL,
          "todate" VARCHAR(50) NOT NULL,
          "status" VARCHAR(50) NOT NULL,
          PRIMARY KEY ("id")
      );`)
    })
      .catch((err) => console.error(err));

  });

// Express route handlers

const port = 6000;

app.get('/', (req, res) => {
    res.send('Hi!!');
});

app.post('/employees', async (req, res) => {
    const { lastname, firstname, title, email, department } = req.body;

    const newEmployee = await pgClient.query('INSERT INTO employees (lastname, firstname, title, email, department) VALUES ($1, $2, $3, $4, $5) RETURNING *', [lastname, firstname, title, email, department]);
    res.status(201).send(`Employee added with ID: ${newEmployee.rows[0].id}`);
});

app.put('/employees/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { lastname, firstname, title, email, department } = req.body;

    await pgClient.query('UPDATE employees SET lastname = $1, firstname = $2, title = $3, email = $4, department = $5 WHERE id = $6', [lastname, firstname, title, email, department, id]);
    res.status(200).send(`Employee modified with ID: ${id}`);
});

app.delete('/employees/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    await pgClient.query('DELETE FROM employees WHERE id = $1', [id]);
    res.status(200).send(`Employee deleted with ID: ${id}`);
});

app.get('/employees', async (req, res) => {
    const employees = await pgClient.query('SELECT * FROM employees ORDER BY id ASC');
    res.status(200).json(employees.rows);
});

app.get('/leaveRequests', async (req, res) => {
    const requests = await pgClient.query('SELECT * FROM requests ORDER BY id ASC');
    res.status(200).json(requests.rows);
});

app.post('/createLeaveRequest', currentUser, async (req, res) => {
    const { email } = req.currentUser; 
    
    const employeeQueryResult = await pgClient.query('SELECT * FROM employees WHERE email = $1', [email]);
    const employee = employeeQueryResult.rows[0];

    const managerQueryResult = await pgClient.query('SELECT * FROM employees WHERE title = $1 AND department = $2', ['Manager', employee.department]);
    const manager = managerQueryResult.rows[0];

    await axios({
        url: 'http://email-generation-srv:4000/generateEmail', 
        method: 'POST', 
        data: {
            type: 'leave-request',
            managerLastname: manager.lastname,
            managerFirstname: manager.firstname,
            managerEmail: manager.email,
            employeeLastname: employee.lastname,
            employeeFirstname: employee.firstname,
            fromDate: req.body.fromDate,
            toDate: req.body.toDate
        }});
 
    const newRequest = await pgClient.query('INSERT INTO requests (employeeid, fromdate, todate, status) VALUES ($1, $2, $3, $4) RETURNING *', [employee.id, req.body.fromDate, req.body.toDate, 'pending']);
    res.status(201).json(newRequest.rows[0]);
});

app.post('/approveLeaveRequest/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    const requestsQueryResult = await pgClient.query('SELECT employeeid FROM requests WHERE id = $1', [id]);
    const employeeQueryResult = await pgClient.query('SELECT * FROM employees WHERE id = $1', [+requestsQueryResult.rows[0].employeeid]);
    const employee = employeeQueryResult.rows[0];

    const managerQueryResult = await pgClient.query('SELECT * FROM employees WHERE title = $1 AND department = $2', ['Manager', employee.department]);
    const manager = managerQueryResult.rows[0];

    await axios({
        url: 'http://email-generation-srv:4000/generateEmail', 
        method: 'POST', 
        data: {
            type: 'confirmation',
            managerLastname: manager.lastname,
            managerFirstname: manager.firstname,
            employeeEmail: employee.email,
            employeeLastname: employee.lastname,
            employeeFirstname: employee.firstname
        }
    });

    await pgClient.query('UPDATE requests SET status = $1 WHERE id = $2', ['approved', id]);
    res.status(200).send(`Request modified with ID: ${id}`);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  })