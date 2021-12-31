//Run this script to create some users and tasks automatically

require('./src/db/mongoose')
//const bcrypt = require('bcryptjs')

const User = require('./src/models/user')
const Task = require('./src/models/task')

async function main() {
        for (person of ["Daysa", "Cauã", "Nilda"]) {
            let user = new User({
                name: person,
                email: person + "@email.com",
                password: "123456"
            })

            await user.save()
        }

    await Task.insertMany([
        {
            description: "Cook the dinner"
        },
        {
            description: "Clean my room"
        },
        {
            description: "Wash the dishes"
        }
    ])
}

main().catch(err => console.log(err));