const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const { response } = require("express");
const bcrypt = require("bcrypt");
const  {loopEmail} = require("./helpers");
const app = express();
const PORT = 8080; 
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1','key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));



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

//Function loops through urlDatabase to find all urls linked to logged in user using the stored userID
const urlsForUser = function(userid) {
  let usersURLS = {};
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
  res.redirect(`/urls`);
});

app.get("/urls.json",(req, res) => {
  res.json(urlDatabase);
});

app.get("/urls",(req, res) => {
  const templateVar = {user_ID: users[req.session["user_ID"]], urls: urlsForUser(req.session.user_ID)};
  res.render("urls_index", templateVar);
});

//creates new short url for url Submitted 
//then redirects user to /urls/:shortURL so they can see the new shortURL for their Entered url
app.post("/urls", (req, res) => {
  console.log('req.session',req.session);
  if (req.session.user_ID) {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = {longURL:longURL, userID: req.session.user_ID};
    res.redirect(`/urls/${shortURL}`);         
  } else {
    res.send("hey man you shouldn't be here");
  }
});

//renders the new url tobe shortened page
//checks to see if user is logged in if not they are redirected to the log in page
app.get("/urls/new",(req,res) => {
  if (req.session.user_ID) {
    const templateVar = {
    user_ID: users[req.session["user_ID"]]
    };
    res.render("urls_new",templateVar);
    return;
  } else {
    res.redirect("/register");
  };
});

//this is the registration page where users will submit their email and password
app.get("/register", (req,res) => {
  const templateVar = {
    user_ID: users[req.session["user_ID"]],
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
    res.send('Error 400 email or password is empty');
  } else if (loopEmail(users,email)) {
    res.send('Error 400 email already exists');
  }
  req.session.user_ID = userID;
  users[userID] = {userID: userID, email: email, password: hashedPassword};
  res.redirect(`/urls`);
});

//updates an edited longURL for the sortURL
app.post("/urls/:shortURL", (req,res) => {
  if (req.session.user_ID) {
    const longURL = req.body.longURL;
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect("/register");
  }
});

//checks users object for any email matches if a match is found then checks to see if password is === stored password
//if password is a match then user is logged in if at either point no match is found user will be redirected to a error 403 page
app.post("/login", (req,res) => {
  const email = req.body.email;
  const user = loopEmail(users,email);
  const password = req.body.password;
  if (user) {
    if (bcrypt.compareSync(password,users[user].password)) {
      req.session.user_ID = users[user].userID;
      res.redirect(`/urls`);
    } else {
      res.send(`Error 403 Incorrect passord`);  
    }
  } else {
    res.send(`Error 403 email does not exist`);
  }
}); 

//renders the HTML for the login page and sends the page to the user
app.get("/login", (req,res) => {
  const templateVar = {
    user_ID: users[req.session["user_ID"]],
  };
  res.render("login",templateVar);
});

app.post("/logout", (req,res) => {
  req.session.user_ID = null;
  res.redirect("/urls");
});

//Deletes a long shortURL pair from the list of urls
app.post("/urls/:shortURL/delete",(req,res) => {
  if (req.session.user_ID) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.send("hey dude you should not be here!");
  }

});

//this pages shows the newly created six digit shortURL for the Submitted url
//Users can click on this six digit link to be Redirected to their Previously Submitted url
app.get("/u/:shortURL", (req, res) => {
  if (req.session.user_ID) {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(`${longURL}`);
  } else {
    res.redirect(`/login`);
  }

});

app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_ID) {
  const loggedINUser = urlsForUser(req.session.user_ID);
  const shortURL = req.params.shortURL;
  const templateVar = { user_ID: users[req.session["user_ID"]],  shortURL, longURL: urlDatabase[shortURL].longURL};
  res.render("urls_show", templateVar);
  } else {
    res.redirect(`/login`);
  }
});

app.get("/Hello",(req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});