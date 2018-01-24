var express = require("express");
var app = express();
var PORT = process.env.port || 8080; //default port is 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
};


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.com",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let data = urlDatabase;
  let longURL = data[req.params.shortURL];
  res.redirect(longURL);
});

//corresponds to method "POST" in urls_new
app.post("/urls", (req, res) => {
  let data = urlDatabase;
  // console.log("U", data);
  // let longURL = data[random];
  // console.log("V", req.body);
    // returns { longURL: 'fred.com' }
  let random = generateRandomString();
    // console.log("random", random);
    //console.log(random);
      let longURL = req.body.longURL;
      let shortURL = random;
   // console.log("long", longURL);
   //console.log("short", shortURL);

   urlDatabase[shortURL] = longURL;
   // console.log("new database", urlDatabase);
  // res.send("OK");
  res.redirect(`/u/${random}`);  // /urls/ to /u/
});

app.get("/u/:shortURL", (req, res) => {
  console.log("X",req.body);
  let longURL = urlDatabase["req.params.shortURL"];
  res.redirect(longURL);
});


// this is the delete route
app.post("/urls/:id/delete", (req, res)=> {
  console.log("delete body", req.body);
  //**insert delete functionality here
  delete urlDatabase[req.params.id];
  console.log("see", urlDatabase[req.params.id]);
  res.redirect('/urls')
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




