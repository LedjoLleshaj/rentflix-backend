import { poolDvdRental } from '../services/databases.js'

export async function getPaymentOfRental(rental_id: string) {
    return await poolDvdRental
        .query(`select * from payment p where p.rental_id = $1`, [rental_id])
        .then(
            (response) => response.rows[0],
            (error) => {
                throw error
            }
        )
}
