import fs from 'fs';
import Parser from 'rss-parser';
import { GoogleGenAI } from '@google/genai';

// 🤖 Meanweber Auto-Blogger Bot Scripts
// Updated April 2026 — Uses FREE Gemini 2.5 Flash model

const rss = new Parser();
const DATA_FILE = './content/data.js';

// Free-tier model from Google AI Studio (no billing required)
const FREE_MODEL = 'gemini-2.5-flash';

// Multiple RSS sources for variety
const RSS_FEEDS = [
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
    { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
];

/**
 * Read existing titles from data.js to avoid duplicate posts.
 */
function getExistingTitles() {
    try {
        const content = fs.readFileSync(DATA_FILE, 'utf8');
        // Extract all title values from the data.js file
        const titleRegex = /"title":\s*"([^"]+)"/g;
        const titles = [];
        let match;
        while ((match = titleRegex.exec(content)) !== null) {
            titles.push(match[1].toLowerCase());
        }
        return titles;
    } catch {
        return [];
    }
}

/**
 * Fetch the latest tech news from multiple RSS feeds.
 * Tries each feed in order until one returns a valid article.
 */
async function fetchLatestNews() {
    console.log("📡 Fetching global tech news from multiple sources...");

    for (const source of RSS_FEEDS) {
        try {
            console.log(`  → Trying ${source.name}...`);
            const feed = await rss.parseURL(source.url);

            if (feed.items && feed.items.length > 0) {
                // Pick the first item that we haven't posted before
                const existingTitles = getExistingTitles();

                for (const item of feed.items.slice(0, 5)) {
                    const isDuplicate = existingTitles.some(
                        existing => item.title && existing.includes(item.title.toLowerCase().slice(0, 30))
                    );

                    if (!isDuplicate) {
                        console.log(`📰 Found Headline from ${source.name}: ${item.title}`);
                        return { ...item, source: source.name };
                    }
                }
                console.log(`  ⚠️ All recent items from ${source.name} are duplicates, trying next...`);
            }
        } catch (feedErr) {
            console.warn(`  ⚠️ Failed to fetch ${source.name}: ${feedErr.message}`);
        }
    }

    throw new Error('Could not find any new, non-duplicate news from all sources.');
}

/**
 * Use Gemini 2.5 Flash (FREE) to translate and summarize news into Thai.
 */
async function summarizeNews(newsItem, ai) {
    const prompt = `
        You are an expert Thai tech blogger for the premium website "Meanweber".
        Translate and summarize the following English tech news into an engaging Thai blog post snippet.
        Make it sound professional, modern, and exciting for developers.
        
        News Source: ${newsItem.source}
        News Title: ${newsItem.title}
        News Content: ${newsItem.contentSnippet || newsItem.content || 'No content available'}
        
        You MUST output ONLY a valid JSON object in the exact format shown below, with no markdown code blocks or additional text:
        {
           "title": "(Catchy Thai Title, max 60 chars)",
           "excerpt": "(2-3 sentences summary in Thai explaining why this matters)"
        }
    `;

    console.log(`🧠 Calling ${FREE_MODEL} (Free Tier)...`);

    const response = await ai.models.generateContent({
        model: FREE_MODEL,
        contents: prompt,
    });

    let text = response.text;
    // Clean up potential markdown formatting that Gemini might output
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('AI did not return valid JSON. Raw output: ' + text.slice(0, 200));
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.title || !parsed.excerpt) {
        throw new Error('AI JSON missing required fields (title/excerpt).');
    }

    return parsed;
}

/**
 * Write the new blog entry into content/data.js
 */
function updateDataFile(aiContent) {
    console.log("📝 Writing to data.js database...");

    const id = "news-" + Date.now();
    // Format date beautifully in Thai
    const dateStr = new Date().toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    // Structure exactly matching content/data.js array items
    const newEntry = {
        id: id,
        title: aiContent.title,
        excerpt: aiContent.excerpt + " (🤖 AI-Automated Post)",
        image: "content/images/uiux-cover.png", // Fallback default image for news
        date: dateStr,
        link: "#post/" + id
    };

    // Read the array file
    let content = fs.readFileSync(DATA_FILE, 'utf8');

    // Find where the array starts: `const blogPosts = [`
    const signature = 'blogPosts = [';
    const arrayStart = content.indexOf(signature);

    if (arrayStart === -1) {
        throw new Error("Could not find 'blogPosts = [' in data.js to inject data.");
    }

    const insertionIndex = arrayStart + signature.length;

    // Sanitize AI-generated content to prevent JS syntax errors
    // Must escape: backslashes, newlines, carriage returns, tabs, and double quotes
    const sanitize = (str) => str
        .replace(/\\/g, '\\\\')       // backslashes first
        .replace(/"/g, '\\"')         // double quotes
        .replace(/\n/g, ' ')          // newlines → space
        .replace(/\r/g, '')           // carriage returns → remove
        .replace(/\t/g, ' ')          // tabs → space
        .replace(/\s{2,}/g, ' ')      // collapse multiple spaces
        .trim();
    const safeTitle = sanitize(newEntry.title);
    const safeExcerpt = sanitize(newEntry.excerpt);

    // Format new entry as string formatted with indents for clean code pushes
    const entryString = `\n    {\n        "id": "${newEntry.id}",\n        "title": "${safeTitle}",\n        "excerpt": "${safeExcerpt}",\n        "image": "${newEntry.image}",\n        "date": "${newEntry.date}",\n        "link": "${newEntry.link}"\n    },`;

    // Insert new entry string right after the array opening bracket
    const newContent = content.slice(0, insertionIndex) + entryString + content.slice(insertionIndex);

    // Safely write to disk
    fs.writeFileSync(DATA_FILE, newContent, 'utf8');
    console.log(`✅ Success! Database updated with ID: ${id}`);
}

/**
 * Main execution
 */
async function run() {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("⚠️ NO 'GEMINI_API_KEY' DETECTED!");
            console.warn("Running in Mock Mode. Please add the secret in GitHub Settings > Secrets.");

            // Still write a mock file so we know the GitHub Action works
            updateDataFile({
                title: "ตัวอย่างข่าวอัปเดตอัตโนมัติ (Mock)",
                excerpt: "นี่คือการทดสอบการทำงานของหุ่นยนต์รันในเครื่อง..."
            });
            return;
        }

        // Initialize with the new SDK — auto-reads GEMINI_API_KEY env var
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const news = await fetchLatestNews();
        console.log("🔄 Processing translation with AI...");
        const aiSummary = await summarizeNews(news, ai);
        console.log("✨ AI Summary:", JSON.stringify(aiSummary, null, 2));
        updateDataFile(aiSummary);

    } catch (err) {
        console.error("❌ Bot encountered an error:", err.message);

        // Fallback: Post the error directly to the website for simple debugging
        updateDataFile({
            title: "⚠️ Bot System Error Alert",
            excerpt: "ระบบอัตโนมัติพบปัญหา: " + err.message + ". กรุณาตรวจเช็ก API Key หรือโครงสร้างข่าว."
        });
        process.exit(0); // Exit properly so GitHub saves the error message
    }
}

// Start sequence
run();
