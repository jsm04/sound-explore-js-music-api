import { useRef } from 'react'

export const useClickThrottle = function (restrictedRange = 500) {
    const lastClickTimeRef = useRef(0)

    const isAllowed = () => {
        const currentTime = Date.now()
        if (currentTime - lastClickTimeRef.current < restrictedRange) {
            return false
        }
        lastClickTimeRef.current = currentTime
        return true
    }

    return isAllowed
}
