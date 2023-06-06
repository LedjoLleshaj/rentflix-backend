import { poolDvdRental } from '../services/databases.js'

export async function getFilms({ filter }) {
    const response = await poolDvdRental.query(`
        SELECT DISTINCT f.*
        FROM film f
            INNER JOIN inventory i on i.film_id = f.film_id
            INNER JOIN rental r on r.inventory_id = i.inventory_id
        WHERE r.return_date IS NOT NULL`)

    if (filter) {
        if (filter.categories) {
            response.rows = response.rows.filter((row) =>
                filter.categories.includes(row.category_id)
            )
        }

        if (filter.title) {
            response.rows = response.rows.filter((row) =>
                row.title.toLowerCase().includes(filter.title.toLowerCase())
            )
        }

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
        films: response.rows,
        total: response.rowCount,
    }
}