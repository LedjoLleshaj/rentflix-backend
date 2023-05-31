import * as filmQuery from './film/film.js'
import * as auth from './auth/login.js'
import { AuthForm } from './types/auth'
import { Category, Pattern, Title } from './types/film'

export interface RContext {
    username?: string
    customer_id?: number
}

export const resolvers = {
    Query: {
        login: (parent, args: AuthForm) => auth.login(args),
        filmList: (parents, args) => filmQuery.getFilmList(),
        filmByTitle: (parent, args: Title) => filmQuery.getFilmByTitle(args),
        filmsByCategory: (parent, args: Category) =>
            filmQuery.getFilmsByCategory(args),
        filmsByTitlePattern: (parent, args: Pattern) =>
            filmQuery.getFilmsByTitlePattern(args),
        historyOfRentalsByCustomerId: (parent, args, contextValue: RContext) =>
            filmQuery.getHistoryOfRentalsByCustomerId(contextValue),
        rentalStatsByCustomerId: (parent, args, contextValue: RContext) =>
            filmQuery.getRentalStats(contextValue),
        getFilmDetails: (parent, args: Title) => filmQuery.getFilmDetails(args),
    },
}
