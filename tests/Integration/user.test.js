const request = require("supertest");
const config = require("config");
const { User } = require("../../model/user");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
let server;
const bcrypt = require("bcrypt");

describe('/api/user', () => {
  beforeEach(() => { server = require('../../index'); })
  afterEach(async () => {
    await server.close();
    await User.remove({});
  });

  describe('GET /', () => {
    it('should return all users', async () => {
      const users = [
        { email: 'johnnytest@yahoo.com' },
        { email: 'aboy@yahoo.com' }
      ];
      await User.collection.insertMany(users);

      const res = await request(server).get('/api/user');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(u => u.email === 'johnnytest@yahoo.com')).toBeTruthy();
      expect(res.body.some(u => u.email === 'aboy@yahoo.com')).toBeTruthy();
    })

    // it('should return a the current user', async()=>{
    //   const user = new User({ email: 'aboy@gmail.com', password: "12345",username:"aboy" });
    //   await user.save();
    //  let token = jwt.sign({ _id: user._id,username:user.username, isadmin: user.isadmin }, config.get('jwtPrivateKey'))
    //   console.log(token);

    //   const res = await request(server).get('api/user/me').set('x-auth-token', token);

    //   console.log(res.body);
    // })

    it('should return 401 if client is not logged on', async () => {
      const token = "";
      const user = new User({ email: 'aboy@gmail.com', password: "12345", username: "aboy" });
      await user.save();
      let id = user._id;
      const res = await request(server).get('/api/user/' + id).set('x-auth-token', token);

      expect(res.status).toBe(401);
    })

    it('should return 400 if token is invalid', async () => {
      const token = new User().generateAuthToken() + "1";

      const user = new User({ email: 'aboy@gmail.com', password: "12345", username: "aboy" });
      await user.save();
      let id = user._id;
      const res = await request(server).get('/api/user/' + id).set('x-auth-token', token);

      expect(res.status).toBe(400);
    })


    it('should return 200 & a valid user if user is logged on', async () => {
      const token = new User().generateAuthToken();

      const user = new User({ email: 'aboy@gmail.com', password: "12345", username: "aboy" });
      await user.save();
      let id = user._id;

      const res = await request(server).get('/api/user/' + id).set('x-auth-token', token).send();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', user._id.toHexString());
      expect(res.body).toHaveProperty('email', user.email);
      expect(res.body).toHaveProperty('username', user.username);
    })
  })



  describe("POST /", () => {

    const exec = async () => {
      return await request(server)
        .post('/api/user/createUser')
        .send({ username, password, email })
    }

    beforeEach(() => {
      username = "aboyisgreat",
        password = "royalty111",
        email = "aboy@123.com"
    })

    it("should return 400 if username is less than 3 characters", async () => {

      username = "";
      let res = await exec();

      expect(res.status).toBe(400);

    })

    it("should return 400 if password is less than 5 characters", async () => {

      password = "absc";
      let res = await exec();


      expect(res.status).toBe(400);

    })


    it("should return 400 if email is not valid", async () => {

      email = "absc";
      let res = await exec();


      expect(res.status).toBe(400);

    })

    it('should return 400 if username is more than 50 characters', async () => {
      username = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if password is more than 30 characters', async () => {
      password = new Array(32).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });





    it("should return 400 if user already exists in the database", async () => {
      let user = new User({ email: "aboy@123.com", password: "12344", username: "123" });
      await user.save();

      let res = await exec();

      expect(res.status).toBe(400);


    })

    it("should save the user if user does not exist in the database", async () => {

      await exec();

      const user = await User.find({ email: 'aboy@123.com' });

      expect(user).not.toBeNull();
      expect(user).toHaveProperty('email', user.email);
      expect(user).toHaveProperty('username', user.username);

    })

  });

  describe("PUT /", () => {
    let token;
    let new_password;
    let id;

    const exec = async () => {
      return await request(server)
        .put('/api/user/updatePassword/' + id)
        .set('x-auth-token', token)
        .send({ password: new_password })
    }

    beforeEach(async () => {
      const user = new User({ username: "Aboy", password: "test123}", email: "aboy@123.com" })
      await user.save();
      token = new User().generateAuthToken();
      id = user._id;

      new_password = "misanisking";
    })

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if password is less than 5 characters", async () => {

      new_password = "";
      let res = await exec();


      expect(res.status).toBe(400);

    });

    it('should return 400 if password is more than 30 characters', async () => {
      new_password = new Array(32).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 404 if id is invalid', async () => {
      id = "";

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if user with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should update the user if input is valid', async () => {
      await exec();

      const updated_user = await User.findById(id);
      const validPassword = await bcrypt.compare(new_password, updated_user.password);

      expect(validPassword).toBe(true);
    });
  })


  describe("DELETE /", () => {

    let token;
    let user;
    let id;

    const exec = async () => {
      return await request(server)
        .delete('/api/user/delete/' + id)
        .set('x-auth-token', token)
        .send();
    }

    beforeEach(async () => {
      // Before each test we need to create a user and 
      // put it in the database.      
      user = new User({ username: "Aboy", password: "test123}", email: "aboy@123.com" })
      await user.save();

      id = user._id;
      token = new User({ isAdmin: true }).generateAuthToken();
    })

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 403 if the user is not an admin', async () => {
      token = new User({ isAdmin: false }).generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it('should return 404 if id is invalid', async () => {
      id = "";

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no user with the given id was found', async () => {
      id = "";

      const res = await exec();

      expect(res.status).toBe(404);
    });

    // it('should delete the user if input is valid', async () => {
    //   await exec();

    //   const userInDb = await User.findById(id);
    //   console.log(userInDb);

    //   expect(userInDb).toBeNull();
    // });

    // it('should return the removed user', async () => {
    //   const res = await exec();
    //   console.log(res.body);
    //   expect(res.body).toHaveProperty('_id', user._id.toHexString());
    //   expect(res.body).toHaveProperty('name', user.name);
    // });
  });

})