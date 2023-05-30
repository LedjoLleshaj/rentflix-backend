import { Film, Category, Title, Pattern } from '../types/film'
import { poolDvdRental } from '../services/databases.js'
import { RContext } from '../resolvers.js'

// Default are ordered by title (ASC)
export async function getFilmList(contextValue: RContext): Promise<[Film]> {
    console.log(contextValue)
    const response = await poolDvdRental.query(
        `SELECT * FROM film ORDER BY title`
    )
    return response.rows
}

export async function getFilmByTitle(title: Title): Promise<[Film]> {
    const q = `SELECT * FROM film WHERE title = $1`
    const response = await poolDvdRental.query(q, [title.title])
    return response.rows
}

export async function getFilmsByTitlePattern(
    pattern: Pattern
): Promise<[Film]> {
    const q = `SELECT * FROM film WHERE title LIKE %$1% LIMIT 5`
    const response = await poolDvdRental.query(q, [pattern.pattern])
    return response.rows
}

export async function getFilmsByCategory(category: Category): Promise<[Film]> {
    const q = `
    SELECT * FROM film f
        JOIN film_category fc on f.film_id = fc.film_id
        JOIN category cat on cat.category_id = fc.category_id
    WHERE cat.name = $1
    ORDER BY f.title`
    const response = await poolDvdRental.query(q, [category.category])
    return response.rows
}
