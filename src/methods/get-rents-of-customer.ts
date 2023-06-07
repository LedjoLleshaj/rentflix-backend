import { poolDvdRental } from '../services/databases.js'

export async function getRentsOfCustomer({ customer_id, filter }) {
    const response = await poolDvdRental.query(
        `select * from rental r where r.customer_id = $1 order by r.rental_date desc`,
        [customer_id]
    )

    // Handle pagination with itemsPerPage and page
    if (filter.itemsPerPage && filter.page) {
        const start = filter.itemsPerPage * (filter.page - 1)
        const end = start + filter.itemsPerPage
        response.rows = response.rows.slice(start, end)
    }

    return {
        rents: response.rows,
        total: response.rowCount,
    }
}
