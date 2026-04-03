// ============================================================
//  grab all the DOM elements we need
// ============================================================
const output = document.getElementById('output');
const lengthSlider = document.getElementById('lengthSlider');
const lengthVal = document.getElementById('lengthVal');
const btnGenerate = document.getElementById('btnGenerate');
const btnCopy = document.getElementById('btnCopy');
const optUpper = document.getElementById('optUpper');
const optLower = document.getElementById('optLower');
const optNumbers = document.getElementById('optNumbers');
const optSymbols = document.getElementById('optSymbols');

const bars = [
    document.getElementById('b1'),
    document.getElementById('b2'),
    document.getElementById('b3'),
    document.getElementById('b4'),
];
const strengthWord = document.getElementById('strengthWord');

// ============================================================
//  character sets
// ============================================================
const CHARS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

// ============================================================
//  update the length label when slider moves
// ============================================================
lengthSlider.addEventListener('input', function () {
    lengthVal.textContent = this.value;
});

// ============================================================
//  build the character pool from checked options
// ============================================================
function buildPool() {
    let pool = '';
    if (optUpper.checked) pool += CHARS.upper;
    if (optLower.checked) pool += CHARS.lower;
    if (optNumbers.checked) pool += CHARS.numbers;
    if (optSymbols.checked) pool += CHARS.symbols;
    return pool;
}

// ============================================================
//  generate a random password
// ============================================================
function generatePassword() {
    const pool = buildPool();
    const length = parseInt(lengthSlider.value, 10);

    // need at least one character type selected
    if (pool.length === 0) {
        output.textContent = 'pick at least one option!';
        resetStrength();
        return;
    }

    // use crypto.getRandomValues for good randomness
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    let password = '';
    for (let i = 0; i < length; i++) {
        password += pool[array[i] % pool.length];
    }

    // show it + animate
    output.textContent = password;
    output.classList.remove('animate');
    void output.offsetWidth; // force reflow to restart animation
    output.classList.add('animate');

    // update strength meter
    updateStrength(password);

    // reset copy button label
    btnCopy.textContent = '⎘ Copy';
    btnCopy.classList.remove('copied');
}

// ============================================================
//  evaluate password strength (simple heuristic)
// ============================================================
function updateStrength(pwd) {
    let score = 0;

    if (pwd.length >= 8) score++;
    if (pwd.length >= 16) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    // map score (0-5) to 4 levels
    let level;
    if (score <= 1) level = 1;
    else if (score <= 2) level = 2;
    else if (score <= 3) level = 3;
    else level = 4;

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', 'weak', 'medium', 'strong', 'strong'];

    // paint bars
    bars.forEach(function (bar, index) {
        bar.className = 'bar'; // reset
        if (index < level) {
            bar.classList.add(colors[level]);
        }
    });

    // update label
    strengthWord.textContent = labels[level];
    strengthWord.style.color =
        level === 1 ? 'var(--red)' :
            level === 2 ? '#e67e22' :
                'var(--green)';
}

// ============================================================
//  reset strength display
// ============================================================
function resetStrength() {
    bars.forEach(function (bar) { bar.className = 'bar'; });
    strengthWord.textContent = '—';
    strengthWord.style.color = '';
}

// ============================================================
//  copy to clipboard
// ============================================================
btnCopy.addEventListener('click', function () {
    const pwd = output.textContent;
    if (!pwd || pwd === 'Click Generate...' || pwd === 'pick at least one option!') return;

    navigator.clipboard.writeText(pwd).then(function () {
        btnCopy.textContent = '✓ Copied!';
        btnCopy.classList.add('copied');

        // revert after 2 seconds
        setTimeout(function () {
            btnCopy.textContent = '⎘ Copy';
            btnCopy.classList.remove('copied');
        }, 2000);
    });
});

// ============================================================
//  generate button
// ============================================================
btnGenerate.addEventListener('click', generatePassword);

// also allow pressing Enter anywhere on the card
document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') generatePassword();
});

// ============================================================
//  generate one on page load so the field isn't empty
// ============================================================
generatePassword();