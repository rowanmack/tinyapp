const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); //populates req.body
app.use(cookieParser()); //populates req.cookies

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  '9sm5xK': {
    longURL: "http://www.google.com",
    userID: "abc123",
  },
  'hbk9uh': {
    longURL: "http://www.facebook.com",
    userID: "abc123"
  }
};

//Object to store account information
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "2",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  abc123: {
    id: "abc123",
    email: "abc@gmail.com",
    password: "1"
  },
};

//FUNCTIONs --------------------------------------------------|

//random string for accountId's and shortnening URLs
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
//email lookup in users object
const getUserByEmail = (email) => {
  let userObj = null;
  for (const user in users) {
    const userEmail = users[user]['email'];
    if (userEmail === email) {
      userObj = users[user];
      return userObj;
    }
  }
  return userObj;
};
//returns an array of URL ids associated with a given userID
const getUrlsForUser = function(id) {
  const userUrls = [];
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls.push(key)  
    }
  }
  return userUrls;
};

//--------------------------------------------------------------|
//--------------------------------------------------------------|

app.listen(PORT, () => {
  console.log(`Tinyapp app listening on port ${PORT}!`);
});

//account registration page
app.get("/urls/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect('/urls');
  }
  const templateVars = {
    user: ""
  };
  res.render("urls_register", templateVars);
});

//account register post
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('Please provide an email and password!');
  }

  if (getUserByEmail(email)) {
    return res.status(400).send('Account already exists!');
  }
  const id = generateRandomString();
  users[id] = {
    id,
    email: email,
    password: bcrypt.hashSync(password, 10)
  };
  res.cookie('user_id', id);
  res.redirect("/urls");
});

//account login post
app.post("/urls/login", (req, res) => {
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;

  if (!loginEmail || !loginPassword) {
    return res.status(400).send('Please provide an email and password!');
  }
  const foundUser = getUserByEmail(loginEmail);

  if (!foundUser) {
    return res.status(403).send('Account not registered');
  }

  if (!bcrypt.compareSync(loginPassword, foundUser.password)) {
    return res.status(403).send('Email/Password Incorrect');
  }

  console.log("users:", users)
  
  res.cookie("user_id", foundUser.id);
  res.redirect("/urls");
});

//login page
app.get("/urls/login", (req, res) => {

  if (req.cookies["user_id"]) {
     res.redirect('/urls');
  }
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user: user
  };
  res.render("urls_login", templateVars);
});

//new shortened URL
app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(400).send('Please login to shorten URLs! <a href="/login"></a>');
  }
  const shortUrl = generateRandomString();
  const newlongURL = req.body.longURL;
  urlDatabase[shortUrl] = {};
  urlDatabase[shortUrl]["longURL"] = newlongURL;
  res.redirect(`/urls/${shortUrl}`);
});

// tinylink to long url
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id]["longURL"];
  if (!longURL) {
    return res.status(400).send('this URL does not exist');
  }
  res.redirect(longURL);
});

//edit link on homepage to url_show
app.get("/u/:id/edit", (req, res) => {
  res.redirect("/urls/:id");
});
/** ---------------------------------------
 * these are post routes: *
 * ----------------------------------------
*/
//user logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls/login");
});

//update long url submit button on url_show
app.post("/urls/:id", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(400).send('Please login to shorten URLs!');
  }
  const id = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[id]["longURL"] = newURL;
  res.redirect(`/urls/${id}`);
});

//delete button on homepage, deletes urls
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  if(!urlDatabase[id]) {
    return res.status(400).send('file does not exist');
  }

  if(!req.cookies["user_id"]) {
    return res.status(400).send('You must login to delete');
  }

  if(!req.cookies["user_id"] !== urlDatabase[id].userID) {
    return res.status(400).send('file does not exist');
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

//homepage, displays list of urls
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if(!user) {
   return res.status(403).send('Please login to view your URLs. <a href="/urls/login"><login</a>')
  }

  // console.log("getUrlsForUser:", getUrlsForUser(user.id)); -> works, provides:[ '9sm5xK', 'hbk9uh' ]
  
  userUrls = getUrlsForUser(user.id)

  const templateVars = {
    urls: urlDatabase,
    user: user,
    userUrls: userUrls
  };
  res.render("urls_index", templateVars);
});

//new tinylink submission page
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect('/urls/login');
  }
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user: user
  };
  res.render("urls_new", templateVars);
});

//loads urls_show/edit page
app.get("/urls/:urlId", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const shortUrl = req.params.urlId;
  console.log("shortUrl:", shortUrl)
  const longUrl = urlDatabase[shortUrl]["longURL"];

  if (!user) {
    return res.status(403).send('Please login to access this page');
  }

  if (urlDatabase[shortUrl].userID !== user.id) {
    return res.status(403).send('Page not accessible');
  }

  const templateVars = {
    longUrl,
    id: shortUrl,
    user: user
  };
  res.render("urls_show", templateVars);
});