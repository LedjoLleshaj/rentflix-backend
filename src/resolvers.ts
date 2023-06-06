import * as auth from './auth/login.js'
import { AuthForm } from './types/auth'
import { GraphQLError } from 'graphql'
import { getFilms } from './methods/get-films.js'
import { getRentsOfCustomer } from './methods/get-rents-of-customer.js'
import { getCategories, getCategoryOfFilm } from './methods/category.js'
import { getLanguageById } from './methods/language.js'
import { getActorsOfFilm } from './methods/actors.js'
import { getFilm } from './methods/get-film.js'
import { getAvailableStoresOfFilm } from './methods/stores.js'
import { getAddressById } from './methods/address.js'
import { getCityById } from './methods/city.js'
import { getCountryById } from './methods/country.js'
import { getUser, getUserRentalStats } from './methods/user.js'

export interface RContext {
    username?: string
    customer_id?: number
}

export const resolvers = {
    Query: {
        login: (parent, args: AuthForm) => auth.login(args),
        getFilms: (_, { filter }, context) =>
            requireContext(context) && getFilms({ filter }),
        getFilm: (_, { film_id }, context) =>
            requireContext(context) && getFilm(film_id),
        getRentsOfCustomer: (parent, { filter }, context) =>
            requireContext(context) &&
            getRentsOfCustomer({ customer_id: context.customer_id, filter }),
        getCategories: (_, __, context) =>
            requireContext(context) && getCategories(),
        getUser: (_, __, context) =>
            requireContext(context) && getUser(context),
    },
    Film: {
        category: (parent) => getCategoryOfFilm(parent.film_id),
        language: (parent) => getLanguageById(parent.language_id),
        actors: (parent) => getActorsOfFilm(parent.film_id),
        availableStores: (parent) => getAvailableStoresOfFilm(parent.film_id),
    },
    Store: {
        address: (parent) => getAddressById(parent.address_id),
    },
    Address: {
        city: (parent) => getCityById(parent.city_id),
    },
    City: {
        country: (parent) => getCountryById(parent.country_id),
    },
    User: {
        rental_stats: (parent) => getUserRentalStats(parent.customer_id),
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
