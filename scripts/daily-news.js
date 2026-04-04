import fs from 'fs';
import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 🤖 Meanweber Auto-Blogger Bot Scripts

const rss = new Parser();
// Require API key from GitHub Secrets
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const DATA_FILE = './content/data.js';

async function fetchLatestNews() {
    console.log("📡 Fetching global tech news from TechCrunch...");
    // You can change this URL to any RSS feed you prefer (e.g. The Verge, Wired)
    const feed = await rss.parseURL('https://techcrunch.com/feed/');
    if(feed.items.length === 0) throw new Error('No news found');
    
    // Grab the most recent news article
    console.log(`📰 Found Headline: ${feed.items[0].title}`);
    return feed.items[0]; 
}

async function summarizeNews(newsItem) {
    console.log("🧠 Thinking with Gemini AI...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Strict prompting to ensure consistent JSON formatting out of the LLM
    const prompt = `
        You are an expert Thai tech blogger for the premium website "Meanweber".
        Translate and summarize the following English tech news into an engaging Thai blog post snippet.
        Make it sound professional, modern, and exciting for developers.
        
        News Title: ${newsItem.title}
        News Content: ${newsItem.contentSnippet || newsItem.content}
        
        You MUST output ONLY a valid JSON object in the exact format shown below, with no markdown code blocks or additional text:
        {
           "title": "(Catchy Thai Title, max 60 chars)",
           "excerpt": "(2-3 sentences summary in Thai explaining why this matters)"
        }
    `;
    
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    // Clean up potential markdown formatting that Gemini might output
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
}

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
    
    // Format new entry as string formatted with indents for clean code pushes
    const entryString = `\n    {\n        "id": "${newEntry.id}",\n        "title": "${newEntry.title}",\n        "excerpt": "${newEntry.excerpt}",\n        "image": "${newEntry.image}",\n        "date": "${newEntry.date}",\n        "link": "${newEntry.link}"\n    },`;
    
    // Insert new entry string right after the array opening bracket
    const newContent = content.slice(0, insertionIndex) + entryString + content.slice(insertionIndex);
    
    // Safely write to disk
    fs.writeFileSync(DATA_FILE, newContent, 'utf8');
    console.log(`✅ Success! Database updated with ID: ${id}`);
}

async function run() {
    try {
        if(!process.env.GEMINI_API_KEY) {
            console.warn("⚠️ NO 'GEMINI_API_KEY' DETECTED!");
            console.warn("Running in Mock Mode. Please add the secret in GitHub Settings > Secrets.");
            
            // Still write a mock file so we know the GitHub Action works
            updateDataFile({
                title: "ตัวอย่างข่าวอัปเดตอัตโนมัติ (Mock)",
                excerpt: "นี่คือการทดสอบการทำงานของหุ่นยนต์รันในเครื่อง..."
            });
            return;
        }

        const news = await fetchLatestNews();
        console.log("Processing translation...");
        const aiSummary = await summarizeNews(news);
        updateDataFile(aiSummary);
        
    } catch(err) {
        console.error("❌ Bot encountered an error:", err);
        process.exit(1); // Tell GitHub Action to mark as Failed
    }
}

// Start sequence
run();
