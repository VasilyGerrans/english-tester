function tokenize(sentence) {
    return sentence.match(/\w+|[^\s\w]+/g) || [];
}

function lcs(a, b) {
    const dp = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0));
    for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) {
            if (a[i] === b[j]) {
                dp[i + 1][j + 1] = dp[i][j] + 1;
            } else {
                dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
    }
    const result = [];
    let i = a.length, j = b.length;
    while (i > 0 && j > 0) {
        if (a[i - 1] === b[j - 1]) {
            result.unshift(a[i - 1]);
            i--;
            j--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }
    return result;
}

function findCommonAnchors(sentences) {
    const tokenized = sentences.map(tokenize);
    let common = tokenized[0];
    for (let i = 1; i < tokenized.length; i++) {
        common = lcs(common, tokenized[i]);
    }
    return common;
}

function splitByAnchors(tokens, anchors) {
    const parts = [];
    let pos = 0;
    for (const anchor of anchors) {
        const idx = tokens.indexOf(anchor, pos);
        if (idx === -1) {
            parts.push(tokens.slice(pos)); // rest of the sentence
            return parts;
        } else {
            parts.push(tokens.slice(pos, idx));
            pos = idx + 1;
        }
    }
    parts.push(tokens.slice(pos)); // tail
    return parts;
}

function cleanCommonText(text) {
    return text
        .replace(/\s+([.,!?;:])/g, '$1')
        .replace(/'\s+/g, "'")
        .replace(/\s+'/g, "'")
        .replace(/\s*-\s*/g, '-')
        .replace(/\s*é\s*/g, 'é')
        .replace(/\s+/g, ' ')
        .trim();
}

function extractDifferencesMultiLCS(sentences) {
    if (sentences.length !== 4) throw new Error('Must provide exactly four sentences.');

    const tokenized = sentences.map(tokenize);
    const anchors = findCommonAnchors(sentences);
    const splitted = tokenized.map(tokens => splitByAnchors(tokens, anchors));

    const maxParts = Math.max(...splitted.map(parts => parts.length));

    const common = [];
    const differingSlots = [];

    for (let i = 0; i < maxParts; i++) {
        const anchorPart = anchors[i] || null;
        const differences = splitted.map(parts => parts[i] || []);

        const allEmpty = differences.every(part => part.length === 0);

        if (!allEmpty) {
            differingSlots.push(
                differences.map(part => part.length > 0 ? part.join(' ') : '-')
            );
            common.push('___');
        }

        if (anchorPart) {
            common.push(anchorPart);
        }
    }

    const answers = [];
    for (let s = 0; s < 4; s++) {
        const collected = differingSlots.map(slot => cleanCommonText(slot[s]));
        answers.push(collected.join(' / '));
    }

    return {
        common: cleanCommonText(common.join(' ')),
        answers
    };
}

module.exports = {
    extractDifferencesMultiLCS,
    tokenize,
    lcs,
    findCommonAnchors,
    splitByAnchors,
    cleanCommonText
}; 