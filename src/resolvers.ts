import * as filmQuery from './film/film.js'
import * as auth from './auth/login.js'
import { AuthForm } from './types/auth'
import { Title } from './types/film'
import { GraphQLError } from 'graphql'
import { getFilms } from './film/get-films.js'
import { getRentsOfCustomer } from './film/get-rents-of-customer.js'
import { getCategoryOfFilm } from './film/category.js'
import { getLanguageById } from './film/language.js'
import { getActorsOfFilm } from './film/actors.js'

export interface RContext {
    username?: string
    customer_id?: number
}

export const resolvers = {
    Query: {
        login: (parent, args: AuthForm) => auth.login(args),
        getFilms: (_, { filter }, context) =>
            requireContext(context) && getFilms({ filter }),
        getRentsOfCustomer: (parent, { filter }, context) =>
            requireContext(context) &&
            getRentsOfCustomer({ customer_id: context.customer_id, filter }),
        rentalStatsByCustomerId: (parent, args, contextValue: RContext) =>
            requireContext(contextValue) &&
            filmQuery.getRentalStats(contextValue),
        getFilmDetails: (parent, args: Title, contextValue: RContext) =>
            requireContext(contextValue) && filmQuery.getFilmDetails(args),
        getCategories: (parent, args, contextValue: RContext) =>
            requireContext(contextValue) && filmQuery.getCategories(),
    },
    Film: {
        category: (parent) => getCategoryOfFilm(parent.film_id),
        language: (parent) => getLanguageById(parent.language_id),
        actors: (parent) => getActorsOfFilm(parent.film_id),
    },
}

function requireContext(context: RContext) {
    if (!context.customer_id || !context.username) {
        throw new GraphQLError('Token not found', {
            extensions: {
                code: 'UNAUTHENTICATED',
                http: { status: 401 },
            },
        })
    }
    return true
}
