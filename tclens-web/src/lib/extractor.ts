import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { lookup } from 'dns/promises';

export interface ExtractionResult {
    sourceUrl: string;
    title?: string;
    extractedText: string;
    wordCount: number;
    extractionMethod: "readability" | "pdf" | "fallback" | "headless";
}

async function isPrivateIP(ip: string): Promise<boolean> {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4) return true; // Block IPv6 for simplicity or if invalid

    // 127.0.0.0/8
    if (parts[0] === 127) return true;
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && (parts[1] >= 16 && parts[1] <= 31)) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link-local)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 0.0.0.0/8
    if (parts[0] === 0) return true;

    return false;
}

async function headlessFallback(url: string): Promise<ExtractionResult> {
    const { chromium } = await import('playwright-core');
    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            userAgent: 'TCLensBot/1.0 (Link Analyzer; Headless)'
        });
        const page = await context.newPage();
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

        const content = await page.content();
        const title = await page.title();

        const dom = new JSDOM(content, { url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        let text = '';
        if (article && article.textContent) {
            text = article.textContent.trim();
        } else {
            text = await page.innerText('body');
        }

        const cleanText = text.replace(/\s+/g, ' ').trim();

        return {
            sourceUrl: url,
            title: (title || article?.title) || undefined,
            extractedText: cleanText,
            wordCount: cleanText.split(/\s+/).length,
            extractionMethod: 'headless'
        };
    } finally {
        if (browser) await browser.close();
    }
}

export async function extractFromUrl(url: string): Promise<ExtractionResult> {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        throw new Error('Invalid protocol. Only HTTP and HTTPS are allowed.');
    }

    // SSRF Protection
    const { address } = await lookup(urlObj.hostname);
    if (await isPrivateIP(address)) {
        throw new Error('Access to private network is restricted.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(url, {
        signal: controller.signal,
        headers: {
            'User-Agent': 'TCLensBot/1.0 (Link Analyzer)',
            'Accept': 'text/html,application/xhtml+xml,application/pdf,*/*'
        }
    });

    clearTimeout(timeout);

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const contentLength = parseInt(response.headers.get('content-length') || '0');

    // Size limit check (5MB for HTML, 15MB for PDF)
    if (contentType.includes('pdf')) {
        if (contentLength > 15 * 1024 * 1024) throw new Error('PDF too large (max 15MB)');
        const buffer = await response.arrayBuffer();
        const pdfParser = (await import('pdf-parse/lib/pdf-parse.js')).default;
        const data = await pdfParser(Buffer.from(buffer));
        return {
            sourceUrl: url,
            extractedText: data.text,
            wordCount: data.text.trim().split(/\s+/).length,
            extractionMethod: 'pdf'
        };
    }

    if (contentLength > 5 * 1024 * 1024) throw new Error('HTML too large (max 5MB)');

    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const document = dom.window.document;

    // Aggressive Cleaning: Remove non-legal elements before Readability sees them
    try {
        const elementsToRemove = document.querySelectorAll('nav, footer, header, aside, .cookie-banner, [id*="cookie"], [class*="cookie"], [class*="nav"], [class*="footer"], script, style, iframe, noscript');
        elementsToRemove.forEach(el => el.remove());
    } catch (e) {
        console.warn('[EXTRACTOR] Aggressive cleaning failed, proceeding with original DOM');
    }

    const reader = new Readability(document);
    const article = reader.parse();

    // If readability gives us a good amount of text, use it
    if (article && article.textContent && article.textContent.trim().length > 800) {
        const text = article.textContent.trim();
        return {
            sourceUrl: url,
            title: article.title || undefined,
            extractedText: text,
            wordCount: text.split(/\s+/).length,
            extractionMethod: 'readability'
        };
    }

    // If static extraction is poor, try headless
    try {
        console.log('[EXTRACTOR] Static extraction poor or insufficient, trying headless...');
        return await headlessFallback(url);
    } catch (e: any) {
        console.warn('[EXTRACTOR] Headless fallback failed:', e.message);

        // Final fallback: just get body text but clean it
        const bodyRaw = document.body.textContent || '';
        const cleanText = bodyRaw.replace(/\s+/g, ' ').trim();

        if (cleanText.length > 300) {
            return {
                sourceUrl: url,
                extractedText: cleanText,
                wordCount: cleanText.split(/\s+/).length,
                extractionMethod: 'fallback'
            };
        }

        if (html.toLowerCase().includes('cloudflare') || html.toLowerCase().includes('captcha')) {
            throw new Error('Access denied: Site is protected by anti-bot measures (Cloudflare/CAPTCHA). Please paste the text instead.');
        }

        throw new Error('Extraction failed: Could not find enough legal content on this page.');
    }
}
