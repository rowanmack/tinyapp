const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "abc123": "http://www.facebook.com",
};

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}



app.listen(PORT, () => {
  console.log(`Tinyapp app listening on port ${PORT}!`);
});

//new shortened URL
app.post("/urls", (req, res) => {
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
  res.redirect(longURL);
});

//edit link on homepage to url_show
app.get("/u/:id/edit", (req, res) => {
  res.redirect("/urls/:id");
});

//username login
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls");
});

//update long url submit button on url_show
app.post("/urls/:id", (req, res) => {
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
  const templateVars = {
    urls: urlDatabase, 
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

//new tinylink submission page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});

//loads urls_show
app.get("/urls/:urlId", (req, res) => {
  const shortUrl = req.params.urlId;
  const longURL = urlDatabase[shortUrl];
  const templateVars = {
    longURL,
    id: shortUrl,
    username: req.cookies["username"]
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