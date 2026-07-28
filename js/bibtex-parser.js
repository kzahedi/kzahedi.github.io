/**
 * BibTeX Parser - Improved version
 * Handles nested braces, LaTeX accents, and complex fields
 */

class BibtexParser {
    constructor() {
        this.entries = [];
    }

    parse(bibtex) {
        this.entries = [];

        // Remove comments
        bibtex = bibtex.replace(/%.*$/gm, '');

        // Find all entries using a state machine approach
        let i = 0;
        while (i < bibtex.length) {
            // Find next @
            const atIndex = bibtex.indexOf('@', i);
            if (atIndex === -1) break;

            // Find entry type
            const typeMatch = bibtex.slice(atIndex).match(/^@(\w+)\s*\{/);
            if (!typeMatch) {
                i = atIndex + 1;
                continue;
            }

            const type = typeMatch[1].toLowerCase();
            const startBrace = atIndex + typeMatch[0].length - 1;

            // Find matching closing brace
            const endBrace = this.findMatchingBrace(bibtex, startBrace);
            if (endBrace === -1) {
                i = atIndex + 1;
                continue;
            }

            // Extract content between braces
            const content = bibtex.slice(startBrace + 1, endBrace);

            // Parse the entry
            const entry = this.parseEntry(type, content);
            if (entry) {
                this.entries.push(entry);
            }

            i = endBrace + 1;
        }

        return this.entries;
    }

    findMatchingBrace(str, start) {
        let depth = 1;
        let i = start + 1;

        while (i < str.length && depth > 0) {
            if (str[i] === '{' && str[i-1] !== '\\') {
                depth++;
            } else if (str[i] === '}' && str[i-1] !== '\\') {
                depth--;
            }
            i++;
        }

        return depth === 0 ? i - 1 : -1;
    }

    parseEntry(type, content) {
        // First part before comma is the key
        const commaIndex = content.indexOf(',');
        if (commaIndex === -1) return null;

        const key = content.slice(0, commaIndex).trim();
        const fieldsStr = content.slice(commaIndex + 1);

        return {
            type: type,
            key: key,
            fields: this.parseFields(fieldsStr)
        };
    }

    parseFields(fieldsStr) {
        const fields = {};
        let i = 0;

        while (i < fieldsStr.length) {
            // Skip whitespace and commas
            while (i < fieldsStr.length && /[\s,]/.test(fieldsStr[i])) i++;
            if (i >= fieldsStr.length) break;

            // Find field name
            const nameMatch = fieldsStr.slice(i).match(/^(\w+[-\w]*)\s*=\s*/);
            if (!nameMatch) {
                i++;
                continue;
            }

            const name = nameMatch[1].toLowerCase();
            i += nameMatch[0].length;

            // Parse value
            let value = '';

            if (fieldsStr[i] === '{') {
                // Brace-delimited value
                const endBrace = this.findMatchingBrace(fieldsStr, i);
                if (endBrace !== -1) {
                    value = fieldsStr.slice(i + 1, endBrace);
                    i = endBrace + 1;
                }
            } else if (fieldsStr[i] === '"') {
                // Quote-delimited value
                const endQuote = fieldsStr.indexOf('"', i + 1);
                if (endQuote !== -1) {
                    value = fieldsStr.slice(i + 1, endQuote);
                    i = endQuote + 1;
                }
            } else {
                // Bare value (number or macro)
                const bareMatch = fieldsStr.slice(i).match(/^(\w+)/);
                if (bareMatch) {
                    value = bareMatch[1];
                    i += bareMatch[0].length;
                }
            }

            // Skip Bdsk fields (binary data from BibDesk)
            if (!name.startsWith('bdsk-')) {
                fields[name] = this.cleanLatex(value);
            }
        }

        return fields;
    }

    cleanLatex(str) {
        if (!str) return '';

        return str
            // LaTeX accents with braces: {\"u} -> ü
            .replace(/\{\\"{([aouAOU])}\}/g, (m, c) => ({ a: 'ä', o: 'ö', u: 'ü', A: 'Ä', O: 'Ö', U: 'Ü' }[c] || c))
            .replace(/\{\\'([aeiouyAEIOUY])\}/g, (m, c) => c + '\u0301') // acute
            .replace(/\{\\`([aeiouyAEIOUY])\}/g, (m, c) => c + '\u0300') // grave
            // LaTeX accents without outer braces: \"u -> ü
            .replace(/\\"{([aouAOU])}/g, (m, c) => ({ a: 'ä', o: 'ö', u: 'ü', A: 'Ä', O: 'Ö', U: 'Ü' }[c] || c))
            .replace(/\\'([aeiouyAEIOUY])/g, (m, c) => ({ e: 'é', a: 'á', i: 'í', o: 'ó', u: 'ú', E: 'É' }[c] || c))
            .replace(/\\`([aeiouyAEIOUY])/g, (m, c) => ({ e: 'è', a: 'à' }[c] || c))
            // Other LaTeX
            .replace(/\\ss\b/g, 'ß')
            .replace(/\\&/g, '&')
            .replace(/\\%/g, '%')
            .replace(/\\_/g, '_')
            .replace(/\\#/g, '#')
            .replace(/\\\$/g, '$')
            // Remove remaining braces
            .replace(/\{([^{}]*)\}/g, '$1')
            // Dashes
            .replace(/---/g, '—')
            .replace(/--/g, '–')
            // Quotes
            .replace(/``/g, '"')
            .replace(/''/g, '"')
            // Newlines
            .replace(/\r?\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    getYears() {
        const years = new Set();
        this.entries.forEach(entry => {
            if (entry.fields.year) {
                years.add(entry.fields.year);
            }
        });
        return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
    }

    getTypeLabel(type) {
        const labels = {
            'article': 'Journal',
            'inproceedings': 'Conference',
            'incollection': 'Book Chapter',
            'phdthesis': 'PhD Thesis',
            'mastersthesis': 'Diploma Thesis',
            'techreport': 'Tech Report',
            'book': 'Book',
            'misc': 'Other'
        };
        return labels[type] || type;
    }

    formatAuthors(authorsStr, highlightPattern = null) {
        if (!authorsStr) return '';

        // Split by " and " or " AND "
        const authors = authorsStr.split(/\s+(?:and|AND)\s+/);

        return authors.map(author => {
            author = author.trim();

            // Check for highlight
            if (highlightPattern) {
                const patterns = highlightPattern.split('|');
                for (const pattern of patterns) {
                    const cleanPattern = pattern.toLowerCase().replace(/[^a-z\s-]/gi, '').trim();
                    const cleanAuthor = author.toLowerCase();
                    if (cleanAuthor.includes(cleanPattern) ||
                        cleanAuthor.includes('zahedi') ||
                        cleanAuthor.includes('ghazi')) {
                        return `<span class="highlight">${author}</span>`;
                    }
                }
            }
            return author;
        }).join(', ');
    }

    formatVenue(entry) {
        const f = entry.fields;
        let parts = [];

        switch (entry.type) {
            case 'article':
                if (f.journal) parts.push(`<em>${f.journal}</em>`);
                if (f.volume) {
                    let vol = f.volume;
                    if (f.number) vol += `(${f.number})`;
                    parts.push(vol);
                }
                if (f.pages) parts.push(`pp. ${f.pages}`);
                break;

            case 'inproceedings':
            case 'incollection':
                if (f.booktitle) parts.push(`<em>${f.booktitle}</em>`);
                if (f.series) parts.push(f.series);
                if (f.pages) parts.push(`pp. ${f.pages}`);
                if (f.publisher) parts.push(f.publisher);
                break;

            case 'phdthesis':
            case 'mastersthesis':
                const thesisType = f.type || (entry.type === 'phdthesis' ? 'PhD Thesis' : 'Master\'s Thesis');
                if (f.school) parts.push(`${thesisType}, ${f.school}`);
                break;

            case 'techreport':
                if (f.institution) parts.push(f.institution);
                if (f.number) parts.push(f.number);
                break;

            default:
                if (f.publisher) parts.push(f.publisher);
                if (f.howpublished) parts.push(f.howpublished);
        }

        if (f.year) parts.push(f.year);

        return parts.join(', ');
    }
}

// Make available globally
window.BibtexParser = BibtexParser;
