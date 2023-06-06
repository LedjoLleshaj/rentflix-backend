import { RentalStats } from '../types/film'
import { poolDvdRental } from '../services/databases.js'
import { RContext } from '../resolvers.js'

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
