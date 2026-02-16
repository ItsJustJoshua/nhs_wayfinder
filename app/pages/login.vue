<script>

import useAuth from '../../server/api/use-auth'


const router = useRouter()
const username = ref('')
const password = ref('')

const { fetchUserData } = useAuth()

const loginUser = async () => {

    message.value = ''
    

    try {
        const res = await fetch('../../server/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username.value, password_hash: password.value })
        })

        if (!res.ok) {
            const text = await res.text()
            message.value = `login failed: wrong credentials or server error.`
            return
        }

    const data = await res.json()
    try { await fetchUserData() } catch (_) {}
    message.value = 'Login successful'
    if (true == true) // TODO: replace with actual admin check
       message.value += ' (dshjkdfgyuiwegfeyig)'
        } catch (err) {
            message.value = `Login failed: wrong credentials or server error.`
    }
}


</script>



<template>
    <div>
        <h1>Login Page</h1>
        
        <form @submit.prevent="loginUser()">
            <div>
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
            </div>
            
            <div>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit">Login</button>
        </form>
        <div v-if="message">{{ message }}</div>
    </div>
</template>