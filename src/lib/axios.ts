import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'

export const api = axios.create({
    // Usar caminho relativo para aproveitar o proxy do Vite (sem CORS)
    baseURL: '',
})

// Request Interceptor: Inject Authorization and X-Tenant-ID
api.interceptors.request.use(
    (config) => {
        const { token, tenant } = useAuthStore.getState()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        if (tenant) {
            config.headers['X-Tenant-ID'] = tenant
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response Interceptor: Handle 401, 403 and global error messages
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        const { token, refreshToken, setToken, logout } = useAuthStore.getState()

        // Attempt automatic token refresh on 401
        if (error.response?.status === 401 && !originalRequest._retry && token) {
            originalRequest._retry = true
            try {
                if (refreshToken) {
                    const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken })
                    setToken(data.accessToken)
                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
                    return api(originalRequest)
                }
            } catch {
                // Refresh falhou — limpar sessão e redirecionar
            }
            logout()
            window.location.href = '/login'
            return Promise.reject(error)
        }

        if (error.response?.status === 403) {
            window.location.href = '/unauthorized'
            return Promise.reject(error)
        }

        // Suprimir notificação de erro em 401 (já tratado acima)
        if (error.response?.status === 401) {
            return Promise.reject(error)
        }

        // Global Error Mapping para outros erros
        const message = error.response?.data?.message || 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
        useUiStore.getState().addNotification({
            title: 'Erro de Comunicação',
            message,
            type: 'error'
        })

        return Promise.reject(error)
    }
)
