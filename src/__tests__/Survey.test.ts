import request from 'supertest';
import { getConnection } from 'typeorm';
import { app } from '../app';
import createConnection from '../database';


describe("Survey", () => {
    beforeAll(async () => {
        const connection = await createConnection()
        await connection.runMigrations()
    })

    afterAll(async () => {
        const connection = getConnection()
        await connection.dropDatabase()
        await connection.close()
    })

    it("Should be able to create a new survey", async () => {
        const newLocal = "/surveys";
        const response = await request(app).post(newLocal).send({
            title: "Survey Example",
            description: "testando tudo kkkkkkk",
        })

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty("id")
    })

    it("Should be able to get all survey", async () => {
        const newLocal = "/surveys";
        await request(app).post(newLocal).send({
            title: "Survey Example2",
            description: "testando tudo kkkkkkk2",
        })

        const response = await request(app).get(newLocal)

        expect(response.body.length).toBe(2)
    })
})