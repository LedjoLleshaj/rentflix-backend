import { poolDvdRental } from '../services/databases.js'

export async function getAvailableStoresOfFilm(film_id: string) {
    return await poolDvdRental
        .query(
            `
            select distinct s.*
            from store s inner join inventory i on s.store_id = i.store_id
            inner join rental r on r.inventory_id  = i.inventory_id
            where i.film_id = $1 and r.return_date is not null`,
            [film_id]
        )
        .then(
            (response) => response.rows,
            (error) => {
                throw error
            }
        )
}

export async function getStoreById(store_id: string) {
    return await poolDvdRental
        .query(`SELECT * FROM store WHERE store_id = $1`, [store_id])
        .then(
            (response) => response.rows[0],
            (error) => {
                throw error
            }
        )
}
