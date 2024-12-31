let cookie = document.cookie
let token

const tokenProperty = cookie.split('; ').find((row) => row.startsWith('token='))

if (tokenProperty) {
    token = tokenProperty.split('=')[1]
    localStorage.setItem('token', token)
    console.log('Saved token in the storage')
}

const text = document.getElementById('text')
token = localStorage.getItem('token')

text.innerHTML = token
