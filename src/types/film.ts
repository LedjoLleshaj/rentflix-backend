export interface Film {
    film_id: number
    title: string
    description?: string
    release_year?: number
    language: string
    rental_duration: number
    rental_rate: number
    length?: number
    replacement_cost: number
    rating?: string
    last_update: string
    special_features: [string]
    fulltext: string
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
