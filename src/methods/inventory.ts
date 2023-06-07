import { poolDvdRental } from '../services/databases.js'

export async function getInventoryById(inventory_id: string) {
    return await poolDvdRental
        .query(`SELECT * FROM inventory WHERE inventory_id = $1`, [
            inventory_id,
        ])
        .then(
            (response) => response.rows[0],
            (error) => {
                throw error
            }
        )
}
