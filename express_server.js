const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString, } = require("./helpers");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['bingbongbing', 'bongbingbong']
}));

//returns an array of URL ids associated with a given userID
const getUrlsForUser = function(id) {
  const userUrls = [];
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls.push(key);
    }
  }
  return userUrls;
};

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  '9sm5xK': {
    longURL: "http://www.google.com",
    userID: "abc123",
  },
};

//Object to store account information
const users = {
  abc123: {
    id: "abc123",
    email: "abc@gmail.com",
    password: "1"
  },
};

app.listen(PORT, () => {
  console.log(`Tinyapp app listening on port ${PORT}!`);
});

//General redirect to either login or urls page
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/urls/login');
  }
  res.redirect('/urls');
});

//account registration page
app.get("/urls/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = {
    user: ""
  };
  res.render("urls_register", templateVars);
});

//account register post request
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('Please provide an email and password!');
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send('Account already exists!');
  }
  const id = generateRandomString();
  users[id] = {
    id,
    email: email,
    password: bcrypt.hashSync(password, 10)
  };
  req.session.user_id = id;
  res.redirect("/urls");
});

//account login post request
app.post("/urls/login", (req, res) => {
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  if (!loginEmail || !loginPassword) {
    return res.status(400).send('Please provide an email and password!');
  }
  const foundUser = getUserByEmail(loginEmail, users);
  if (!foundUser) {
    return res.status(403).send('Account not registered');
  }
  if (!bcrypt.compareSync(loginPassword, foundUser.password)) {
    return res.status(403).send('Email/Password Incorrect');
  }
  req.session.user_id = foundUser.id;
  res.redirect("/urls");
});

//login page
app.get("/urls/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const user = users[req.session.user_id];
  const templateVars = {
    user: user
  };
  res.render("urls_login", templateVars);
});

//new shortened URL
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(400).send('Please login to shorten URLs! <a href="/login"></a>');
  }
  const id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect("/urls/" + id);
});

// tinylink to long url
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.status(400).send('this URL does not exist');
  }
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

//edit link on homepage to url_show
app.get("/u/:id/edit", (req, res) => {
  res.redirect("/urls/:id");
});

//user logout
app.post("/logout", (req, res) => {
  req.session = null;;
  res.redirect("/urls/login");
});

//update long url submit button on url_show
app.post("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.status(400).send('Please login to shorten URLs!');
  }
  const id = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[id]["longURL"] = newURL;
  res.redirect("/urls");
});

//delete button on homepage, deletes urls
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.status(400).send('file does not exist');
  }
  if (!req.session.user_id) {
    return res.status(400).send('You must login to delete');
  }
  if (req.session.user_id !== urlDatabase[id].userID) {
    return res.status(400).send('file does not exist');
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

//homepage, displays list of urls
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(403).send('Please login to view your URLs. <a href="/urls/login"><login</a>');
  }
  userUrls = getUrlsForUser(user.id);
  const templateVars = {
    urls: urlDatabase,
    user: user,
    userUrls: userUrls
  };
  res.render("urls_index", templateVars);
});

//new tinylink submission page
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/urls/login');
  }
  const user = users[req.session.user_id];
  const templateVars = {
    user: user
  };
  res.render("urls_new", templateVars);
});

//loads urls_show/edit page
app.get("/urls/:urlId", (req, res) => {
  const user = users[req.session.user_id];
  let shortUrl = req.params.urlId;
  //1. The user is logged in or not?
  if (!user) {
    return res.status(403).send('Please login to access this page');
  }
  //2. Checking whether the Short URL is valid or not?
  let longUrl;
  if (urlDatabase[shortUrl]) {
    longUrl = urlDatabase[shortUrl].longURL;
  } else {
    return res.status(403).send('invalid short url ID');
  }
  //3. Whether the Short URL belongs to the user logged in or not?
  if (urlDatabase[shortUrl].userID !== user.id) {
    return res.status(403).send('Page not accessible');
  }
  //4. HAPPY Path (Everything looks fine)
  const templateVars = {
    longUrl,
    id: shortUrl,
    user: user
  };
  res.render("urls_show", templateVars);
});