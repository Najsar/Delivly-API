const request = require('supertest');
const app = require('../app').app;
var req = request.agent(app);
//console.log = jest.fn();

describe('Testing API', () => {
    it('Connection to API', async (done) => {
        var res = await req.get('/api/');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe(1);
        done();
    });
    it('Logging to API', (done) => {
        req.post('/api/login')
        .send({nick: 'admin', pass: 'Qwerty1@3'})
        .then(res => {
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe(1);
            done();
        });
    })
    it('Checking user', async (done) => {
        var res = await req.get('/api/secure/get_user/')
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe(1);
        done();
    })
    
})
afterAll( async (done) => {
    done();
});