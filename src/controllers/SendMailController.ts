import { AppError } from './../errors/AppError';
import { getCustomRepository } from 'typeorm';
import { Request, Response } from 'express';
import { UsersRepository } from '../repositories/UsersRepository';
import { SurveysRepository } from '../repositories/SurveysRepository';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';
import SendMailService from '../services/SendMailService';
import { resolve } from 'path';
import * as yup from "yup";

class SendMailController {
    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body

        const schema = yup.object().shape({
            email: yup.string().email().required("Email é obrigatório"),
            survey_id: yup.string().required("id da pesquisa é obrigatŕio")
        })

        try {
            schema.validate(request.body)
        } catch (error) {
            throw new AppError(error)
        }

        const usersRepository = getCustomRepository(UsersRepository)
        const surveyRepository = getCustomRepository(SurveysRepository)
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository)

        const user = await usersRepository.findOne({ email })

        if (!user) {
            throw new AppError("User does not exists")
        }

        const survey = await surveyRepository.findOne({ id: survey_id })

        if (!survey) {
            throw new AppError("Survey does not exists!")
        }

        const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs")

        const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
            where: { user_id: user.id, value: null },
            relations: ["user", "survey"]
        })

        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            id: "",
            link: process.env.URL_MAIL
        }

        if (surveyUserAlreadyExists) {
            variables.id = surveyUserAlreadyExists.id
            await SendMailService.execute(email, survey.title, variables, npsPath)
            return response.json(surveyUserAlreadyExists)
        }

        // Salvar as informaçãoes na tabela surveyUser
        const surveyUser = surveysUsersRepository.create({
            user_id: user.id,
            survey_id
        })
        await surveysUsersRepository.save(surveyUser)
        // Enviar email para o usuario
        variables.id = surveyUserAlreadyExists.id

        await SendMailService.execute(email, survey.title, variables, npsPath)

        return response.json(surveyUser)
    }
}

export { SendMailController }