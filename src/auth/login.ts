import jwt from 'jsonwebtoken'
import { AuthForm, AuthResponse } from '../types/auth'
import dotenv from 'dotenv'
import { GraphQLError } from 'graphql'
import { poolPostgres, poolDvdRental } from '../services/databases.js'
import crypto from 'crypto'

dotenv.config({ path: '.env.dev' })
const SECRET_KEY = process.env.SECRET_KEY

export async function login(form: AuthForm): Promise<AuthResponse> {
    const password = crypto
        .createHash('md5')
        .update(form.password)
        .digest('hex')

    const query = await poolPostgres.query(
        'SELECT * FROM public.users WHERE username = $1 AND password_md5 = $2',
        [form.username, password]
    )
    if (query.rows.length === 0) {
        throw new GraphQLError(
            'Authentication failed. Please check your username or password.',
            {
                extensions: {
                    code: 'UNAUTHENTICATED',
                    http: { status: 401 },
                },
            }
        )
    }
    const customer_id = query.rows[0].customer_id
    const user_info = await poolDvdRental.query(
        `SELECT first_name,last_name,email FROM customer WHERE customer_id = $1`,
        [customer_id]
    )
    return {
        token: jwt.sign(
            { username: form.username, customer_id: customer_id },
            SECRET_KEY,
            {
                expiresIn: '24h',
            }
        ),
        first_name: user_info.rows[0]?.first_name,
        last_name: user_info.rows[0]?.last_name,
    }
}
