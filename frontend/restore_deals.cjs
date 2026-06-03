const fs = require('fs');

let code = fs.readFileSync('src/pages/Menu.jsx', 'utf8');

// The section currently in Menu.jsx is: <section className="menu-deals-section-clean">
let oldSectionRegex = /\{\/\* 7\. THE PRIVILEGE TIER \(DEALS\) \*\/\}[\s\S]*?(?=\{\/\* 8\. SOMMELIER'S PAIRING \*\/})/g;

let newSection = `{/* 7. THE PRIVILEGE TIER (DEALS) */}
            <section className="menu-deals-section">
                <div className="container">
                    <div className="tasting-header">
                        <span className="tasting-eyebrow">PRIVILEGE TIER</span>
                        <AnimatedHeading as="h2" type="fade-up">Exceptional <span className="serif-italic">Bundles</span></AnimatedHeading>
                    </div>

                    <div className="deals-grid">
                        {[
                            {
                                id: 1,
                                badge: "SAVE 20%",
                                img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
                                title: "The Elite Duo",
                                desc: "Perfect for intimate evenings. Choose any two signatures with a complimentary appetizer.",
                                price: "$85",
                                oldPrice: "$110"
                            },
                            {
                                id: 2,
                                badge: "EXCLUSIVE",
                                img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
                                title: "Family Legacy",
                                desc: "Our complete collection scaled for the family. 4 mains and 4 curated desserts.",
                                price: "$160",
                                oldPrice: "$210"
                            },
                            {
                                id: 3,
                                badge: "WEEKEND",
                                img: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800",
                                title: "Chef's Choice",
                                desc: "A surprising curation of our most innovative dishes of the week.",
                                price: "$120",
                                oldPrice: "$150"
                            }
                        ].map((bundle, index) => (
                            <motion.div 
                                key={bundle.id} 
                                className="deal-card bundle-drop-card"
                                initial={{ opacity: 0, y: -150 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "0px" }}
                                transition={{ type: "spring", bounce: 0.4, duration: 1, delay: index * 0.15 }}
                            >
                                <div className="deal-badge">{bundle.badge}</div>
                                
                                <motion.div 
                                    className="bundle-plate-wrapper"
                                    initial={{ y: -100, scale: 0.5, opacity: 0 }}
                                    whileInView={{ y: 0, scale: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", bounce: 0.6, duration: 1.2, delay: (index * 0.15) + 0.3 }}
                                >
                                    <div className="bundle-plate-shadow"></div>
                                    <img src={bundle.img} alt={bundle.title} className="bundle-drop-plate" />
                                </motion.div>

                                <h3>{bundle.title}</h3>
                                <p>{bundle.desc}</p>
                                <div className="deal-price">{bundle.price} <span>{bundle.oldPrice}</span></div>
                                <button className="deal-btn">RESERVE BUNDLE</button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            `;

code = code.replace(oldSectionRegex, newSection);

fs.writeFileSync('src/pages/Menu.jsx', code, 'utf8');
console.log('Menu.jsx restored.');

let css = fs.readFileSync('src/pages/Menu.css', 'utf8');

let cssStartSearch = '/* 3. The Privilege Tier (Deals) - CLEAN REBUILD */';
let cssStartIdx = css.indexOf(cssStartSearch);

if(cssStartIdx !== -1) {
    let cssEndSearch = "/* 4. Sommelier's Pairing */";
    let cssEndIdx = css.indexOf(cssEndSearch);
    
    if(cssEndIdx !== -1) {
        let toReplaceCss = css.substring(cssStartIdx, cssEndIdx);
        
        let newCss = `/* 3. The Privilege Tier (Deals) */
.menu-deals-section {
    padding: 150px 0;
    background: #faf8f5;
    position: relative;
    overflow: hidden;
}
.deals-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
    position: relative;
    z-index: 2;
}
.deal-card {
    background: #fff;
    border-radius: 20px;
    padding: 0 30px 40px;
    text-align: center;
    border: 1px solid rgba(0,0,0,0.05);
    box-shadow: 0 20px 50px rgba(0,0,0,0.03);
    transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: visible;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 100px; /* Accounts for the plate pulled up */
}
.deal-card:hover {
    transform: translateY(-15px);
    box-shadow: 0 30px 60px rgba(0,0,0,0.08);
    border-color: #d4af37;
}
.bundle-plate-wrapper {
    position: relative;
    width: 200px;
    height: 200px;
    margin: -100px auto 45px auto;
    flex-shrink: 0;
    z-index: 10;
}
.bundle-drop-plate {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 6px solid #fff;
    box-shadow: inset 0 0 20px rgba(0,0,0,0.05), 0 10px 30px rgba(0,0,0,0.15);
    position: relative;
    z-index: 2;
}
.bundle-plate-shadow {
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 140px;
    height: 25px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
    filter: blur(8px);
    z-index: 1;
}
.deal-badge {
    position: absolute;
    top: 20px;
    right: 20px;
    background: #1a1a1a;
    color: #fff;
    padding: 8px 16px;
    border-radius: 100px;
    font-size: 0.7rem;
    letter-spacing: 2px;
    font-weight: 700;
}
.deal-icon {
    width: 80px;
    height: 80px;
    background: #faf8f5;
    border-radius: 50%;
    margin: 0 auto 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #d4af37;
}
.deal-card h3 {
    font-size: 2rem;
    color: #1a1a1a;
    margin-bottom: 15px;
}
.deal-card p {
    font-size: 0.95rem;
    color: #666;
    margin-bottom: 30px;
    line-height: 1.6;
}
.deal-price {
    font-size: 2.5rem;
    font-weight: 900;
    color: #d4af37;
    margin-bottom: 20px;
}
.deal-price span {
    font-size: 1rem;
    color: #888;
    text-decoration: line-through;
    margin-left: 10px;
}
.deal-btn {
    padding: 15px 30px;
    background: #1a1a1a;
    color: #fff;
    border: none;
    border-radius: 100px;
    font-weight: 700;
    letter-spacing: 2px;
    cursor: pointer;
    transition: 0.3s;
    width: 100%;
}
.deal-card:hover .deal-btn {
    background: #d4af37;
}

`;
        css = css.replace(toReplaceCss, newCss);
        fs.writeFileSync('src/pages/Menu.css', css, 'utf8');
        console.log('Menu.css restored successfully.');
    } else {
        console.log('End of block not found');
    }
} else {
    // If not found, look for something closer
    console.log('Start of block not found');
}
