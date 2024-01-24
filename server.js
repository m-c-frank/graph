const express = require('express');
const fs = require('fs');
const path = require('path');
const markdownLinkExtractor = require('markdown-link-extractor');

const app = express();
const PORT = 3000;
const markdownPath = '/home/mcfrank/notes'; // Update this path

app.use(express.static('public'));

app.get('/data', (req, res) => {
    fs.readdir(markdownPath, (err, files) => {
        if (err) {
            console.error("Could not list the directory.", err);
            res.status(500).send('Internal Server Error when listing markdown files');
            return;
        }

        const nodes = [];
        const edges = new Set(); // Use a Set to avoid duplicate edges

        files.forEach(file => {
            if (path.extname(file) === '.md') {
                const filePath = path.join(markdownPath, file);
                const content = fs.readFileSync(filePath, 'utf8');
                const links = markdownLinkExtractor(content, true);
                console.log(links)

                // Add node for each markdown file
                nodes.push({ id: filePath, path: filePath });

                // Add edges for each link found in the markdown file
                links.links.forEach(link => {
                    const targetPath = path.join(markdownPath, link.href);
                    edges.add({ source: filePath, target: targetPath });
                });
            }
        });

        // Convert Set to Array for JSON serialization
        res.json({ nodes, edges: Array.from(edges) });
    });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

