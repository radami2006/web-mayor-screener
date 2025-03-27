// **********************************************************************
// WARNING: THIS IS FOR DEVELOPMENT/DEMONSTRATION PURPOSES ONLY.
// DO NOT USE THIS IN A PRODUCTION ENVIRONMENT.
// IT IS INSECURE AND NOT SCALABLE.
// **********************************************************************

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const rateLimit = require('express-rate-limit');
const pdf = require('pdf-parse');
const marked = require('marked');

const app = express();
const port = process.env.PORT || 3000;

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 50,
    message: "Too many requests from this IP, please try again after an hour"
});

app.use('/api/', limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("Gemini API key not found. Please set GEMINI_API_KEY.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

let analysisContext = {
    recentAnalyses: [],
    jobRequisites: null
};

async function generateText(prompt) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
}

async function generateTextWithRetry(prompt, maxRetries = 3) {
    let retries = 0;
    let delay = 1000;

    while (retries < maxRetries) {
        try {
            return await generateText(prompt);
        } catch (error) {
            if (error.message.includes('503 Service Unavailable')) {
                retries++;
                console.log(`API overloaded. Retrying in ${delay / 1000}s (${retries}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            } else if (error.message.includes('429 Too Many Requests')) {
                return "Error: API quota exceeded. Please check your limits.";
            } else {
                throw error;
            }
        }
    }
    return "Error: API overloaded or quota exceeded after retries.";
}

function formatJobRequisites(requisites) {
    if (!requisites) return "No specific job requirements provided.";
    return `
- Job Title: ${requisites.jobTitle || 'Not specified'}
- Minimum Experience: ${requisites.experience || 'Not specified'}
- Required Skills: ${requisites.skills?.length ? requisites.skills.join(', ') : 'None specified'}
- Job Description: ${requisites.description || 'Not specified'}
    `.trim();
}

function formatAnalysisResponse(rawText) {
    if (rawText.trim() === "This is not a CV.") {
        return `<div class="analysis-section"><p>${rawText}</p></div>`;
    }

    const sections = {
        match: rawText.match(/^\s*1\.\s*\*\*Match to Job Requirements:\*\*\s*([\s\S]*?)(?=^\s*2\.|\n*$)/m),
        shortcomings: rawText.match(/^\s*2\.\s*\*\*Shortcomings:\*\*\s*([\s\S]*?)(?=^\s*3\.|\n*$)/m),
        scores: rawText.match(/^\s*3\.\s*\*\*Scores:\*\*\s*([\s\S]*?)(?=^\s*4\.|\n*$)/m),
        summary: rawText.match(/^\s*4\.\s*\*\*Summary:\*\*\s*([\s\S]*$)/m)
    };

    let html = '<div class="analysis-section">';
    
    html += `
    <style>
        .analysis-section { padding: 1rem; }
        .analysis-section h3 { color: #34d399; margin: 0.75rem 0 0.5rem; font-size: 1.1rem; }
        .analysis-section ul { margin-left: 1.5rem; margin-bottom: 1rem; list-style-type: disc; }
        .analysis-section p { margin-bottom: 1rem; }
        .analysis-section strong { font-weight: 600; }
    </style>`;

    for (const [key, match] of Object.entries(sections)) {
        if (match && match[1]) {
            let content = match[1].trim();
            html += `<h3>${key === 'match' ? 'Match to Job Requirements' : key.charAt(0).toUpperCase() + key.slice(1)}:</h3>`;
            
            if (key === 'summary') {
                html += `<p>${marked.parse(content.replace(/\*\*/g, ''))}</p>`;
            } else {
                const items = content.split('\n- ').filter(item => item.trim());
                html += '<ul>';
                items.forEach((item, index) => {
                    const cleanItem = (index === 0 ? item.replace(/^- /, '') : item).trim();
                    if (cleanItem) {
                        html += `<li>${marked.parseInline(cleanItem)}</li>`;
                    }
                });
                html += '</ul>';
            }
        }
    }

    html += '</div>';
    return html;
}

function formatMassAnalysisResponse(rawText) {
    let html = '<div class="analysis-section">';
    
    html += `
    <style>
        .analysis-section { padding: 1rem; }
        .analysis-section h3 { color: #34d399; margin: 0.75rem 0 0.5rem; font-size: 1.1rem; }
        .analysis-section ul { margin-left: 1.5rem; margin-bottom: 1rem; list-style-type: disc; }
        .analysis-section p { margin-bottom: 1rem; }
        .analysis-section strong { font-weight: 600; }
    </style>`;

    // Clean and format the mass analysis response
    const lines = rawText.split('\n').filter(line => line.trim());
    html += '<h3>Mass Analysis Summary:</h3><ul>';
    lines.forEach(line => {
        if (line.trim().startsWith('-')) {
            html += `<li>${marked.parseInline(line.trim().replace(/^- /, ''))}</li>`;
        } else {
            html += `<li>${marked.parseInline(line.trim())}</li>`;
        }
    });
    html += '</ul></div>';
    return html;
}

app.post('/api/upload', upload.array('cvFiles'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'No files uploaded.' });
        }

        const jobRequisites = JSON.parse(req.body.jobRequisites || '{}');
        analysisContext.jobRequisites = jobRequisites;
        analysisContext.recentAnalyses = []; // Clear previous analyses

        const analysisResults = [];

        for (const file of req.files) {
            try {
                const pdfData = await pdf(file.buffer);
                const fileContent = pdfData.text;

                const prompt = `
                If the input is not a CV, respond only with: "This is not a CV."

                Otherwise, analyze the CV based on the job requirements and criteria below. Use this EXACT markdown format:

                1. **Match to Job Requirements:**
                   - [How candidate meets specific job requirements]
                   - [Additional matches]
                
                2. **Shortcomings:**
                   - [Deficiencies compared to job requirements]
                   - [Additional shortcomings]
                
                3. **Scores:**
                   - Academic Excellence: X/5 (brief explanation)
                   - Leadership & Teamwork: X/5 (brief explanation)
                   - Relevant Skills: X/5 (brief explanation)
                   - Experience: X/5 (brief explanation)
                
                4. **Summary:**
                   [One paragraph, max 150 words, with strengths, weaknesses, and recommendation (Accept, Reject, or Waitlist)]

                **Job Requirements:**
                ${formatJobRequisites(jobRequisites)}
                
                **Evaluation Criteria:**
                - Academic Excellence: Strong grades, relevant coursework
                - Leadership & Teamwork: Extracurricular activities, leadership roles
                - Relevant Skills: Technical and soft skills matching job needs
                - Experience: Relevant work history
                
                CV Text: ${fileContent}
                
                After analysis, answer this question:
                "How well does this candidate match the job requirements overall?"
                `;

                let responseText = await generateTextWithRetry(prompt);
                const formattedResponse = formatAnalysisResponse(responseText);
                
                analysisResults.push(formattedResponse);
                
                analysisContext.recentAnalyses.push({
                    filename: file.originalname,
                    cvText: fileContent,
                    analysis: responseText
                });
                if (analysisContext.recentAnalyses.length > 5) {
                    analysisContext.recentAnalyses.shift();
                }

            } catch (fileError) {
                console.error(`Error processing ${file.originalname}:`, fileError);
                analysisResults.push(`<div class="analysis-section"><p>Error analyzing ${file.originalname}: ${fileError.message}</p></div>`);
            }
        }

        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, analysisResults });

    } catch (error) {
        console.error('Error handling upload:', error);
        res.status(500).json({ success: false, error: 'Failed to process files.' });
    }
});

app.post('/api/mass-analyze', upload.array('cvFiles'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'No files uploaded.' });
        }

        const jobRequisites = JSON.parse(req.body.jobRequisites || '{}');
        analysisContext.jobRequisites = jobRequisites;
        analysisContext.recentAnalyses = []; // Clear previous analyses for mass analysis

        const cvAnalyses = [];
        for (const file of req.files) {
            try {
                const pdfData = await pdf(file.buffer);
                const fileContent = pdfData.text;

                const prompt = `
                If the input is not a CV, respond only with: "This is not a CV."

                Otherwise, analyze the CV based on the job requirements and criteria below. Return only the scores in this exact format:
                - Academic Excellence: X/5
                - Leadership & Teamwork: X/5
                - Relevant Skills: X/5
                - Experience: X/5

                **Job Requirements:**
                ${formatJobRequisites(jobRequisites)}
                
                **Evaluation Criteria:**
                - Academic Excellence: Strong grades, relevant coursework
                - Leadership & Teamwork: Extracurricular activities, leadership roles
                - Relevant Skills: Technical and soft skills matching job needs
                - Experience: Relevant work history
                
                CV Text: ${fileContent}
                `;

                let responseText = await generateTextWithRetry(prompt);
                if (responseText.trim() === "This is not a CV.") {
                    cvAnalyses.push({ filename: file.originalname, analysis: "This is not a CV." });
                } else {
                    cvAnalyses.push({ filename: file.originalname, analysis: responseText });
                }
            } catch (fileError) {
                console.error(`Error processing ${file.originalname}:`, fileError);
                cvAnalyses.push({ filename: file.originalname, analysis: `Error: ${fileError.message}` });
            }
        }

        // Summarize the results
        const summaryPrompt = `
        You are an AI assistant summarizing the analysis of multiple CVs for a hiring manager. Provide a concise summary of the following CV analyses based on the job requirements. Use markdown list format (- for each point) with these details:
        - Total number of CVs analyzed
        - Number of valid CVs (excluding non-CVs and errors)
        - Average scores for Academic Excellence, Leadership & Teamwork, Relevant Skills, and Experience (out of 5)
        - Recommendations (e.g., how many candidates to Accept, Reject, or Waitlist, based on their summaries if available)
        - Any notable patterns or standout candidates (mention filenames if applicable)

        **Job Requirements:**
        ${formatJobRequisites(jobRequisites)}
        
        **CV Analyses:**
        ${cvAnalyses.map(a => `File: ${a.filename}\n${a.analysis}`).join('\n\n')}
        `;

        let summaryResponse = await generateTextWithRetry(summaryPrompt);
        const formattedSummary = formatMassAnalysisResponse(summaryResponse);

        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, summary: formattedSummary });

    } catch (error) {
        console.error('Error handling mass analyze:', error);
        res.status(500).json({ success: false, error: 'Failed to process mass analysis.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying ${port + 1}...`);
        app.listen(port + 1);
    } else {
        console.error('Server error:', err);
    }
});