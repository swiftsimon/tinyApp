var express = require("express");
var app = express();
var PORT = process.env.port || 8080; //default port is 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString() {

};

generateRandomString();

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.com",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase };
  res.render("urls_show", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//corresponds to method "POST" in urls_new
app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("OK");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});






// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });




