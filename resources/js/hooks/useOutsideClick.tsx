import { useEffect, useRef } from 'react';

export const useOutsideClick = (handleOutsideClick: any) => {
    const innerBorderRef = useRef<any>();

    const onClick = (event: any) => {
        if (
            innerBorderRef.current &&
            !innerBorderRef.current.contains(event.target)
        ) {
            handleOutsideClick();
        }
    };

    useMountEffect(() => {
        document.addEventListener('click', onClick, true);
        return () => {
            document.removeEventListener('click', onClick, true);
        };
    });

    return { innerBorderRef };
};

const useMountEffect = (fun: any) => useEffect(fun, []);
