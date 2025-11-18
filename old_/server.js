//const express = require('express'); // Import Express
//const fetch = require('node-fetch'); // Import fetch for HTTP requests
//const app = express();

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
// Create an Express app

// Middleware to parse incoming requests
//app.use(express.json());
const app = express();

// Define the /proxy route
app.get('/proxy', async (req, res) => {
    // const targetUrl = 'https://google.com'; // Replace with the desired target URL
    //
    // try {
    //     const response = await fetch(targetUrl); // Fetch content from the target URL
    //     const html = await response.text(); // Get the HTML content
    //     res.send(html); // Send the HTML content to the client
    // } catch (error) {
    //     console.error('Error fetching content:', error);
    //     res.status(500).send('Error fetching content');
    // }

    // try {
    //     const targetUrl = 'https://waylight.me/lili-yavorski/product/09493-7c430?promo=devtest';
    //     const response = await axios.get(targetUrl);
    //     const $ = cheerio.load(response.data);
    //
    //     // Modify links and resources to work within your site
    //     $('a').each((i, link) => {
    //         const href = $(link).attr('href');
    //         if (href && !href.startsWith('http')) {
    //             $(link).attr('href', `${targetUrl}${href}`);
    //         }
    //     });
    //
    //     // Remove security headers that prevent embedding
    //     res.removeHeader('X-Frame-Options');
    //     res.send($.html());
    // } catch (error) {
    //     res.status(500).send('Embedding failed');
    // }

    const targetUrl = 'https://waylight.me/lili-yavorski/product/09493-7c430?promo=devtest';
    try {
        const response = await axios.get(targetUrl);
        const $ = cheerio.load(response.data);

        console.log("response",response)

        $('link[rel="stylesheet"], script, img, video, audio').each((i, el) => {
            const attr = el.name === 'link' ? 'href' : 'src';
            const originalSrc = $(el).attr(attr);
            if (originalSrc) {
                $(el).attr(attr, url.resolve(targetUrl, originalSrc));
            }
        });

        // Inject proxy script for API requests
        $('head').append(`
            <script>
            window.originalFetch = window.fetch;
            window.fetch = function(url, options) {
                if (!url.startsWith('http')) {
                    url = '${targetUrl}' + url;
                }
                return window.originalFetch('/proxy-api' + url, options);
            };
            </script>
        `);

        // Rewrite CSS, JS, and resource URLs
        // $('link[rel="stylesheet"]').each((i, link) => {
        //     const href = $(link).attr('href');
        //     if (href) {
        //         $(link).attr('href', url.resolve(targetUrl, href));
        //     }
        // });
        //
        // $('script').each((i, script) => {
        //     const src = $(script).attr('src');
        //     if (src) {
        //         $(script).attr('src', url.resolve(targetUrl, src));
        //     }
        // });
        //
        // $('img, video, audio').each((i, media) => {
        //     const src = $(media).attr('src');
        //     if (src) {
        //         $(media).attr('src', url.resolve(targetUrl, src));
        //     }
        // });

        res.send($.html());

        } catch (error) {
            res.status(500).send('Embedding failed');
        }


});

app.use('/proxy-api/*', async (req, res) => {
    // Extract the actual target URL from the path
    const targetUrl = req.params[0];

    try {
        const proxyResponse = await axios({
            method: req.method,
            url: targetUrl,
            params: req.query,
            headers: {
                ...req.headers,
                'Host': url.parse(targetUrl).hostname
            },
            data: req.body
        });

        res.json(proxyResponse.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || {});
    }
});

// Start the server
const PORT = 3000; // Define the port
app.listen(PORT, () => {
    console.log(`Proxy server running at http://localhost:${PORT}`);
});