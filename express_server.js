const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "abc123": "http://www.facebook.com"
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("<html><body>Hello! This is your <b>home page</b>!</body></html>\n");
});

app.get("/urls", (req, res) => {
const templateVars = {
  urls : urlDatabase
}
  res.render("urls_index", templateVars);
});

app.get("/urls/:urlId", (req, res) => {
  const shortUrl = req.params.urlId
  const longURL = urlDatabase[shortUrl]
  const templateVars = {
    longURL,
    id : shortUrl
  }
  res.render("urls_show", templateVars);
})

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });