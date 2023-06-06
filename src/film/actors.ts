import { poolDvdRental } from '../services/databases.js'

export async function getActorsOfFilm(film_id: string) {
    return await poolDvdRental
        .query(
            `
            SELECT *
            FROM actor a 
                INNER JOIN film_actor fa ON a.actor_id  = fa.actor_id
            WHERE fa.film_id = $1`,
            [film_id]
        )
        .then(
            (response) => response.rows,
            (error) => {
                throw error
            }
        )
}
