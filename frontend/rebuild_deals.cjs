const fs = require('fs');

let code = fs.readFileSync('src/pages/Menu.jsx', 'utf8');

// 1. Remove GSAP logic
let gsapRegex = /\/\/ Bundle animation[\s\S]*?\n    }, \[\]\);/g;
code = code.replace(gsapRegex, '');

// 2. Replace section layout
let oldSectionRegex = /\{\/\* 7\. THE PRIVILEGE TIER \(DEALS\) \*\/\}[\s\S]*?(?=\{\/\* 8\. SOMMELIER'S PAIRING \*\/})/g;

let newSection = `{/* 7. THE PRIVILEGE TIER (DEALS) */}
            <section className="menu-deals-section-clean">
                <div className="container">
                    <div className="tasting-header">
                        <span className="tasting-eyebrow">PRIVILEGE TIER</span>
                        <AnimatedHeading as="h2" type="fade-up">Exceptional <span className="serif-italic">Bundles</span></AnimatedHeading>
                    </div>

                    <div className="deals-grid-clean">
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
                        ].map((bundle, idx) => (
                            <motion.div 
                                key={bundle.id} 
                                className="bundle-card-clean"
                                initial={{ opacity: 0, y: -150 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ type: "spring", bounce: 0.35, duration: 1.2, delay: idx * 0.15 }}
                            >
                                <div className="bundle-card-image-box">
                                    <div className="bundle-badge-clean">{bundle.badge}</div>
                                    <img src={bundle.img} alt={bundle.title} />
                                </div>
                                <div className="bundle-card-content">
                                    <h3>{bundle.title}</h3>
                                    <p>{bundle.desc}</p>
                                    <div className="bundle-card-footer">
                                        <div className="deal-price-clean">{bundle.price} <span>{bundle.oldPrice}</span></div>
                                        <button className="deal-btn-clean">Reserve</button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            `;

code = code.replace(oldSectionRegex, newSection);

fs.writeFileSync('src/pages/Menu.jsx', code, 'utf8');
console.log('Menu.jsx updated.');

let css = fs.readFileSync('src/pages/Menu.css', 'utf8');

let cssToRemoveRegex = /\/\* 3\. The Privilege Tier \(Deals\) \*\/[\s\S]*?(?=\/\* 4\. Gastronomic Spotlight \*\/|\/\* ════════════════════════════════════|\/\* 8\. SOM)/i;
// Let's actually find the start and end of that section in Menu.css
// Or just regex replace:
let cssStartSearch = '/* 3. The Privilege Tier (Deals) */';
let cssStartIdx = css.indexOf(cssStartSearch);

if(cssStartIdx !== -1) {
    let cssEndSearch = '/* 4. Gastronomic Spotlight */';
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
        console.log('Menu.css updated.');
    }
}
