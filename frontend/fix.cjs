const fs = require('fs');
let code = fs.readFileSync('src/pages/Menu.jsx', 'utf8');
let startIdx = code.indexOf('tl.from(".bundle-drop-card", {');
let endIdx = code.indexOf('}, "-=1.5");');

if (startIdx !== -1 && endIdx !== -1) {
    let toReplace = code.substring(startIdx, endIdx + 12);
    let newStr = `tl.from(".bundle-drop-card", {
                y: 80,
                autoAlpha: 0,
                stagger: 0.15,
                duration: 1.2,
                ease: "power3.out"
            });

            tl.from(".bundle-plate-wrapper", {
                y: 50,
                autoAlpha: 0,
                scale: 0.85,
                stagger: 0.15,
                duration: 1.4,
                ease: "expo.out"
            }, "-=1.0");`;
    code = code.replace(toReplace, newStr);
    fs.writeFileSync('src/pages/Menu.jsx', code, 'utf8');
    console.log("Success");
} else {
    console.log("Not found");
}
