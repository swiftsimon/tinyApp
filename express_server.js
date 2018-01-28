//tinyApp
//allow users to register, login in, log out

const express = require("express");
const app = express();
const PORT = process.env.port || 8080; //default port is 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');


app.use(cookieSession({
  name: 'session',
  keys: ['jkh65gtyg4']
}));

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
};


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
    id: "",
    email: "",
    password: ""
  },
};


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

   urlDatabase[shortURL] = { longURL: longURL, id: req.session.user_id };
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
      bcrypt.compareSync(password, users[key].password)) {
     //&& users[key].password == password
      console.log("LOG IN SUCCESS", users[key]);
        return users[key];
    }
  }
    console.log("password error");
    return false;
  }
  if (passLogin) {
    // redirect to urls
    console.log("passLogin true")
    req.session.user_id = passLogin.id;          // SETCOOKIE
    res.redirect('/urls');

  } else {
    //send error
    console.log("LOG IN ERROR");
    res.status(401).send("Log in Error");
  }
});


// on logout POST call
app.post("/logout", (req, res) => {
  //clear the existing cookie when user logs out
  //res.clearCookie("user_id");
  req.session = null;                               // clear COOKIE
  res.redirect('/urls');
});


app.get("/", (req, res) => {
  let current_user = req.session.user_id;
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
  // const userId = req.session.user_id;
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id] ? users[req.session.user_id].email : '',
  };
    console.log("Template", templateVars);
    console.log("COOKIE", req.session.user_id);
    // console.log("COOKIE_USER", users[req.cookies["user_id"]].id);

    if (!req.session.user_id) {
      res.send("Please Log In");
      console.log("access denied");
      return;
    } else {
      if (req.session.user_id === users[req.session.user_id].id) {

        templateVars.urls = urlsForUser(req.session.user_id);
        res.render("urls_index", templateVars);

    } else {
      res.send("Please Log In");
      console.log("access denied again");
    }
  }


});

// create a function that filters users accessible URLS
function urlsForUser(id) {
  let filteredURL = {};
    for (url in urlDatabase) {
      if (id === urlDatabase[url].id) {
        filteredURL[url] = urlDatabase[url];
    }
  }
  return filteredURL;
};

app.get("/urls/new", (req, res) => {
// check if they are logged in
  for (let key in users) {
    if (key === req.session.user_id) {
      let templateVars = {
    // only give access to that users urls
        urls: urlDatabase[key],
        user: users[req.session.user_id] ? users[req.session.user_id].email : '',
      };
      //allow access
      res.render("urls_new", templateVars);
      return;
    } //end for loop
  }
// if not  redirect to login page
   res.redirect('/login');

  //const userId = req.cookies["user_id"];
});


// REGISTER GET endpoint
app.get("/register", (req, res) => {
  //if cookie exists redirect to urls

  const userId = req.session.user_id;
  let templateVars = {
    urls: urlDatabase,
    user: users[userId],
  };  res.render("urls_register", templateVars);
});

// REGISTER POST
app.post("/register", (req, res) => {
  const userId = req.session.user_id;
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
        password: bcrypt.hashSync(req.body.password, 10)
      };

      console.log("new user obj", users[randomID]);

      // const password = users[randomID].password; // you will probably this from req.params
      // const hashedPassword = bcrypt.hashSync(password, 10);
      // console.log("HASh Pword", hashedPassword);
   // clear a cookie in case it exists
    //req.session = null;                     // clear COOKIE
    res.clearCookie("session");
    res.clearCookie("session.sig");

  // set the cookie
    req.session.user_id = randomID;   // SETCOOKIE
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
  // console.log("params", req.params.id);
  let templateVars = { shortURL: req.params.id,
    urls: urlDatabase,
    user: users[userId] };

    if (!req.session.user_id) {
      res.send("Please Log In");
      console.log("access denied");
      return;

      } else if (req.session.user_id === users[req.session.user_id].id) {

        let urslexist = urlsForUser(req.session.user_id);
        let templateVars = {userURL: urslexist[req.params.id], shortURL: req.params.id, user: users[userId]};
            res.render("urls_show", templateVars);

          } else {
            res.send("This is not your URL");
          }
});


// this is the delete route
app.post("/urls/:id/delete", (req, res)=> {
  //console.log("delete body", req.body);
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

// on update pressed, call this
app.post("/urls/:id/update", (req, res)=> {
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect('/urls');
});

app.get("/u", (req, res) => {

  let templateVars = { shortURL: req.params.id,
    urls: urlDatabase,
   };
  res.render("urls_u", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  console.log("X",req.body);
  let longURL = urlDatabase[req.params.shortURL].longURL;
  console.log("New Long", longURL);
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



