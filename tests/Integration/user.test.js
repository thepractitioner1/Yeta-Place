const request = require("supertest");
const config = require("config");
const {User} = require("../../model/user");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
let server;

describe('/api/user',()=>{
    beforeEach(()=>{server = require('../../index');})
    afterEach(async () => { 
        await server.close(); 
        await User.remove({});
      });

      describe('GET /' ,()=>{
        it('should return all users', async()=>{
            const users = [
                {email: 'johnnytest@yahoo.com'},
                {email: 'aboy@yahoo.com'}
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

        it('should return 401 if client is not logged on' ,async()=>{
          const token = "";
          const user = new User({ email: 'aboy@gmail.com', password: "12345",username:"aboy" });
          await user.save();
          let id = user._id;
          const res = await request(server).get('/api/user/'+id).set('x-auth-token', token);

         expect(res.status).toBe(401);
        })

        it('should return 400 if token is invalid' ,async()=>{
          const token = new User().generateAuthToken() +"1";

          const user = new User({ email: 'aboy@gmail.com', password: "12345",username:"aboy" });
          await user.save();
          let id = user._id;
          const res = await request(server).get('/api/user/'+id).set('x-auth-token', token);

         expect(res.status).toBe(400);
        })


        it('should return 200 & a valid user if user is logged on' ,async()=>{
          const token = new User().generateAuthToken();

          const user = new User({ email: 'aboy@gmail.com', password: "12345",username:"aboy" });
          await user.save();
          let id = user._id;
          
          const res = await request(server).get('/api/user/'+id).set('x-auth-token', token).send();
          console.log(res.body);
         expect(res.status).toBe(200);
         expect(res.body).toHaveProperty('_id', user._id.toHexString());
         expect(res.body).toHaveProperty('email', user.email);
         expect(res.body).toHaveProperty('username', user.username);
        })
      })

      describe("POST /" ,()=>{
        beforeEach()

        it("should return if ")
      });

})