// importing sql driver

import sql from "@mysql/xdevapi";

let DBname = "notes"
let Users = "Users"

// the connection object
let connection = { user: "root", password: "your_password", host: "localhost", port: 33060, schema: DBname }

export default class mysql {

    Login = async (name, password) => {
        let db = await sql.getSession(connection)

        // query for login
        let result = await (await db.sql(`select username,password from ${Users} where username="${name}" and password="${password}";`).execute()).fetchAll()
        console.log(result[0], " logged in");

        // closing the db connection
        await db.close()
        return result[0]?.[0] == name && result[0]?.[1] == password ? true : false
    }

    // validating as the name already exist in db
    nameAlreadyExist = async (name) => {
        let db = await sql.getSession(connection)

        // query for validation
        let result = await db.sql(`select count(username) from ${Users} where username="${name}";`)
        let end = await (await result.execute()).fetchAll()
        await db.close()
        return end[0][0] > 0
    }

    // inserting user to the users table
    newUser = async (obj) => {
        let db = await sql.getSession(connection)

        // query for inserting
        await db.sql(`insert into ${Users} (username,password,email,mobileNo) values ("${obj.name}","${obj.password}","${obj.email}","${obj.mobileNumber}");`).execute()
        console.log("new user created ", obj.name);
        await db.close()
        return true
    }

    // checking the db has table or not
    hasTable = async name => {
        let db = await sql.getSession(connection)
        let exist = (await db.sql(`show tables`).execute()).fetchAll()
        await db.close()
        let flag = false
        exist.forEach(value => {
            if (value[0] == "user_" + name) {
                flag = true
            }
        })
        return flag
    }

    // creating new table for the user
    addTable = async name => {
        console.log("added Table ", name);
        let db = await sql.getSession(connection)

        // WARNING a message with more than 200 words leads to error.
        // it can be overcome by increasing the value
        let table = await db.sql(`create table user_${name} (id int auto_increment primary key,title varchar(200), content varchar(200));`).execute()
        await db.close()
    }

    // add data to the table
    addData = async (obj) => {
        console.log("add Data for ", obj.name);
        let db = await sql.getSession(connection)

        // query for adding data
        await db.sql(`insert into user_${obj.name} (title,content) values ('${obj.key}','${obj.value}')`).execute()
        await db.close()
        return 1
    }

    // verifying the username is duplicated
    verifyUser = async name => {
        let db = await sql.getSession(connection)
        let result = await db.sql(`select username from users where username="${name}"`).execute()
        await db.close()
        return result.fetchAll()[0]?.[0] == name
    }

    // get all the table data
    getData = async name => {
        console.log("get all data  in db for ", name);
        let db = await sql.getSession(connection)
        if (!this.verifyUser(name)) return "0"
        let result = await db.sql(`select title,content from user_${name};`).execute()
        await db.close()
        return result.fetchAll()
    }

    // update the given data
    updateData = async obj => {
        console.log("update data in db for ", obj.name);
        let db = await sql.getSession(connection)
        if (!this.verifyUser(obj.name)) return "0"
        await db.sql(`update user_${obj.name} set content="${obj.value}" where title="${obj.key}";`).execute()
        await db.close()
        return 1
    }

    // remove the data
    removeData = async obj => {
        console.log("remove data in db for ", obj.name);
        let db = await sql.getSession(connection)
        if (!this.verifyUser(obj.name)) return "0"
        await db.sql(`delete from user_${obj.name} where title="${obj.key}";`).execute()
        await db.close()
        return 1
    }

}
