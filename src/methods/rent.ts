import { poolDvdRental } from '../services/databases.js'

export async function rentFilm(
    film_id: number,
    store_id: number,
    rental_date: Date,
    customer_id: number
) {
    const manager_staff_id = await poolDvdRental
        .query(
            `select s.staff_id from staff s inner join store s2 on s2.manager_staff_id = s.staff_id where s2.store_id = $1`,
            [store_id]
        )
        .then(
            (response) => response.rows[0].staff_id,
            (error) => {
                throw error
            }
        )

    // Take first available inventory
    const inventory_id = await poolDvdRental
        .query(
            `SELECT i.*
            FROM inventory i
            WHERE NOT EXISTS (
              SELECT 1
              FROM rental r
              WHERE i.inventory_id = r.inventory_id
                AND r.return_date IS null
                and i.film_id = $1
                and i.store_id = $2
            ) and i.film_id = $1 and i.store_id = $2
            group by inventory_id 
            limit 1`,
            [film_id, store_id]
        )
        .then(
            (response) => response.rows[0].inventory_id,
            (error) => {
                throw error
            }
        )

    const response = await poolDvdRental.query(
        `
            insert into rental (rental_date, inventory_id, customer_id, staff_id)
            values ($1, $2, $3, $4)
            RETURNING *`,
        [rental_date, inventory_id, customer_id, manager_staff_id]
    )

    return response.rows[0]
}
