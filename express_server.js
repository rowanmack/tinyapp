const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); //populates req.body
app.use(cookieParser()); //populates req.cookies

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "abc123": "http://www.facebook.com",
};

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

//Object to store account information
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  'abc123' : {
    id: "abc123",
    email: "abc@gmail.com",
    password: "1"
  },
};
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


app.listen(PORT, () => {
  console.log(`Tinyapp app listening on port ${PORT}!`);
});

//account registration page
app.get("/urls/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect('/urls')
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
  if (getUserByEmail(email)) {
    return res.status(400).send('Account already exists!');
  }
  if (!email || !password) {
    return res.status(400).send('Please provide an email and password!');
  }
  const id = generateRandomString();
  users[id] = {
    id,
    email: email,
    password: password
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
  const foundUser = getUserByEmail(loginEmail)
  console.log("foundUser var:", foundUser);
  if (!foundUser) {
    return res.status(403).send('Account not registered');
  }
  const userID = foundUser["id"];
  if (loginPassword !== foundUser["password"]) {
    return res.status(403).send('Email/Password Incorrect');
  }
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

//login page
app.get("/urls/login", (req, res) => {

  if (req.cookies["user_id"]) {
    res.redirect('/urls')
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
    return res.status(400).send('Please login to shorten URLs!')
  }
  const shortUrl = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortUrl] = longURL;
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${shortUrl}`);
});

// tinylink to long url
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if(!longURL){
    return res.status(400).send('this URL does not exist')
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
    return res.status(400).send('Please login to shorten URLs!')
  }
  const id = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[id] = newURL;
  res.redirect(`/urls/${id}`);
});

//delete button on homepage, deletes urls
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

//homepage, displays list of urls
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  res.render("urls_index", templateVars);
});

//new tinylink submission page
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect('/urls/login')
  }
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user: user
  };
  res.render("urls_new", templateVars);
});

//loads urls_show
app.get("/urls/:urlId", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const shortUrl = req.params.urlId;
  const longURL = urlDatabase[shortUrl];
  const templateVars = {
    longURL,
    id: shortUrl,
    user: user
  };
  res.render("urls_show", templateVars);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });