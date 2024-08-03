// creating a simple notes webapp with node js 

// importing modules
import http from "http"
import fs from "fs"

// importing sql functions
import sql from "./db.mjs"

// creating server
let server = http.createServer((req, res) => {
    console.log(req.url);

    // creating object for the sql class
    let db = new sql()

    //redirecting to login page as first request
    if (req.url == "/") {
        fs.readFile("./login.html", (err, dat) => {
            res.end(dat)
        })
    }

    // login data handling
    else if (req.url == "/login") {
        let data = ""
        req.on("data", ev => {
            data += ev.toString()
        })
        req.on("end", async ev => {
            let obj = JSON.parse(data)

            // verify the data in db
            let result = await db.Login(obj.name, obj.password)
            if (result) res.end("1")
            else res.end("0")
        })
    }

    // redirecting to signup page
    else if (req.url == "/signUp") {
        fs.readFile("./signup.html", (err, dat) => {
            res.end(dat)
        })
    }

    // validating signup details
    else if (req.url == "/signup") {
        let data = ""
        req.on("data", ev => {
            data += ev.toString()
        })
        req.on("end", async ev => {
            let obj = JSON.parse(data)

            // this is to be validated because for the issues in creating tables in mysql
            if (!obj.name.match(/^[a-zA-Z]{1}/) && !obj.name.match(/\W/)) {
                res.end("-1")
            }
            else {

                // validating thus the name is already exists or not
                let result = await db.nameAlreadyExist(obj.name)
                // console.log("is name already exists ", result)
                if (result) {
                    res.end("0")
                }
                else {

                    // creating new user
                    await db.newUser(obj)
                    res.end("1")
                }
            }
        })
    }

    // redirecting to main page
    else if (req.url.startsWith("/main")) {
        fs.readFile("./main.html", (err, dat) => res.end(dat))
    }

    // add notes 
    else if (req.url == "/addNotes") {
        let data = ""
        req.on("data", ev => data += ev.toString())
        req.on("end", async ev => {
            let obj = JSON.parse(data)
            console.log(obj);
            
            // add data to db
            let result = await db.addData(obj)
            res.end("" + result)
        })
    }

    // get data from db
    else if (req.url == "/getData") {
        let data = ""
        req.on("data", ev => data += ev.toString())
        req.on("end", async ev => {
            let obj = JSON.parse(data)

            // verifiying the user
            let verify = await db.verifyUser(obj.name)
            if (!verify) res.end("0")
            else {

                // checking the availablity of the table in db
                if (!await db.hasTable(obj.name)) {
                    // creating the table
                    await db.addTable(obj.name)
                }

                // returning the data
                let result = await db.getData(obj.name)
                res.end(JSON.stringify(result))
            }
        })
    }

    // update data in db
    else if (req.url == "/updateData") {
        let data = ""
        req.on("data", ev => data += ev.toString())
        req.on("end", async ev => {
            let obj = JSON.parse(data)
            let verify = await db.verifyUser(obj.name)
            if (!verify) res.end("0")
            else {
                console.log(obj);

                // update data 
                let result = await db.updateData(obj)
                res.end("" + result)
            }
        })
    }

    // remove data in db
    else if (req.url == "/removeData") {
        let data = ""
        req.on("data", ev => data += ev.toString())
        req.on("end", async ev => {
            let obj = JSON.parse(data)
            let verify = await db.verifyUser(obj.name)
            if (!verify) res.end("0")
            else {
                console.log(obj);
                await db.removeData(obj)
                res.end("1")
            }
        })
    }

})

// server running on default port 80
server.listen(80)
