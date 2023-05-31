import * as filmQuery from './film/film.js'
import * as auth from './auth/login.js'
import { AuthForm } from './types/auth'
import { Category, Pattern, Title } from './types/film'

// const list = await getFilmList()
// console.log('getFilmList ->', list)

export const resolvers = {
    Query: {
        login: (parent, args: AuthForm) => auth.login(args),
        filmList: () => filmQuery.getFilmList(),
        filmByTitle: (parent, args: Title) => filmQuery.getFilmByTitle(args),
        filmsByCategory: (parent, args: Category) =>
            filmQuery.getFilmsByCategory(args),
        filmsByTitlePattern: (parent, args: Pattern) =>
            filmQuery.getFilmsByTitlePattern(args),
        historyOfRentalsByCustomerId: (parent, args, contextValue) =>
            filmQuery.getHistoryOfRentalsByCustomerId(contextValue),
        rentalStats: (parent, args, contextValue) =>
            filmQuery.getRentalStats(contextValue),
    },
}
