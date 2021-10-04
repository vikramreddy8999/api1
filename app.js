const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "userData.db");
let db = null;
const initializeDbAndSever = async () => {
  try {
    db = open({
      fileName: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("server running");
    });
  } catch (e) {
    console.log(`Db Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndSever();

const validPassword=(password)=>{
   return password.length>4
}

app.post("/register", async (request, response) => {
  const { username, password, gender, location } = request.body;
  const hashedPW = await bcrypt.hash(request.body.password,10);
  const selectUserQuery = `
    SELECT *
    FROM user
    WHERE username='${username}';`;

  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
       INSERT INTO
       user(username,password,gender,location)
       VALUES
       ('${username}',
      '${hashedPW}',
      '${gender}',
      '${location}' )`;
    if (validPassword(password))=>{
    const dbResponse = await db.run(createUserQuery);
    response.status = 200;
    response.send("user created Successfully");

    }else{
        response.status=400
        response.send("Password is too Short")
    }
   
  } else {
    response.status = 400;
    response.send("User already exits");
  }
});
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `
  SELECT * FROM user
  WHERE username='${username}';`;
  const dbUser = await db.run(selectUserQuery);
  if (dbUser === undefined) {
    response.status = 400;
    response.send("Invalid user");
  } else {
    const isPassMatch = await bcrypt.compare(password, dbUser.password);
    if (isPassMatch === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status = 400;
      response.send("Incorrect password");
    }
  }
});


app.put("/change-password",async(request,response)=>{
    const{ username,oldPassword,newPassword }=request.body;
    const selectPassword=`
    SELECT *
    FROM user
    WHERE username='${username}';`;
    const dbPass=await db.run(selectPassword);
    if(dbPass=undefined){
        response.status=400;
        response.send("Invalid user")

    }
    else{
        const isPassMatch=await bcrypt.compare(oldPassword,newPassword);
        if(isPassMatch===true){
            if (validPassword(newPassword)){
                    const hashedPs=await bcrypt.hash(newPassword,10)
                    const upDatePass=`
                    UPDATE
                    user
                    SET
                    password='${newPassword}'
                    WHERE username='${username}'; `;
                    const newPassWord=await db.run(upDatePass);
                    respond.send("Password updated")}
                    else{
                        response.status(400);
                        response.send("Password is too short")
                    }
        }
        else{
            response.status(400):
            response.send("Invalid current password")
        }
    }
})