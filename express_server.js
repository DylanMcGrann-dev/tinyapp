const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());




const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// const templateVars = {
//   username: req.cookies["username"],
//   // ... any other vars
// };
// res.render("urls_index", templateVars);

//A function that creates a random six digit alpha Numerical string
const generateRandomString = function(){
  let letterArr = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
  let newString = "";
  for (let i = 0; i < 6; i++) {
    let randomNum = Math.floor(Math.random() * 58);
   newString += letterArr[randomNum];
  }
  return newString;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json",(req, res) => {
  res.json(urlDatabase);
});

app.get("/urls",(req, res) => {
  const templateVar = {  username: req.cookies["username"],urls: urlDatabase};
  res.render("urls_index", templateVar);
});

//creates new short url for url Submitted 
//then redirects user to /urls/:shortURL so they can see the new shortURL for their Entered url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);         
});

app.get("/urls/new",(req,res) => {
  const templateVar = {
    username: req.cookies["username"],
    // ... any other vars
  };
  res.render("urls_new",templateVar);
});

//updates an edited longURL for the sortURL
app.post("/urls/:shortURL", (req,res) => {
console.log(req.params.shortURL);
console.log(req.body);
  const longURL = req.body.longURL
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//sets a value (the username the user submitted) to a cookie named username 
app.post("/login", (req,res) => {
  const username = req.body.username;
  res.cookie("username",username);
  res.redirect(`/urls`);
});

app.post("/logout", (req,res) => {
  const username = req.body.username;
  res.clearCookie("username",username);
  res.redirect("/urls");
});

//Deletes a long shortURL pair from the list of urls
app.post("/urls/:shortURL/delete",(req,res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//this pages shows the newly created six digit shortURL for the Submitted url
//Users can click on this six digit link to be Redirected to their Previously Submitted url
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVar = {shortURL: longURL}
  res.redirect(`${longURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVar = {  username: req.cookies["username"], shortURL, longURL: urlDatabase[shortURL]};
  res.render("urls_show", templateVar);
});

app.get("/Hello",(req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});