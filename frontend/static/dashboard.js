const cookie = document.cookie

const tokenProperty = cookie.split('; ').find((row) => row.startsWith('token='))
if (tokenProperty) {
    token = tokenProperty.split('=')[1]
    localStorage.setItem('token', token)
    console.log('Server')
} else {
    const text = document.getElementById('text')
    const token = localStorage.getItem('token')

    text.innerHTML = token
    console.log('Client')
}
