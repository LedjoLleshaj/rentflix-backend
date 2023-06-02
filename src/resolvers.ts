import * as filmQuery from './film/film.js'
import * as auth from './auth/login.js'
import { AuthForm } from './types/auth'
import { Category, Pattern, Title } from './types/film'
import { GraphQLError } from 'graphql'

export interface RContext {
    username?: string
    customer_id?: number
}

export const resolvers = {
    mpaa_rating: {
        G: 'G',
        PG: 'PG',
        PG13: 'PG-13',
        R: 'R',
        NC17: 'NC-17',
    },
    Query: {
        login: (parent, args: AuthForm) => auth.login(args),
        filmList: (parent, args, contextValue: RContext) =>
            requireContext(contextValue) && filmQuery.getFilmList(),
        filmByTitle: (parent, args: Title, contextValue: RContext) =>
            requireContext(contextValue) && filmQuery.getFilmByTitle(args),
        filmsByCategory: (parent, args: Category, contextValue: RContext) =>
            requireContext(contextValue) && filmQuery.getFilmsByCategory(args),
        filmsByTitlePattern: (parent, args: Pattern, contextValue: RContext) =>
            requireContext(contextValue) &&
            filmQuery.getFilmsByTitlePattern(args),
        historyOfRentalsByCustomerId: (parent, args, contextValue: RContext) =>
            requireContext(contextValue) &&
            filmQuery.getHistoryOfRentalsByCustomerId(contextValue),
        rentalStatsByCustomerId: (parent, args, contextValue: RContext) =>
            requireContext(contextValue) &&
            filmQuery.getRentalStats(contextValue),
        getFilmDetails: (parent, args: Title, contextValue: RContext) =>
            requireContext(contextValue) && filmQuery.getFilmDetails(args),
        getCategories: (parent, args, contextValue: RContext) =>
            requireContext(contextValue) && filmQuery.getCategories(),
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
