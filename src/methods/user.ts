import { poolDvdRental } from '../services/databases.js'

export async function getUser(context) {
    const customer_id = context.customer_id
    const q = `SELECT * FROM customer WHERE customer_id = $1`
    const response = await poolDvdRental.query(q, [customer_id])
    return response.rows[0]
}

export async function getUserRentalStats(context) {
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
    select c.*
    from rental r
        inner join inventory i on i.inventory_id = r.inventory_id 
        inner join film f on f.film_id = i.inventory_id
        inner join film_category fc on fc.film_id = f.film_id 
        inner join category c on c.category_id = fc.category_id
    where r.customer_id = $1
    group by c.category_id 
    ORDER BY SUM(r.rental_id) desc
    LIMIT 1;`
    const q_most_frequent_category_response = await poolDvdRental.query(
        q_most_frequent_category,
        [customer_id]
    )

    return {
        current_rentals: q_current_rentals_response.rows[0].active_rentals,
        total_rentals: q_count_response.rows[0].count,
        total_amount: q_sum_response.rows[0].sum,
        most_frequent_category: q_most_frequent_category_response.rows[0],
    }
}
