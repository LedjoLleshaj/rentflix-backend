import jwt from 'jsonwebtoken'
import { AuthForm, AuthResponse } from '../types/auth'
import dotenv from 'dotenv'
import { GraphQLError } from 'graphql'
import { poolPostgres } from '../services/databases.js'

dotenv.config({ path: '.env.dev' })
const SECRET_KEY = process.env.SECRET_KEY

export async function login(form: AuthForm): Promise<AuthResponse> {
    const { username, password } = form

    const query = await poolPostgres.query(
        'SELECT * FROM public.users WHERE username = $1 AND password_md5 = $2',
        [username, password]
    )
    if (query.rows.length === 0) {
        throw new GraphQLError(
            'You are not authorized to perform this action.',
            {
                extensions: {
                    code: 'FORBIDDEN',
                },
            }
        )
    }
    const token = jwt.sign({ username: username }, SECRET_KEY, {
        expiresIn: '2 days',
    })

    return {
        token: token,
    }
}
