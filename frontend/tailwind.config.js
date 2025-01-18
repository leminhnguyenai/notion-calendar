/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./templates/**/*.html'],
    theme: {
        fontFamily: {
            mono: ['JetBrainsMono'],
        },
        colors: {
            light: '#f9f6ee',
            'light-hovered': '#d1cfc9',
            'light-active': '#d4d4d4',
            dark: '#454545',
            'dark-hovered': '#393939',
            'dark-active': '#303030',
        },
    },
    plugins: [],
}
