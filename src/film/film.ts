import {
    Film,
    Category,
    Title,
    Pattern,
    Rental_History,
    RentalStats,
    FilmDetails,
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
    const q = 'SELECT * FROM film WHERE title LIKE $1 LIMIT 5'
    const patternValue = `%${pattern.pattern}%`
    const response = await poolDvdRental.query(q, [patternValue])

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

export async function getFilmDetails(title: Title): Promise<FilmDetails> {
    const q = `
    SELECT f.film_id,f.title, f.release_year, lang.name as language, f.length, f.rating, f.description,
        GROUP_CONCAT(CONCAT(a.first_name, ' ', a.last_name)) as actors, cat.name as category, f.rental_duration, f.rental_rate
    FROM film f
        INNER JOIN film_actor fa on f.film_id = fa.film_id
        INNER JOIN actor a on fa.actor_id = a.actor_id
        INNER JOIN film_category fcat on f.film_id = fcat.film_id
        INNER JOIN category cat on fcat.category_id = cat.category_id
        INNER JOIN language lang on f.language_id = lang.language_id
    WHERE f.title = $1
    GROUP BY f.film_id,cat.name,lang.name`

    const response = await poolDvdRental.query(q, [title.title])

    const q_film_inventory = `
    SELECT distinct a.address as street,c.city, a.district as region, c2.country
        FROM inventory i
            JOIN rental r on i.inventory_id = r.inventory_id
            JOIN store s on i.store_id = s.store_id
            JOIN address a on a.address_id = s.address_id
            JOIN city c on c.city_id = a.city_id
            JOIN country c2 on c.country_id = c2.country_id
        WHERE (i.inventory_id, r.rental_date) IN (
            SELECT i.inventory_id, max(rental_date) as maxdate
                FROM inventory i
            JOIN rental r on i.inventory_id = r.inventory_id
            WHERE film_id = $1
            GROUP BY i.inventory_id
        ) AND r.return_date IS NOT NULL`

    console.log(response.rows[0])
    const response_film_inventory = await poolDvdRental.query(
        q_film_inventory,
        [response.rows[0].film_id]
    )

    return {
        ...response.rows[0],
        disponibility: response_film_inventory.rows,
    }
}
