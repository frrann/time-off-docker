const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const keys = require('./keys');

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
      .catch((err) => console.error(err));
  });


// Express route handlers

/**
 *  GET: / | displayHome()
    GET: /employees
    GET: /employees/:id
    POST: /employees
    PUT: /employees/:id
    DELETE: /employees/:id
 */

const port = 5000;

app.get('/', (req, res) => {
    res.send('Hi!!');
});

app.get('/employees', async (req, res) => {
    const employees = await pgClient.query('SELECT * FROM employees ORDER BY id ASC');
    res.status(200).json(employees.rows);
});

app.get('/employees/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const employee = await pgClient.query('SELECT * FROM employees WHERE id = $1', [id]);
    res.status(200).json(employee.rows);
});

app.post('/employees', async (req, res) => {
    const body = { ...req.body };
    const { lastname, firstname, title, email, department } = body;

    const newEmployee = await pgClient.query('INSERT INTO employees (lastname, firstname, title, email, department) VALUES ($1, $2, $3, $4, $5) RETURNING *', [lastname, firstname, title, email, department]);
    
    await axios({url: 'http://leave-requests-service:6000/employees', method: 'POST', data: body});

    res.status(201).send(`Employee added with ID: ${newEmployee.rows[0].id}`);
});
 
app.put('/employees/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const body = { ...req.body };
    const { lastname, firstname, title, email, department } = body;

    await pgClient.query('UPDATE employees SET lastname = $1, firstname = $2, title = $3, email = $4, department = $5 WHERE id = $6', [lastname, firstname, title, email, department, id]);

    await axios({url: `http://leave-requests-service:6000/employees/${id}`, method: 'PUT', data: body});

    res.status(200).send(`Employee modified with ID: ${id}`);
});

app.delete('/employees/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    await pgClient.query('DELETE FROM employees WHERE id = $1', [id]);

    await axios({url: `http://leave-requests-service:6000/employees/${id}`, method: 'DELETE'});

    res.status(200).send(`Employee deleted with ID: ${id}`);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
})