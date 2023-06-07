import * as auth from './auth/login.js'
import { AuthForm } from './types/auth'
import { GraphQLError } from 'graphql'
import { getRental, getRentals, rentFilm } from './methods/rental.js'
import { getCategories, getCategoryOfFilm } from './methods/category.js'
import { getLanguageById } from './methods/language.js'
import { getActorsOfFilm } from './methods/actors.js'
import { getFilm, getFilms } from './methods/film.js'
import { getAvailableStoresOfFilm, getStoreById } from './methods/store.js'
import { getAddressById } from './methods/address.js'
import { getCityById } from './methods/city.js'
import { getCountryById } from './methods/country.js'
import { getUser, getUserRentalStats } from './methods/user.js'
import { getInventoryById } from './methods/inventory.js'
import { getPaymentOfRental } from './methods/payment.js'

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
        getRentals: (parent, { filter }, context) =>
            requireContext(context) &&
            getRentals({ customer_id: context.customer_id, filter }),
        getRental: (_, { rental_id }, context) =>
            requireContext(context) && getRental(rental_id),
        getCategories: (_, __, context) =>
            requireContext(context) && getCategories(),
        getUser: (_, __, context) =>
            requireContext(context) && getUser(context),
    },
    Mutation: {
        rentFilm: (_, { data: { film_id, store_id, rental_date } }, context) =>
            requireContext(context) &&
            rentFilm(film_id, store_id, rental_date, context.customer_id),
    },
    Film: {
        category: (parent) => getCategoryOfFilm(parent.film_id),
        language: (parent) => getLanguageById(parent.language_id),
        actors: (parent) => getActorsOfFilm(parent.film_id),
        availableStores: (parent) => getAvailableStoresOfFilm(parent.film_id),
    },
    Rental: {
        inventory: (parent) => getInventoryById(parent.inventory_id),
        payment: (parent) => getPaymentOfRental(parent.rental_id),
    },
    Inventory: {
        film: (parent) => getFilm(parent.film_id),
        store: (parent) => getStoreById(parent.store_id),
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
