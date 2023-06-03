import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import express from 'express'
import http from 'http'
import cors from 'cors'
import bodyParser from 'body-parser'
import { readFileSync } from 'fs'
import { RContext, resolvers } from './resolvers.js'
import { GraphQLError } from 'graphql'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config({ path: '.env.dev' })
const SECRET_KEY = process.env.SECRET_KEY

// Required logic for integrating with Express
const app = express()
// Our httpServer handles incoming requests to our Express app.
// Below, we tell Apollo Server to "drain" this httpServer,
// enabling our servers to shut down gracefully.
const httpServer = http.createServer(app)

const typeDefs = readFileSync('src/schema.graphql')

// Same ApolloServer initialization as before, plus the drain plugin
// for our httpServer.
const server = new ApolloServer<RContext>({
    typeDefs: `${typeDefs}`,
    resolvers: resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
})
// Ensure we wait for our server to start
await server.start()

// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.
app.use(
    '/',
    cors<cors.CorsRequest>(),
    // 50mb is the limit that `startStandaloneServer` uses, but you may configure this to suit your needs
    bodyParser.json({ limit: '50mb' }),
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(server, {
        context: async ({ req }) => {
            let token = req.headers.authorization
            // Check if the token is well formatted
            if (!token || token.indexOf('Bearer ') === -1) {
                // disable the authentication for the login
                if (req.body.operationName === 'Login') {
                    return {}
                }
                throw new GraphQLError('Token not found', {
                    extensions: {
                        code: 'BAD_REQUEST',
                        http: { status: 400 },
                    },
                })
            }
            token = token.replace('Bearer ', '')
            try {
                const payload = jwt.verify(token, SECRET_KEY) as RContext
                return {
                    username: payload.username,
                    customer_id: payload.customer_id,
                }
            } catch (e) {
                throw new GraphQLError(
                    'Token is invalid. Please login again.',
                    {
                        extensions: {
                            code: 'UNAUTHENTICATED',
                            http: { status: 401 },
                        },
                    }
                )
            }
        },
    })
)

// Modified server startup
await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve))
console.log(`🚀 Server ready at http://localhost:4000/`)
