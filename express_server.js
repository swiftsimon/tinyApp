// tinyApp
// Allow registered users to shorten long URLs to
  // a randomly generated 6 character string
// Encrypt passwords and cookies

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
  let random = generateRandomString();
  let longURL = req.body.longURL;
  let shortURL = random;
  urlDatabase[shortURL] = { longURL: longURL, id: req.session.user_id };
  res.redirect('/urls');
});


//on Login POST call
app.post("/login", (req, res) => {
  const username = req.body.login_email;
  const password = req.body.login_password;
  const passLogin = checkPassword(username, password);
  // if true, passLogin is object of user

 function checkPassword(userEmail, password) {
  // if input fields are empty redirect to register page
  if(!username || !password) {
    res.redirect('/register');
  }
  //compare user object to input password to verify
   for (let key in users) {
    if(users[key].email === username &&
      bcrypt.compareSync(password, users[key].password)) {
        return users[key];
      }
   }
  return false;
  }

  if (passLogin) {
    // redirect to urls
    req.session.user_id = passLogin.id;          // SETCOOKIE
    res.redirect('/urls');
  } else {
    //send error
    res.status(401).send("Log in Error");
  }
});

// on logout POST call
app.post("/logout", (req, res) => {
  //clear the existing cookie when user logs out
  req.session = null;                               // clear COOKIE
  res.redirect('/urls');
});


app.get("/", (req, res) => {
  let current_user = req.session.user_id;
  if (current_user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// Login GET call
app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id] ? users[req.session.user_id].email : '',
  };
  // if user is not logged in deny access
  if (!req.session.user_id) {
    res.send("Please Log In");
      return;
    } else {
  // if user is logged in render their own urls
      if (req.session.user_id === users[req.session.user_id].id) {
        templateVars.urls = urlsForUser(req.session.user_id);
        res.render("urls_index", templateVars);
  // back up "fail" catch
    } else {
    res.send("Please Log In");
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
    }
  }
// if not logged in redirect to login page
   res.redirect('/login');
});

// Register GET endpoint
app.get("/register", (req, res) => {
  //if cookie exists redirect to urls
  const userId = req.session.user_id;
  let templateVars = {
    urls: urlDatabase,
    user: users[userId],
  };  res.render("urls_register", templateVars);
});

// Register POST
app.post("/register", (req, res) => {
  const userId = req.session.user_id;
  let templateVars = {
    urls: urlDatabase,
    user: users[userId],
  };
  let randomID = generateRandomString();
  testLoginInput();
  // if email or password are empty strings, send response 400 status code
  function testLoginInput () {
    if(!req.body.email || !req.body.password) {
    res.status(404);
    res.render('404Error');
  } else if (userExists(req.body.email) === true){
    // check if username already exists
      res.status(400);
      res.render('400error');
  } else {
      users[randomID] = {
        id: randomID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };

    res.clearCookie("session");        // clear COOKIE
    res.clearCookie("session.sig");
    req.session.user_id = randomID;   // set COOKIE
    res.redirect('/urls');
  }
 }
// create function to see if user email exists already
 function userExists(email) {
   for (let key in users) {
    if(users[key].email === email) {
      return true;
    }
  }
  return false;
 };

});


// 'show' page
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  let templateVars = { shortURL: req.params.id,
    urls: urlDatabase,
    user: users[userId] };
  // check if user is logged in
  if (!req.session.user_id) {
    res.send("Please Log In");
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
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// this is the update page linked from edit button
app.post("/urls/:id", (req, res)=> {
  let short = req.params.id;
  res.redirect(`/urls/${short}`);
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
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



