const fs = require('fs');

let code = fs.readFileSync('src/pages/Menu.jsx', 'utf8');

let exactOldJsx = `<div className="pro-img-box" onClick={() => handleViewDetails(item)} style={{ cursor: 'pointer' }}>
                                    <img src={item.img} alt={item.name} className="img-fill" />
                                    <div className="pro-overlay-actions">
                                        <div className="pro-btn-circle-alt"><ShoppingBag size={20} /></div>
                                    </div>
                                    <span className="pro-price-badge">{item.price}</span>
                                </div>`;
                                
// Find the motion.div wrapper block
let regex = /<motion\.div\s*className="pro-plate-wrapper"[\s\S]*?<\/motion\.div>/g;

if (regex.test(code)) {
    code = code.replace(regex, exactOldJsx);
    fs.writeFileSync('src/pages/Menu.jsx', code, 'utf8');
    console.log("Success Menu.jsx revert");
} else {
    console.log("Could not find new block in Menu.jsx");
}

let css = fs.readFileSync('src/pages/Menu.css', 'utf8');

let exactCssOld = `.pro-img-box {
    height: 300px;
    border-radius: var(--radius-md);
    overflow: hidden;
    position: relative;
}

.pro-img-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: 0.8s transform ease;
}

.pro-card:hover .pro-img-box img {
    transform: scale(1.1);
}`;

let exactCssNew = `.pro-plate-wrapper {
    position: relative;
    width: 220px;
    height: 220px;
    margin: -110px auto 20px auto;
    flex-shrink: 0;
    z-index: 10;
}

.pro-drop-plate {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 6px solid #fff;
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    position: relative;
    z-index: 2;
    transition: 0.6s transform cubic-bezier(0.16, 1, 0.3, 1);
}

.pro-card:hover .pro-drop-plate {
    transform: scale(1.05) rotate(5deg);
}

.pro-plate-shadow {
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 150px;
    height: 25px;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 50%;
    filter: blur(10px);
    z-index: 1;
}`;

css = css.replace(exactCssNew, exactCssOld);

let proCardOld = `.pro-card {
    background: white;
    padding: 15px;
    border-radius: var(--radius-lg);
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.06);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
}`;

let proCardNew = `.pro-card {
    background: white;
    padding: 15px 15px 25px 15px;
    border-radius: var(--radius-lg);
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.06);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    margin-top: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    overflow: visible;
}`;

css = css.replace(proCardNew, proCardOld);

let badgeOld = `.pro-price-badge {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    padding: 8px 18px;
    border-radius: 100px;
    font-weight: 700;
    color: var(--primary-color);
    font-size: 0.9rem;
}`;

let badgeNew = `.pro-price-badge {
    position: absolute;
    bottom: -10px;
    right: -10px;
    background: #1a1a1a;
    padding: 8px 18px;
    border-radius: 100px;
    font-weight: 700;
    color: #fff;
    font-size: 0.9rem;
    z-index: 5;
}`;

css = css.replace(badgeNew, badgeOld);

fs.writeFileSync('src/pages/Menu.css', css, 'utf8');
console.log("Success Menu.css revert");
