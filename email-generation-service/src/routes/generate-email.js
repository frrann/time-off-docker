const express = require('express');

const { Email } = require('../utils/email');

const router = express.Router();

router.post('/generateEmail', async (req, res) => {
    const body = req.body;
    // 2 cazuri: 
    /** 1.
     *  type: leave-request
     *  managerLastname
     *  managerFirstname
     *  managerEmail
     *  userLastname
     *  userFirstname
     *  fromDate: 
     *  toDate:
     * 
     * 
     *  2. 
     *  type: confirmation
     *  managerLastname
     *  managerFirstname
     *  userLastname
     *  userFirstname
     *  userEmail
     */
    try {
        if (body.type == 'leave-request') {
            await new Email(body.managerEmail).sendLeaveRequest(body);
        } else if (body.type == 'confirmation') {
            await new Email(body.employeeEmail).sendConfirmation(body);
        } else {
            res.sendStatus(400);
        }
        res.sendStatus(200);
    } catch (err) {
        res.sendStatus(500);
    }

});

module.exports = { generateEmailRouter: router };