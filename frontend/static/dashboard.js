let cookie = document.cookie
console.log(cookie)
let token

const tokenProperty = cookie.split('; ').find((row) => row.startsWith('token='))

if (tokenProperty) {
    token = tokenProperty.split('=')[1]
    text.innerHTML = token
} else {
    console.log('Error retreiving token')
}
