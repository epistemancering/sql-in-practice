require("dotenv").config()
let Sequelize = require("sequelize")
let sequelize = new Sequelize(process.env.CONNECTION_STRING, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
})
let nextEmp = 5

module.exports = {
    getUpcomingAppointments: (req, res) => {
        sequelize.query(`select a.appt_id, a.date, a.service_type, a.approved, a.completed, u.first_name, u.last_name 
        from cc_appointments a
        join cc_emp_appts ea on a.appt_id = ea.appt_id
        join cc_employees e on e.emp_id = ea.emp_id
        join cc_users u on e.user_id = u.user_id
        where a.approved = true and a.completed = false
        order by a.date desc;`)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },

    approveAppointment: (req, res) => {
        let {apptId} = req.body
    
        sequelize.query(`update cc_appointments set approved = true where appt_id = ${apptId};
        
        insert into cc_emp_appts (emp_id, appt_id)
        values (${nextEmp}, ${apptId}),
        (${nextEmp + 1}, ${apptId});
        `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
                nextEmp += 2
            })
            .catch(err => console.log(err))
    },
    "getAllClients": function(req, res) {
        sequelize.query("select * from cc_users join cc_clients on cc_users.user_id = cc_clients.user_id").then(dbRes => res.status(200).send(dbRes[0])).catch()
    },
    "getPendingAppointments": function(request, res) {
        sequelize.query("select * from cc_appointments where approved = false order by 3 desc").then(dbRes => res.status(200).send(dbRes[0])).catch()
    },
    "getPastAppointments": function(request, res) {
        sequelize.query("select appt_id, date, service_type, notes, first_name, last_name from cc_appointments join cc_clients on approved = true and completed = true and cc_appointments.client_id = cc_clients.client_id join cc_users on cc_clients.user_id = cc_users.user_id order by 2 desc").then(dbRes => res.status(200).send(dbRes[0])).catch()
    },
    "completeAppointment": function(req, res) {
        sequelize.query("update cc_appointments set completed = true where appt_id = " + req.body.apptId).then(dbRes => res.status(200).send(dbRes[0])).catch()
    }
}
