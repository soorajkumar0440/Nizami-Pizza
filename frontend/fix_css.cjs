const fs = require('fs');

let css = fs.readFileSync('src/pages/Menu.css', 'utf8');

let cssStartSearch = '/* 3. The Privilege Tier (Deals) */';
let cssStartIdx = css.indexOf(cssStartSearch);

if(cssStartIdx !== -1) {
    let cssEndSearch = "/* 4. Sommelier's Pairing */";
    let cssEndIdx = css.indexOf(cssEndSearch);
    
    if(cssEndIdx !== -1) {
        let toReplaceCss = css.substring(cssStartIdx, cssEndIdx);
        
        let newCss = `/* 3. The Privilege Tier (Deals) - CLEAN REBUILD */
.menu-deals-section-clean {
    padding: 120px 0;
    background: #faf8f5;
    position: relative;
    overflow: hidden;
}

.deals-grid-clean {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
    position: relative;
    z-index: 2;
}

.bundle-card-clean {
    background: #fff;
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.05);
    box-shadow: 0 15px 40px rgba(0,0,0,0.04);
    transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
    height: 100%;
}

.bundle-card-clean:hover {
    transform: translateY(-10px);
    box-shadow: 0 30px 60px rgba(0,0,0,0.08);
}

.bundle-card-image-box {
    width: 100%;
    height: 280px;
    position: relative;
    overflow: hidden;
}

.bundle-card-image-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: 0.8s transform cubic-bezier(0.16, 1, 0.3, 1);
}

.bundle-card-clean:hover .bundle-card-image-box img {
    transform: scale(1.05);
}

.bundle-badge-clean {
    position: absolute;
    top: 20px;
    left: 20px;
    background: #1a1a1a;
    color: #fff;
    padding: 8px 16px;
    border-radius: 100px;
    font-size: 0.75rem;
    letter-spacing: 1px;
    font-weight: 700;
    z-index: 2;
}

.bundle-card-content {
    padding: 30px;
    display: flex;
    flex-direction: column;
    flex: 1;
}

.bundle-card-content h3 {
    font-size: 1.8rem;
    color: #1a1a1a;
    margin-bottom: 15px;
    font-family: var(--font-serif);
}

.bundle-card-content p {
    font-size: 1rem;
    color: #666;
    line-height: 1.6;
    margin-bottom: 30px;
    flex: 1;
}

.bundle-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 20px;
    border-top: 1px solid rgba(0,0,0,0.06);
}

.deal-price-clean {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--primary-color);
    display: flex;
    align-items: center;
    gap: 15px;
}

.deal-price-clean span {
    font-size: 1rem;
    color: #999;
    text-decoration: line-through;
    font-weight: 400;
}

.deal-btn-clean {
    background: #1a1a1a;
    color: #fff;
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: 0.3s ease;
}

.deal-btn-clean:hover {
    background: var(--accent-color);
}

`;
        css = css.replace(toReplaceCss, newCss);
        fs.writeFileSync('src/pages/Menu.css', css, 'utf8');
        console.log('Menu.css updated successfully.');
    } else {
        console.log('End of block not found');
    }
} else {
    console.log('Start of block not found');
}
