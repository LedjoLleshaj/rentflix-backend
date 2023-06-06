import { poolDvdRental } from '../services/databases.js'

export async function getLanguageById(id: string) {
    return await poolDvdRental
        .query(`SELECT * FROM language WHERE language_id = $1`, [id])
        .then(
            (response) => response.rows[0],
            (error) => {
                throw error
            }
        )
}
