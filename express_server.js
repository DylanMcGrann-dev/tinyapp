const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { response } = require("express");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 8080; // default port 8080
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());



//A variable that cotains object with all submited urls paired with their shortend links and userID
const urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca"},
  "9sm5xK": {longURL:"http://www.google.com"}
};

//A Variable that contains all registered users
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

//loops through the users object and compares emails if there is a match the function returns the the object the email is in
const loopEmail = function(object, value) {
  for (const key in object) {         
    if (object[key]["email"] === value) {
      return object[key];
    };
  }
  return null;
};

//Function loops through urlDatabase to find all urls linked to logged in user using the stored userID
const urlsForUser = function(userid) {
  let usersURLS = {}
  for (const id in urlDatabase) {
    if (userid === urlDatabase[id].userID) {
      usersURLS[id] = urlDatabase[id]
    };
  };
  return usersURLS;
};

//A function that creates a random six digit alpha Numerical string
const generateRandomString = function(){
  let letterArr = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
  let newString = "";
  for (let i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * 58);
   newString += letterArr[randomNum];
  };
  return newString;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json",(req, res) => {
  res.json(urlDatabase);
});

app.get("/urls",(req, res) => {
  console.log(urlsForUser(req.cookies.user_ID).longURL);
  // console.log(urlDatabase[id].userID);
  const templateVar = {user_ID: users[req.cookies["user_ID"]], urls: urlsForUser(req.cookies.user_ID)};
  res.render("urls_index", templateVar);
});

//creates new short url for url Submitted 
//then redirects user to /urls/:shortURL so they can see the new shortURL for their Entered url
app.post("/urls", (req, res) => {
  const cookies = req.cookies;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL:longURL, userID: cookies.user_ID};
  res.redirect(`/urls/${shortURL}`);         
});

//renders the new url tobe shortened page
//checks to see if user is logged in if not they are redirected to the log in page
app.get("/urls/new",(req,res) => {
  if (req.cookies.user_ID) {
    const templateVar = {
    user_ID: users[req.cookies["user_ID"]],
    // ... any other vars
    };
    res.render("urls_new",templateVar);
    return;
  };
  res.redirect("/register");
});

//this is the registration page where users will submit their email and password
app.get("/register", (req,res) => {
  const templateVar = {
    user_ID: users[req.cookies["user_ID"]],
  // ... any other vars
  };
  res.render("register",templateVar);
});

//registers user and stores their info in the users object 
//if nothing is entered or user already exists then the server responds with error 400
app.post("/register", (req,res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === '' || password === '') {
    res.redirect('/error/400 email or password is empty');
  } else if (loopEmail(users,email)) {
    res.redirect('/error/400 email already exists');
  }
  users[userID] = {userID: userID, email: email, password: hashedPassword};
  res.cookie("user_ID",userID);
  res.redirect(`/urls`);
});

//updates an edited longURL for the sortURL
app.post("/urls/:shortURL", (req,res) => {
  const longURL = req.body.longURL
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//checks users object for any email matches if match found then checks to see if password is === 
//if password is a match then user is logged in if at either point no match is found 403 
app.post("/login", (req,res) => {
  const email = req.body.email;
  const loop = loopEmail(users,email);
  const password = req.body.password;
  if (loop) {
    if (bcrypt.compareSync(password,loop.password)) {
      // users[userID] = {userID: userID, email: email, password: password};
      res.cookie("user_ID",loop.userID);
      res.redirect(`/urls`);
    } else {
      res.redirect(`/error/403 Incorrect passord`);  
    }
  } else {
    res.redirect(`/error/403 email does not exist`);
  }
}); 

//renders the HTML for the login page and sends the page to the user
app.get("/login", (req,res) => {
  const templateVar = {
    user_ID: users[req.cookies["user_ID"]],
  // ... any other vars
  };
  res.render("login",templateVar);
});

app.post("/logout", (req,res) => {
  // const username = req.body.username;
  res.clearCookie("user_ID");
  res.redirect("/urls");
});

//Deletes a long shortURL pair from the list of urls
app.post("/urls/:shortURL/delete",(req,res) => {
  const shortURL = req.params.shortURL;
  const loggedINUser = urlsForUser(req.cookies.user_ID)
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//this pages shows the newly created six digit shortURL for the Submitted url
//Users can click on this six digit link to be Redirected to their Previously Submitted url
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVar = {shortURL: longURL}
  res.redirect(`${longURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const loggedINUser = urlsForUser(req.cookies.user_ID);
  const shortURL = req.params.shortURL;
  // console.log("urlDatabase.shortURL",urlDatabase.shortURL);
  const templateVar = { user_ID: users[req.cookies["user_ID"]],  shortURL, longURL: urlDatabase[shortURL].longURL};
  res.render("urls_show", templateVar);
});

app.get("/Hello",(req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});