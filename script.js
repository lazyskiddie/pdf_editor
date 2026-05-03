// dark theme which i love
function toggleTheme() {
    var isDark = document.body.getAttribute('data-theme') === 'dark';
    var next   = isDark ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    document.getElementById('themeToggle').textContent = isDark ? '🌙' : '☀️';
    localStorage.setItem('theme', next);
}


(function initTheme() {
    var saved = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', saved);
    var btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = saved === 'dark' ? '☀️' : '🌙';
})();


function showModal(id) {
    var el = document.getElementById(id + 'Modal');
    if (el) el.classList.add('active');
}

function closeModal(id) {
    var el = document.getElementById(id + 'Modal');
    if (el) el.classList.remove('active');
}


document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// it all about the blog contants
var blogData = {

    excel: {
        title: 'How to Convert Excel to PDF Easily',
        body: '<p><strong>Excel to PDF conversion</strong> is one of the most common document tasks for professionals, students, and businesses alike. PDFs preserve your spreadsheet layout, fonts, tables, and charts exactly as designed — ensuring your data looks identical on all devices and operating systems.</p>' +
              '<p><strong>Why convert Excel to PDF?</strong></p>' +
              '<ul>' +
              '<li>Prevents accidental editing by recipients</li>' +
              '<li>Improves cross-device and cross-platform compatibility</li>' +
              '<li>Makes sharing via email far simpler</li>' +
              '<li>Locks formatting so nothing shifts unexpectedly</li>' +
              '</ul>' +
              '<p>Before converting, clean unused rows and hidden sheets. Adjust page orientation to landscape for wide tables. Using a browser-based tool keeps your data completely private — files are never uploaded to any server.</p>'
    },

    imageCompress: {
        title: 'How to Compress Images for Free Online',
        body: '<p>Image compression reduces file size without visibly compromising quality. Smaller images load faster and improve website performance — essential for both SEO and user experience.</p>' +
              '<p><strong>Key benefits of image compression:</strong></p>' +
              '<ul>' +
              '<li>Faster page loading times</li>' +
              '<li>Reduced storage usage and bandwidth costs</li>' +
              '<li>Better experience on mobile connections</li>' +
              '<li>Improved SEO scores on search engines</li>' +
              '</ul>' +
              '<p>Browser-based compression tools eliminate the need for heavy software. Your images are processed locally in the browser, meaning no uploads and complete privacy.</p>'
    },

    word: {
        title: 'How to Convert Word to PDF Easily',
        body: '<p>Word documents can display very differently across devices and operating systems. Converting to PDF locks fonts, spacing, margins, and layout so your document appears exactly as intended — everywhere.</p>' +
              '<p><strong>Best use cases for Word to PDF conversion:</strong></p>' +
              '<ul>' +
              '<li>Resumes and CVs sent to employers</li>' +
              '<li>Legal agreements and signed contracts</li>' +
              '<li>Official reports submitted to clients</li>' +
              '<li>Academic papers and assignments</li>' +
              '</ul>' +
              '<p>Always finalize headings, spacing, and formatting before converting. Use client-side tools to keep your document contents completely private. No file uploads are ever required.</p>'
    },

    pdfCompress: {
        title: 'Smart Compress PDFs Without Losing Quality',
        body: '<p>Large PDF files are difficult to email, store, and share. Smart PDF compression reduces file size while maintaining document clarity — text stays sharp and images remain readable.</p>' +
              '<p><strong>Why compress PDFs?</strong></p>' +
              '<ul>' +
              '<li>Faster uploads and downloads</li>' +
              '<li>Smaller attachments that fit email limits</li>' +
              '<li>Lower cloud storage costs</li>' +
              '<li>Quicker sharing with colleagues and clients</li>' +
              '</ul>' +
              '<p>Processing happens entirely in your browser — no server, no data exposure, no quality surprises.</p>'
    },

    ppt: {
        title: 'How to Convert PowerPoint to PDF Easily',
        body: '<p>PowerPoint presentations can look very different on systems that do not have the same fonts or version of Office installed. Converting to PDF ensures every slide looks exactly as you designed it.</p>' +
              '<p><strong>Why convert PowerPoint to PDF?</strong></p>' +
              '<ul>' +
              '<li>Consistent rendering on all devices and operating systems</li>' +
              '<li>No animation or font compatibility issues</li>' +
              '<li>Easier to share as a single file</li>' +
              '<li>Professional output for clients and stakeholders</li>' +
              '</ul>' +
              '<p>PDFs are ideal for distributing meeting materials, proposals, and pitch decks. No uploads needed — conversion runs directly in your browser.</p>'
    },

    merge: {
        title: 'Step-by-Step Guide to Merging PDFs',
        body: '<p>Merging multiple PDF files into a single document helps you stay organized and makes sharing far more convenient — no more sending ten separate attachments.</p>' +
              '<p><strong>Common use cases for PDF merging:</strong></p>' +
              '<ul>' +
              '<li>Combining chapters of a report or thesis</li>' +
              '<li>Assembling legal document packets</li>' +
              '<li>Merging invoices into a single monthly summary</li>' +
              '<li>Joining scanned pages into one file</li>' +
              '</ul>' +
              '<p>With SecurePDF you can add up to 10 files, reorder them, and merge everything into one PDF — entirely in your browser with no uploads required.</p>'
    },

    why: {
        title: 'Why Choose SecurePDF for All Your PDF Needs',
        body: '<p>SecurePDF was built with one goal: give people powerful PDF tools without compromising their privacy. Most online PDF tools upload your files to remote servers. SecurePDF never does.</p>' +
              '<p><strong>What makes SecurePDF different:</strong></p>' +
              '<ul>' +
              '<li><strong>Privacy-first design</strong> — files never leave your device</li>' +
              '<li><strong>Instant processing</strong> — no server round-trips or queues</li>' +
              '<li><strong>Zero registration</strong> — use any tool immediately, no account needed</li>' +
              '<li><strong>Clean modern UI</strong> — easy for beginners and power users alike</li>' +
              '<li><strong>Completely free</strong> — no hidden limits, no watermarks, no upsells</li>' +
              '</ul>' +
              '<p>Whether you need to merge, split, compress, reorder, delete, lock, or convert PDFs — SecurePDF has you covered in a single place.</p>'
    },

    secure: {
        title: 'How to Secure PDFs with Password Protection',
        body: '<p>Password protection ensures that only authorized people can open your PDF files. This is essential whenever you share sensitive or confidential documents.</p>' +
              '<p><strong>Common use cases for locking PDFs:</strong></p>' +
              '<ul>' +
              '<li>Financial statements and payslips</li>' +
              '<li>Legal contracts and NDAs</li>' +
              '<li>Medical records and personal documents</li>' +
              '<li>Confidential business reports</li>' +
              '</ul>' +
              '<p>With SecurePDF Lock PDF tool, you simply upload the file, enter a password, and download the protected version — all without your file ever leaving your device.</p>'
    },

    benefits: {
        title: 'Top 5 Benefits of Securing Your PDFs',
        body: '<p>Adding password protection to your PDF files is one of the simplest yet most effective ways to keep your information safe. Here are the top five reasons to do it:</p>' +
              '<ul>' +
              '<li><strong>1. Improved Confidentiality</strong> — Only people with the password can open the document.</li>' +
              '<li><strong>2. Professional Sharing Practices</strong> — Shows clients and partners that you take data security seriously.</li>' +
              '<li><strong>3. Controlled Document Access</strong> — Decide exactly who can view your files and when.</li>' +
              '<li><strong>4. Legal and Compliance Support</strong> — Many industries require that sensitive documents be protected.</li>' +
              '<li><strong>5. Peace of Mind</strong> — Know that even if a file ends up in the wrong hands, the content stays protected.</li>' +
              '</ul>' +
              '<p>PDF security takes seconds with SecurePDF — and it costs absolutely nothing.</p>'
    }

};

function openBlog(key) {
    var data = blogData[key];
    if (!data) return;
    document.getElementById('blogTitle').textContent = data.title;
    document.getElementById('blogBody').innerHTML    = data.body;
    document.getElementById('blogModal').classList.add('active');
}