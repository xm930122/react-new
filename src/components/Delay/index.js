import React, { useState, useEffect } from 'react';

export const Delayed = ({ children , wait = 500 }) => {
    const [isShown, setIsShown] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsShown(true);
        }, wait)
        return () => {
            clearTimeout(timer);
        }
    }, [wait])
    return isShown ? children : null;
}