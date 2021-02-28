import request from 'supertest';
import { getConnection } from 'typeorm';
import { app } from '../app';
import createConnection from '../database';


describe("Users", () => {
    beforeAll(async () => {
        const connection = await createConnection()
        await connection.runMigrations()
    })

    afterAll(async () => {
        const connection = getConnection()
        await connection.dropDatabase()
        await connection.close()
    })

    it("Should be able to create a new user", async () => {
        const newLocal = "/users";
        const response = await request(app).post(newLocal).send({
            name: "User Example2",
            email: "user2@example.com",
        })

        expect(response.status).toBe(201)
    })

    it("Should not be able to create a user with exists email", async () => {
        const newLocal = "/users";
        const response = await request(app).post(newLocal).send({
            name: "User Example2",
            email: "user2@example.com",
        })

        expect(response.status).toBe(400)
    })
})