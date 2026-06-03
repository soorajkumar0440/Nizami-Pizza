const fs = require('fs');
let code = fs.readFileSync('src/pages/Menu.jsx', 'utf8');

// We will replace using regex that ignores exact whitespace/line-endings
let regex = /<div className="pro-img-box"[\s\S]*?className="pro-price-badge">\{item.price\}<\/span>[\s\S]*?<\/div>/;

let exactNew = `<motion.div 
                                    className="pro-plate-wrapper" 
                                    onClick={() => handleViewDetails(item)} 
                                    style={{ cursor: 'pointer' }}
                                    initial={{ y: -120, opacity: 0, scale: 0.7 }}
                                    whileInView={{ y: 0, opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ type: "spring", bounce: 0.5, duration: 1, delay: ((index % 4) * 0.1) + 0.3 }}
                                >
                                    <div className="pro-plate-shadow"></div>
                                    <img src={item.img} alt={item.name} className="pro-drop-plate" />
                                    <div className="pro-overlay-actions">
                                        <div className="pro-btn-circle-alt"><ShoppingBag size={20} /></div>
                                    </div>
                                    <span className="pro-price-badge">{item.price}</span>
                                </motion.div>`;
                                
if(regex.test(code)) {
    code = code.replace(regex, exactNew);
    fs.writeFileSync('src/pages/Menu.jsx', code, 'utf8');
    console.log("Success Menu.jsx");
} else {
    console.log("Could not find regex in Menu.jsx");
}
