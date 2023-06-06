export interface Address {
    street: string
    city: string
    region: string
    country: string
}

export interface FilmDetails {
    film_id: number
    title: string
    release_year: number
    language: string
    length: number // in minutes
    rating: string
    description: string
    actors: string // comma separated list of actors
    category: string
    rental_duration: number // in days
    rental_rate: number
    disponibility: Address[] // address of the store where the film is available
}

export interface Category {
    category: string
}

export interface Title {
    title: string
}

export interface Pattern {
    pattern: string
}

export interface Rental_History {
    title: string
    rental_date: string
    return_date?: string
    address: string
    amount: number
}

export interface RentalStats {
    current_rentals: number
    total_amount: number
    most_frequent_category: string
    total_rentals: number
}
