import { GraphQLError } from 'graphql'
import { poolDvdRental } from '../services/databases.js'

const rentalPeriodSnippet = `CASE
WHEN r.return_date is not null THEN (r.return_date::DATE - r.rental_date::DATE) + 1
ELSE (current_date::DATE - r.rental_date::DATE) + 1
END as rental_period
`

export async function getRentals({ customer_id, filter }) {
    const response = await poolDvdRental.query(
        `select r.*, f.title as film_title,
            ${rentalPeriodSnippet},
            a.address as store_address, c.city as store_city, co.country as store_country,
            p.amount as payment_amount
            from rental r
            inner join inventory i on i.inventory_id = r.inventory_id
            inner join film f on f.film_id = i.film_id
            inner join store s on s.store_id = i.store_id
            inner join address a on a.address_id = s.address_id
            inner join city c on c.city_id = a.city_id
            inner join country co on co.country_id = c.country_id
            left join payment p on p.rental_id = r.rental_id
            where r.customer_id = $1
        `,
        [customer_id]
    )

    if (filter) {
        // Handle sorting
        if (filter.orderBy) {
            filter.orderBy = getOrderByColumn(filter.orderBy)
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
        // Handle pagination with itemsPerPage and page
        if (filter.itemsPerPage && filter.page) {
            const start = filter.itemsPerPage * (filter.page - 1)
            const end = start + filter.itemsPerPage
            response.rows = response.rows.slice(start, end)
        }
    }

    return {
        rentals: response.rows,
        total: response.rowCount,
    }
}

function getOrderByColumn(column: string): string {
    switch (column) {
        case 'film.title':
            return 'film_title'
        case 'store.address':
            return 'store_address'
        case 'store.city':
            return 'store_city'
        case 'store.country':
            return 'store_country'
        case 'payment.amount':
            return 'payment_amount'
        default:
            return column
    }
}

export async function rentFilm(
    film_id: number,
    store_id: number,
    rental_date: Date,
    customer_id: number
) {
    const manager = await poolDvdRental.query(
        `select s.staff_id from staff s inner join store s2 on s2.manager_staff_id = s.staff_id where s2.store_id = $1`,
        [store_id]
    )

    if (manager.rowCount === 0) {
        throw new GraphQLError('No manager found for store', {
            extensions: { http: { status: 404 } },
        })
    }

    const manager_staff_id = manager.rows[0].staff_id

    // Take first available inventory
    const inventory = await poolDvdRental.query(
        `SELECT i.*
            FROM inventory i
            WHERE NOT EXISTS (
              SELECT 1
              FROM rental r
              WHERE i.inventory_id = r.inventory_id
                AND r.return_date IS null
                and i.film_id = $1
                and i.store_id = $2
            ) and i.film_id = $1 and i.store_id = $2
            group by inventory_id
            limit 1`,
        [film_id, store_id]
    )

    if (inventory.rowCount === 0) {
        throw new GraphQLError('No inventory available', {
            extensions: { http: { status: 404 } },
        })
    }

    const inventory_id = inventory.rows[0].inventory_id

    const response = await poolDvdRental.query(
        `
            insert into rental (rental_date, inventory_id, customer_id, staff_id)
            values ($1, $2, $3, $4)
            RETURNING *`,
        [rental_date, inventory_id, customer_id, manager_staff_id]
    )

    return response.rows[0]
}

export async function getRental(rental_id: string) {
    return await poolDvdRental
        .query(
            `SELECT *, ${rentalPeriodSnippet} FROM rental r WHERE r.rental_id = $1`,
            [rental_id]
        )
        .then(
            (response) => response.rows[0],
            (error) => {
                throw error
            }
        )
}
