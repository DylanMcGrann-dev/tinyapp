const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080; // default port 8080
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  const templateVar = { urls: urlDatabase};
  res.render("urls_index", templateVar);
});

//creates new short url for url Submitted 
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);         
});

app.get("/urls/new",(req,res) => {
  res.render("urls_new");
});

app.post("/urls/:shortURL/delete",(req,res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVar = {shortURL: longURL}
  res.redirect(`${longURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL, longURL: urlDatabase[shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/Hello",(req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});