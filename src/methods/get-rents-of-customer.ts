import { poolDvdRental } from '../services/databases.js'

export async function getRentsOfCustomer({ customer_id, filter }) {
    const response = await poolDvdRental.query(
        `
        SELECT f.title,r.rental_date,r.return_date, ad.address,p.amount FROM rental r
            INNER JOIN inventory i on r.inventory_id = i.inventory_id
            INNER JOIN film f on f.film_id = i.film_id
            INNER JOIN store st on st.store_id = i.store_id
            INNER JOIN address ad on ad.address_id = st.address_id
            INNER JOIN payment p on p.rental_id = r.rental_id
        WHERE r.customer_id = $1
        ORDER BY r.return_date DESC`,
        [customer_id]
    )

    if (filter) {
        // Handle pagination with filmPerPage and page
        if (filter.filmPerPage && filter.page) {
            const start = filter.filmPerPage * (filter.page - 1)
            const end = start + filter.filmPerPage
            response.rows = response.rows.slice(start, end)
        }

        // Handle sorting
        if (filter.orderBy) {
            filter.sort = filter.sort || 'asc'
            response.rows = response.rows.sort((a, b) => {
                if (a[filter.orderBy] < b[filter.orderBy]) {
                    return filter.sort === 'asc' ? -1 : 1
                }
                if (a[filter.orderBy] > b[filter.orderBy]) {
                    return filter.sort === 'asc' ? 1 : -1
                }
                return 0
            })
        }
    }

    return {
        rents: response.rows,
        total: response.rowCount,
    }
}
