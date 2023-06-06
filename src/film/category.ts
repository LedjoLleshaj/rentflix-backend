import { poolDvdRental } from '../services/databases.js'

export async function getCategoryOfFilm(film_id: string) {
    return await poolDvdRental
        .query(
            `SELECT * FROM category c
                INNER JOIN film_category fc ON c.category_id = fc.category_id
            WHERE fc.film_id = $1`,
            [film_id]
        )
        .then(
            (response) => response.rows[0],
            (error) => {
                throw error
            }
        )
}
