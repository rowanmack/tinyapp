

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

module.exports = {
  getUserByEmail,
};