export interface AuthResponse {
    token: string
    first_name: string
    last_name: string
}

export interface AuthForm {
    username: string
    password: string
}
