import { poolDvdRental } from '../services/databases.js'

export async function getFilm(film_id: string) {
    return await poolDvdRental
        .query(`SELECT f.* FROM film f WHERE f.film_id = $1`, [film_id])
        .then(
            (response) => response.rows[0],
            (error) => {
                throw error
            }
        )
}

export async function getFilms({ filter }) {
    const response = await poolDvdRental.query(`
        SELECT DISTINCT f.*, c.category_id, c.name as category_name, l.name as language_name
        FROM film f
            INNER JOIN inventory i on i.film_id = f.film_id
            INNER JOIN rental r on r.inventory_id = i.inventory_id
            INNER JOIN film_category fc on fc.film_id = f.film_id
            INNER JOIN category c on c.category_id = fc.category_id
            INNER JOIN language l on l.language_id = f.language_id
        WHERE r.return_date IS NOT NULL`)

    let total = response.rowCount

    if (filter) {
        if (filter.categories && filter.categories.length > 0) {
            response.rows = response.rows.filter((row) =>
                filter.categories.includes(row.category_id)
            )
        }

        if (filter.title) {
            response.rows = response.rows.filter((row) =>
                row.title.toLowerCase().includes(filter.title.toLowerCase())
            )
        }

        total = response.rows.length

        // Handle pagination with filmPerPage and page
        if (filter.filmPerPage && filter.page) {
            const start = filter.filmPerPage * (filter.page - 1)
            const end = start + filter.filmPerPage
            response.rows = response.rows.slice(start, end)
        }

        // Handle sorting
        if (filter.orderBy) {
            switch (filter.orderBy) {
                case 'category.name':
                    filter.orderBy = 'category_name'
                    break
                case 'language.name':
                    filter.orderBy = 'language_name'
                    break
            }
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
        total,
    }
}
