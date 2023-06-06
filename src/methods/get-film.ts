import { poolDvdRental } from '../services/databases.js'

export async function getFilm(film_id: string) {
    return await poolDvdRental
        .query(`SELECT f.* FROM film f WHERE f.film_id = $1`, [film_id])
        .then(
            (response) => response.rows[0],
            (error) => {
                throw error
            }
        )
}
