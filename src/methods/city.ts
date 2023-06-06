import { poolDvdRental } from '../services/databases.js'

export async function getCityById(city_id: string) {
    return await poolDvdRental
        .query(`SELECT * FROM city WHERE city_id = $1`, [city_id])
        .then(
            (response) => response.rows[0],
            (error) => {
                throw error
            }
        )
}
