var express = require("express");
var app = express();
var PORT = process.env.port || 8080; //default port is 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//req.cookies.user_id

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
};

// OLD DATABASE
// var urlDatabase = {
//   "b2xVn2": {"http://www.lighthouselabs.com",
//   "9sm5xK": "http://www.google.com",
// };

var urlDatabase = {
  "b2xVn2":
  {longURL :"http://www.lighthouselabs.com",
  id: "s7ui9f"
  },

  "9sm5xK":
  {longURL: "http://www.google.com",
  id: "user2RandomID"
  }
};

const users = {
  "s7ui9f" : {
    id: "s7ui9f",
    email: "user1@example.com",
    password: "tricky"
  },
  "ax334d" : {
    id: "ax334d",
    email: "user2@example.com",
    password: "cool555"
  }
};

// XXXXXXXXXXXXXXXXXXX

//POST new url
app.post("/urls/new", (req, res) => {
    // let data = urlDatabase;
    //const userId = req.cookies["user_id"];

  //   let templateVars = {
  //   // only give access to that users urls
  //   urls: urlDatabase[req.params.id],
  //   user: users[req.cookies.user_id],
  // };

  // console.log("U", data);
  // console.log("V", req.body);
    // returns { longURL: 'fred.com' }
  let random = generateRandomString();
    // console.log("random", random);
    //console.log(random);
      let longURL = req.body.longURL;
      let shortURL = random;
   // console.log("long", longURL);
   //console.log("short", shortURL);

   urlDatabase[shortURL] = { longURL: longURL, id: req.cookies.user_id };
   console.log("new database", urlDatabase);
  // res.send("OK");
  // X res.redirect(`/u/${random}`);  // /urls/ to /u/
   res.redirect('/urls');
});


//on Login POST call
app.post("/login", (req, res) => {
  const username = req.body.login_email;
  const password = req.body.login_password;

  const passLogin = checkPassword(username, password);
  // if true, passLogin is object of user

  console.log("user", username);
  console.log("password", password);

 function checkPassword(userEmail, password) {
  if(!username || !password) {
    console.log("No entry Login page");
    res.redirect('/register');
  }

   for (let key in users) {
    if(users[key].email == username &&
      users[key].password == password ) {
      console.log("XXXXX", users[key]);
        return users[key];
    }
  }
    console.log("password error");
    return false;
  }
  if (passLogin) {
    // redirect to urls
    res.cookie("user_id", passLogin.id);
    res.redirect('/urls');

  } else {
    //send error
    console.log("LOG IN ERROR");
    res.status(401).send("Log in Error");
  }
});


// on logout POST call
app.post("/logout", (req, res) => {
  //clear the cookie set by submitting username form
  res.clearCookie("user_id");
  res.redirect('/urls');
});


app.get("/", (req, res) => {
  let current_user = req.cookies.user_id;
  //console.log("home_user_id", req.cookies.user_id);
  if (current_user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// LOGIN GET
app.get("/login", (req, res) => {
  res.render("urls_login");
});


app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  let templateVars = {
    urls: urlDatabase,
    user: users[userId],
  };
  console.log("HERE", templateVars)
  console.log("DATABASE", urlDatabase);
  console.log("AAA", [req.params.id]);

  //below, render this page with access to templateVars
  res.render("urls_index", templateVars);
});

// 000000000000000


app.get("/urls/new", (req, res) => {
// check if they are logged in
  for (let key in users) {
    if (key == req.cookies["user_id"]) {
  let templateVars = {
    // only give access to that users urls
    urls: urlDatabase[req.params.id],
    user: users[req.cookies.user_id],
  };
      //allow access
  res.render("urls_new", templateVars);
  return;
  } else {
// if not  redirect to login page
   res.redirect('/login');
  }
  }
  //const userId = req.cookies["user_id"];
});


// REGISTER GET endpoint
app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  let templateVars = {
    urls: urlDatabase,
    user: users[userId],
  };  res.render("urls_register", templateVars);
});

// REGISTER POST
app.post("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  let templateVars = {
    urls: urlDatabase,
    user: users[userId],
  };
    let randomID = generateRandomString();
  //console.log(randomID);
  testLoginInput();
  // if email or password are empty strings, send response 400 status code
  function testLoginInput () {
    if(!req.body.email || !req.body.password) {
    //return status code 404
    console.log("404");
    res.status(404);
    res.render('404Error');
  } else if (userExists(req.body.email) == true){
    // check if username already exists
    // send 400 status code
      res.status(400);
      res.render('400error');
      //res.status(400).send();
  } else {
      users[randomID] = {
        id: randomID,
        email: req.body.email,
        password: req.body.password
      };
  // clear a cookie in case it exists
    res.clearCookie("user_id");
  // set the cookie
    res.cookie("user_id", randomID);
    console.log("USERS", users);
  //adds new user object
  //console.log("request", req.body);
    res.redirect('/urls');
  }
 }

 function userExists(email) {
   for (let key in users) {
    if(users[key].email == email) {
      return true;
    }
  }

  return false;
 };

});


// show page
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  let templateVars = { shortURL: req.params.id, // FIX THIS
    urls: urlDatabase,
    user: users[userId] };

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let data = urlDatabase;
  let longURL = data[req.params.shortURL];
  res.redirect(longURL);
});

// this is the delete route
app.post("/urls/:id/delete", (req, res)=> {
  //console.log("delete body", req.body);
  //**insert delete functionality here
  delete urlDatabase[req.params.id];
  //console.log("see", urlDatabase[req.params.id]);
  res.redirect('/urls');
});

// this is the update page linked from edit button
app.post("/urls/:id", (req, res)=> {
  //console.log("from edit button", req.params.id);
  let short = req.params.id;
  res.redirect(`/urls/${short}`); //${short} is a place holder (use ` not " nor ')
});

// on update press call this
app.post("/urls/:id/update", (req, res)=> {
  console.log("update body", req.body);
  urlDatabase[req.params.id].longURL = req.body.newURL;    //added .longURL
  res.redirect('/urls');
});



// *** THIS RETURNS UNDEFINED  ***
app.get("/u/:shortURL", (req, res) => {
  console.log("X",req.body);
  let longURL = urlDatabase[req.params.shortURL].longURL;
  console.log("New Long", longURL);
  res.redirect(longURL);
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




