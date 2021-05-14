
const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const loopEmail = function(object, value) {
  for (const key in object) {         
    if (object[key]["email"] === value) {
      return key;
    };
  }
  return null;
};
console.log(loopEmail(testUsers, "user2@example.com"));
module.exports = { loopEmail };