import * as filmQuery from './film/film.js'
import * as auth from './auth/login.js'
import { AuthForm } from './types/auth'
import { GraphQLError } from 'graphql'
import { getFilms } from './film/get-films.js'
import { getRentsOfCustomer } from './film/get-rents-of-customer.js'
import { getCategories, getCategoryOfFilm } from './film/category.js'
import { getLanguageById } from './film/language.js'
import { getActorsOfFilm } from './film/actors.js'
import { getFilm } from './film/get-film.js'
import { getAvailableStoresOfFilm } from './film/stores.js'
import { getAddressById } from './film/address.js'
import { getCityById } from './film/city.js'
import { getCountryById } from './film/country.js'

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
        rentalStatsByCustomerId: (parent, args, contextValue: RContext) =>
            requireContext(contextValue) &&
            filmQuery.getRentalStats(contextValue),
        getCategories: (_, __, context) =>
            requireContext(context) && getCategories(),
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
