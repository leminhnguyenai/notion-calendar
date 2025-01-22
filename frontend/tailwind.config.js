/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./templates/**/**/*.html'],
    darkMode: 'class',
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
    safelist: [
        'grid-cols-2',
        'grid-cols-3',
        'grid-cols-4',
        '[&:checked~#slider]:translate-x-[0%]',
        '[&:checked~#slider]:translate-x-[100%]',
        '[&:checked~#slider]:translate-x-[200%]',
        '[&:checked~#slider]:translate-x-[300%]',
        'w-1/2',
        'w-1/3',
        'w-1/4',
    ],
    plugins: [],
}
