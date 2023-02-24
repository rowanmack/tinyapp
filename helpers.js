//lookup user from a database via email
const getUserByEmail = (email, database) => {
  let userObj = null;
  for (const user in database) {
    const userEmail = database[user]['email'];
    if (userEmail === email) {
      userObj = database[user];
      return userObj;
    }
  }
  return userObj;
};

//random string for accountId's and short URLs
const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = {
  getUserByEmail,
  generateRandomString,
};