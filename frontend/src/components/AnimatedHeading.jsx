const AnimatedHeading = ({
    children,
    as: Tag = 'h2',
    className = '',
    style = 'solid',
}) => {
    const getStyles = () => {
        if (style === 'gradient') return 'text-grad';
        if (style === 'gradient-warm') return 'text-grad-warm';
        return '';
    };

    return <Tag className={`${className} ${getStyles()}`.trim()}>{children}</Tag>;
};

export default AnimatedHeading;
