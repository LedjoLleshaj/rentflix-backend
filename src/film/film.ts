import {
    Film,
    Category,
    Title,
    Pattern,
    Rental_History,
    RentalStats,
} from '../types/film'
import { poolDvdRental } from '../services/databases.js'
import { RContext } from '../resolvers.js'

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
    context: RContext
): Promise<[Rental_History]> {
    const customer_id = context.customer_id
    const q_history = `
    SELECT f.title,r.rental_date,r.return_date, ad.address,p.amount FROM rental r
        INNER JOIN inventory i on r.inventory_id = i.inventory_id
        INNER JOIN film f on f.film_id = i.film_id
        INNER JOIN store st on st.store_id = i.store_id
        INNER JOIN address ad on ad.address_id = st.address_id
        INNER JOIN payment p on p.rental_id = r.rental_id
    WHERE r.customer_id = $1
    ORDER BY r.return_date DESC
    `
    const response = await poolDvdRental.query(q_history, [customer_id])
    console.log(response.rows)
    return response.rows
}

export async function getRentalStats(context: RContext): Promise<RentalStats> {
    const customer_id = context.customer_id
    const q_current_rentals = `SELECT COUNT(*) as active_rentals FROM rental where customer_id = $1 and return_date is NULL`
    const q_current_rentals_response = await poolDvdRental.query(
        q_current_rentals,
        [customer_id]
    )

    const q_sum = `SELECT SUM(amount) FROM payment WHERE rental_id IN (SELECT rental_id FROM rental WHERE customer_id = $1)`
    const q_sum_response = await poolDvdRental.query(q_sum, [customer_id])

    const q_count = `SELECT COUNT(*) FROM rental WHERE customer_id = $1`
    const q_count_response = await poolDvdRental.query(q_count, [customer_id])

    const q_most_frequent_category = `
    SELECT cat.name, COUNT(cat.name) as fav_cat FROM rental r
        INNER JOIN inventory i on r.inventory_id = i.inventory_id
        INNER JOIN film f on f.film_id = i.film_id
        INNER JOIN store st on st.store_id = i.store_id
        INNER JOIN address ad on ad.address_id = st.address_id
        INNER JOIN payment p on p.rental_id = r.rental_id
	  	INNER JOIN film_category fcat on f.film_id = fcat.film_id
		INNER JOIN category cat on fcat.category_id = cat.category_id
    WHERE r.customer_id = $1
    GROUP BY cat.name
    ORDER BY fav_cat DESC LIMIT 1`
    const q_most_frequent_category_response = await poolDvdRental.query(
        q_most_frequent_category,
        [customer_id]
    )

    return {
        current_rentals: q_current_rentals_response.rows[0].active_rentals,
        total_amount: q_sum_response.rows[0].sum,
        total_rentals: q_count_response.rows[0].count,
        most_frequent_category: q_most_frequent_category_response.rows[0].name,
    }
}
