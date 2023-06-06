import { poolDvdRental } from '../services/databases.js'

export async function getAddressById(address_id: string) {
    return await poolDvdRental
        .query(`SELECT * FROM address WHERE address_id = $1`, [address_id])
        .then(
            (response) => response.rows[0],
            (error) => {
                throw error
            }
        )
}
