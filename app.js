const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
let db = null;

let dbpath = path.join(__dirname, "userData.db");
const initilzeDBandServer = async () => {
  try {
    db = await open({ filename: dbpath, driver: sqlite3.Database });
    app.listen(3001, () => {
      console.log("server is started");
    });
  } catch (e) {
    console.log(`DataBase ${e.message}`);
    process.exit(1);
  }
};
initilzeDBandServer();

app.post("/register/", async (req, res) => {
  const { username, password, name, gender, location } = req.body;
  const q = `select * from user where username = '${username}'`;

  const dbObj = await db.get(q);
  const encryptPwd = bcrypt.hash(req.body.password, 10);

  if (dbObj !== undefined) {
    res.status = 400;
    res.send("User already exists");
  } else {
    const p = password.length;
    if (p < 5) {
      res.status = 400;
      res.send("Password is too short");
    } else {
      const regQuery = `insert into user(username,name,password,gender,location) values ('${username}','${name}',
        '${encryptPwd}', 
          '${gender}',
          '${location}')`;

      const dbResponse = await db.run(reqQuery);

      res.send("User created successfully");
    }
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const q = `select * from user where username = '${username}'`;
  const dbObj = await db.get(q);
  if (dbObj === undefined) {
    res.status = 400;
    res.send("Invalid user");
  } else {
    const compPwd = bcrypt.compare(password, dbObj.password);
    if (comPwd) {
      res.send("Login success!");
    } else {
      res.status = 400;
      res.send("Invalid password");
    }
  }
});

app.put("/change-password", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  const q = `select * from user where username = '${username}'`;
  const dbObj = await db.get(q);
  const compPwd = bcrypt.compare(password, dbObj.password);
  if (compPwd) {
    const l = newPassword.length;
    if (l < 5) {
      res.status = 400;
      res.send("Password is too short");
    } else {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatePasswordQuery = `
          UPDATE
            user
          SET
            password = '${hashedPassword}'
          WHERE
            username = '${username}';`;

      const user = await database.run(updatePasswordQuery);

      res.send("Password updated");
    }
  } else {
    res.status = 400;
    res.send("Invalid current password");
  }
});

module.exports = app;
