var convertedPages = [];   
var origName       = '';
 
function toggleTheme() {
    var isDark = document.body.getAttribute('data-theme') === 'dark';
    var next   = isDark ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    document.getElementById('themeToggle').textContent = isDark ? '🌙' : '☀️';
    localStorage.setItem('theme', next);
}
 
function showModal(id) { document.getElementById(id + 'Modal').classList.add('active'); }
function closeModal(id) { document.getElementById(id + 'Modal').classList.remove('active'); }
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) e.target.classList.remove('active');
});
 
(function setupDrop() {
    var zone  = document.getElementById('dropZone');
    var input = document.getElementById('fileInput');
 
    zone.addEventListener('click', function () { input.click(); });
    zone.addEventListener('dragover', function (e) {
        e.preventDefault();
        zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', function () { zone.classList.remove('drag-over'); });
    zone.addEventListener('drop', function (e) {
        e.preventDefault();
        zone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) convertFile(e.dataTransfer.files[0]);
    });
    input.addEventListener('change', function (e) {
        if (e.target.files[0]) convertFile(e.target.files[0]);
    });
})();

async function convertFile(file) {
    var validExts = ['.doc', '.docx', '.rtf', '.txt'];
    var fileName  = file.name.toLowerCase();
    var isValid   = validExts.some(function (ext) { return fileName.endsWith(ext); });
 
    if (!isValid) {
        alert('⚠️ Please select a .doc, .docx, .rtf, or .txt file.');
        return;
    }
 
    origName = file.name;
 
    document.getElementById('dropZoneArea').style.display = 'none';
    document.getElementById('loadingBox').style.display   = 'block';
    document.getElementById('progressText').textContent   = 'Reading file…';
 
    try {
        var rawText = await file.text();
        var textContent = rawText;
        if (fileName.endsWith('.rtf')) {
            textContent = stripRTF(rawText);
        }
 
        document.getElementById('progressText').textContent = 'Rendering pages…';
 
        convertedPages = renderTextToPages(textContent);
 
        document.getElementById('loadingBox').style.display = 'none';
 
        document.getElementById('resultStats').innerHTML =
            '<p><strong>📄 Original File:</strong> ' + file.name + '</p>' +
            '<p><strong>Pages Created:</strong> ' + convertedPages.length + '</p>' +
            '<p><strong>Text Length:</strong> ' + (textContent.length / 1024).toFixed(1) + ' KB</p>' +
            '<p><strong>Status:</strong> Ready to download</p>';
        document.getElementById('resultBox').style.display = 'block';
 
    } catch (err) {
        console.error(err);
        document.getElementById('loadingBox').style.display = 'none';
        alert('Conversion failed. Please try again.');
        location.reload();
    }
}

function stripRTF(rtf) {
    var text = rtf
        .replace(/\{[^{}]*\}/g, ' ')      
        .replace(/\\[a-z]+\-?[0-9]* ?/gi, ' ')
        .replace(/\\/g, ' ')
        .replace(/[{}]/g, '')
        .replace(/[ \t]+/g, ' ')
        .trim();
    return text;
}

function renderTextToPages(text) {
    var pages = [];
 
    var PAGE_W   = 794;
    var PAGE_H   = 1123;
    var MARGIN   = 60;
    var LINE_H   = 22;
    var FONT_SZ  = 13;
    var MAX_W    = PAGE_W - MARGIN * 2;
    var MAX_Y    = PAGE_H - MARGIN;
 
    var lines = text.split('\n');
 
    var allLines = [];
    var measureCanvas = document.createElement('canvas');
    var mCtx = measureCanvas.getContext('2d');
    mCtx.font = FONT_SZ + 'px Arial';
 
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.trim() === '') {
            allLines.push('');  
            continue;
        }
        var words = line.split(' ');
        var current = '';
        for (var w = 0; w < words.length; w++) {
            var test = current ? current + ' ' + words[w] : words[w];
            if (mCtx.measureText(test).width > MAX_W) {
                if (current) allLines.push(current);
                current = words[w];
            } else {
                current = test;
            }
        }
        if (current) allLines.push(current);
    }

    var lineIndex = 0;
    while (lineIndex < allLines.length) {
        var canvas = document.createElement('canvas');
        canvas.width  = PAGE_W;
        canvas.height = PAGE_H;
        var ctx = canvas.getContext('2d');
 
        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, PAGE_W, PAGE_H);
 
        // Page border (subtle)
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, PAGE_W - 1, PAGE_H - 1);
 
        // Text
        ctx.fillStyle = '#2c3e50';
        ctx.font      = FONT_SZ + 'px Arial';
 
        var y = MARGIN + FONT_SZ;
 
        while (lineIndex < allLines.length && y <= MAX_Y) {
            ctx.fillText(allLines[lineIndex], MARGIN, y);
            y += LINE_H;
            lineIndex++;
        }