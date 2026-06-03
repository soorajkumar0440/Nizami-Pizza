import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PATH_TO_HASH = {
    '/menu': 'menu',
    '/deals': 'deals',
};

export default function HashRedirect() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const hash = PATH_TO_HASH[location.pathname];
        if (hash) {
            navigate(`/#${hash}`, { replace: true });
        }
    }, [location.pathname, navigate]);

    return null;
}
