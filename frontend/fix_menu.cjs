const fs = require('fs');
const path = 'e:/foodswebsite/foods/src/pages/Menu.jsx';
let content = fs.readFileSync(path, 'utf8');

// Fix 1: Remove broken floatingOrbs line
content = content.replace(/    const floatingOrbs = \[\r?\n    return \(/g, '    return (');

// Fix 2: Complete the broken product card and add back the spotlight section
const brokenPart = `                    <span className="pro-price-badge">{item.price}</span>
                    <div className="massive-grid">`;

const fixedPart = `                    <span className="pro-price-badge">{item.price}</span>
                                </div>
                                <div className="pro-info">
                                    <span className="pro-cat">{item.cat}</span>
                                    <h3 onClick={() => handleViewDetails(item)} style={{ cursor: 'pointer' }}>{item.name}</h3>
                                    <div className="pro-bottom">
                                        <button className="pro-add-btn" onClick={() => handleAddToCart(item)}>
                                            <ShoppingBag size={18} />
                                            <span>Add to Cart</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. HEAVY GASTRONOMIC SPOTLIGHT */}
            <section className="menu-spotlight-massive">
                <div className="massive-bg-text" data-reveal="zoom-out" data-reveal-duration="2.5">EXCELLENCE</div>
                <div className="container">
                    <div className="massive-grid">`;

content = content.replace(brokenPart, fixedPart);

fs.writeFileSync(path, content, 'utf8');
console.log('Menu.jsx fixed successfully!');
