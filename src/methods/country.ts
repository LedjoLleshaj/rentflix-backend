import { poolDvdRental } from '../services/databases.js'

export async function getCountryById(country_id: string) {
    return await poolDvdRental
        .query(`SELECT * FROM country WHERE country_id = $1`, [country_id])
        .then(
            (response) => response.rows[0],
            (error) => {
                throw error
            }
        )
}
