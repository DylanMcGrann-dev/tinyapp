const { assert } = require('chai');

const { loopEmail } = require('../helpers.js');

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

describe('loopEmail', function() {
  it('should return a user with valid email', function() {
    const user = loopEmail(testUsers, "user@example.com")
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  
  it('should return Undefined when passed an email that is not in our database', function() {
    const user = loopEmail(testUsers, 'doesnotexist@nope.com')
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  })
});