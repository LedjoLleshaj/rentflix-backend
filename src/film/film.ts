import { Film, Category, Title, Pattern, Rental_History } from '../types/film'
import { poolDvdRental } from '../services/databases.js'

// Default are ordered by title (ASC)
export async function getFilmList(): Promise<[Film]> {
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

export async function getHistoryOfRentalsByCustomerId(
    context
): Promise<[Rental_History]> {
    const q = `
    SELECT f.title,r.rental_date,r.return_date, ad.address,p.amount FROM rental r
        INNER JOIN inventory i on r.inventory_id = i.inventory_id
        INNER JOIN film f on f.film_id = i.film_id
        INNER JOIN store st on st.store_id = i.store_id
        INNER JOIN address ad on ad.address_id = st.address_id
        INNER JOIN payment p on p.rental_id = r.rental_id
    WHERE r.customer_id = $1
    ORDER BY r.return_date DESC;
    `
    const response = await poolDvdRental.query(q, [context.user.customer_id])
    return response.rows
}
