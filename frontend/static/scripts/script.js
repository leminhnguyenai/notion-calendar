const userTheme = localStorage.getItem('theme')
const systemThemeIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches

// Check for theme initially and update the toggle switch accordingly
if (userTheme == 'dark' || (!userTheme && systemThemeIsDark)) {
    document.documentElement.classList.add('dark')
} else document.documentElement.classList.remove('dark')

// Update the toggle switch
htmx.on('htmx:load', function () {
    if (document.getElementById('appearence')) {
        const getToggleSwitcher = document.getElementById('appearence').firstElementChild
        console.log(getToggleSwitcher.querySelectorAll('dark'))
        if (userTheme == 'dark') {
            getToggleSwitcher.children[0].checked = true
        } else if (userTheme == 'light') {
            getToggleSwitcher.children[2].checked = true
        } else {
            getToggleSwitcher.children[4].checked = true
        }
    }
})

// Theme switcher
function themeSwitch(mode) {
    if (mode == -1) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
    } else if (mode == 1) {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
    } else if (mode == 0) {
        if (systemThemeIsDark) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
        localStorage.removeItem('theme')
    }
}
