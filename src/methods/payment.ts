import { poolDvdRental } from '../services/databases.js'

export async function getPaymentOfRent(rent_id: string) {
    return await poolDvdRental
        .query(`select * from payment p where p.rental_id = $1`, [rent_id])
        .then(
            (response) => response.rows[0],
            (error) => {
                throw error
            }
        )
}
