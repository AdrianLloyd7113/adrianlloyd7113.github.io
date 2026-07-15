(function () {
    'use strict';
    const KONAMI = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'b', 'a',
    ];
    const PROMPT = 'C:\\PORTFOLIO>';
    const BOOT_LINES = [
        'Lloyd Disk Operating System (LDOS) [Version 11.07.2003]',
        '(C) Copyright Lloydsoft Computer Technologies. All rights reserved.',
        '',
        'Initializing portfolio subsystem........ OK',
        'Loading project database............... OK',
        'Mounting awards volume................. OK',
        'Establishing uplink.................... OK',
        '',
        "Welcome to Terminal Mode. Type 'help' to get started.",
        "Type 'exit' (or press ESC) to return to the website.",
        '',
    ];
    let konamiIndex    = 0;
    let terminalActive = false;
    let acceptingInput = false;
    let inputBuffer    = '';
    let commandHistory = [];
    let historyIndex   = -1;

    let terminalEl, outputEl, inputLineEl, inputTextEl;

    document.addEventListener('keydown', (e) => {
        if (terminalActive) return;
        const expected = KONAMI[konamiIndex];
        if (e.key.toLowerCase() === expected.toLowerCase()) {
            konamiIndex += 1;
            if (konamiIndex === KONAMI.length) {
                konamiIndex = 0;
                activateTerminal();
            }
        } else {
            konamiIndex = (e.key.toLowerCase() === KONAMI[0].toLowerCase()) ? 1 : 0;
        }
    });

    function activateTerminal() {
        terminalActive = true;
        terminalEl = document.createElement('div');
        terminalEl.id = 'terminal';
        terminalEl.innerHTML =
            '<div id="terminal-output"></div>' +
            '<div id="terminal-input-line">' +
            '<span class="terminal-prompt"></span>' +
            '<span id="terminal-input"></span>' +
            '<span class="terminal-cursor">\u2588</span>' +
            '</div>';
        document.body.appendChild(terminalEl);
        document.body.classList.add('terminal-open');
        outputEl    = terminalEl.querySelector('#terminal-output');
        inputLineEl = terminalEl.querySelector('#terminal-input-line');
        inputTextEl = terminalEl.querySelector('#terminal-input');
        terminalEl.querySelector('.terminal-prompt').textContent = PROMPT + ' ';
        inputLineEl.style.visibility = 'hidden';
        document.addEventListener('keydown', handleInput, true);
        runBootSequence();
    }
    function deactivateTerminal() {
        terminalActive = false;
        acceptingInput = false;
        document.removeEventListener('keydown', handleInput, true);
        if (terminalEl) terminalEl.remove();
        document.body.classList.remove('terminal-open');
        inputBuffer = '';
        commandHistory = [];
        historyIndex = -1;
    }

    function runBootSequence() {
        acceptingInput = false;
        let i = 0;
        (function nextLine() {
            if (i < BOOT_LINES.length) {
                printLine(BOOT_LINES[i]);
                i += 1;
                setTimeout(nextLine, 130);
            } else {
                acceptingInput = true;
                inputLineEl.style.visibility = 'visible';
                updateInputDisplay();
            }
        })();
    }

    function handleInput(e) {
        if (!terminalActive) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            exitTerminal();
            return;
        }
        if (!acceptingInput) { e.preventDefault(); return; }
        switch (e.key) {
            case 'Enter': {
                e.preventDefault();
                const command = inputBuffer;
                inputBuffer = '';
                historyIndex = -1;
                updateInputDisplay();
                executeCommand(command);
                break;
            }
            case 'Backspace':
                e.preventDefault();
                inputBuffer = inputBuffer.slice(0, -1);
                updateInputDisplay();
                break;
            case 'ArrowUp':
                e.preventDefault();
                navigateHistory(1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                navigateHistory(-1);
                break;
            case 'Tab':
                e.preventDefault();
                autocomplete();
                break;
            default:
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                    inputBuffer += e.key;
                    updateInputDisplay();
                }
        }
    }
    function navigateHistory(direction) {
        if (commandHistory.length === 0) return;
        historyIndex += direction;
        if (historyIndex < 0) {
            historyIndex = -1;
            inputBuffer = '';
        } else if (historyIndex >= commandHistory.length) {
            historyIndex = commandHistory.length - 1;
            inputBuffer = commandHistory[historyIndex];
        } else {
            inputBuffer = commandHistory[historyIndex];
        }
        updateInputDisplay();
    }
    function autocomplete() {
        const partial = inputBuffer.trim().toLowerCase();
        if (!partial) return;
        const matches = Object.keys(COMMANDS).filter((c) => c.startsWith(partial));
        if (matches.length === 1) {
            inputBuffer = matches[0];
            updateInputDisplay();
        } else if (matches.length > 1) {
            echoCommand(inputBuffer);
            printLine(matches.join('   '));
        }
    }
    function updateInputDisplay() {
        inputTextEl.textContent = inputBuffer;
        scrollToBottom();
    }

    function executeCommand(raw) {
        echoCommand(raw);
        const input = raw.trim();
        if (input === '') return;
        commandHistory.unshift(input);
        const [name, ...args] = input.split(/\s+/);
        const handler = COMMANDS[name.toLowerCase()];
        if (handler) {
            handler(args);
        } else {
            printLine("'" + name + "' is not recognized as a command.");
            printLine("Type 'help' for a list of available commands.");
            printLine('');
        }
    }
    function echoCommand(text) {
        printLine(PROMPT + ' ' + text, 'terminal-echo');
    }

    const COMMANDS = {
        help:     cmdHelp,
        home:     () => renderTextPage('home'),
        bio:      () => renderTextPage('bio'),
        contact:  () => renderTextPage('contact'),
        projects: cmdProjects,
        awards:   cmdAwards,
        dir:      cmdDir,
        ls:       cmdDir,
        whoami:   () => { printLine('Adrian Lloyd - Software Engineer & Organizational Leader'); printLine(''); },
        clear:    () => { outputEl.innerHTML = ''; },
        cls:      () => { outputEl.innerHTML = ''; },
        exit:     exitTerminal,
        quit:     exitTerminal,
    };
    function cmdHelp() {
        const list = [
            ['help',     'Show this list of commands'],
            ['home',     'Display the home page introduction'],
            ['projects', 'List all projects by category'],
            ['awards',   'List awards and recognition'],
            ['bio',      'Read a short biography'],
            ['contact',  'Show contact information'],
            ['dir',      'List the available sections'],
            ['clear',    'Clear the screen'],
            ['whoami',   'Who am I?'],
            ['exit',     'Leave Terminal Mode (or press ESC)'],
        ];
        printLine('');
        printHeading('AVAILABLE COMMANDS');
        list.forEach(([c, d]) => printLine('  ' + c.padEnd(12) + d));
        printLine('');
        printLine('TIP: Up/Down = command history, Tab = autocomplete.');
        printLine('');
    }
    function cmdDir() {
        printLine('');
        printLine(' Directory of ' + PROMPT.replace('>', ''));
        printLine('');
        ['HOME', 'PROJECTS', 'AWARDS', 'BIO', 'CONTACT'].forEach((s) => {
            printLine('  <SECTION>   ' + s);
        });
        printLine('');
    }
    function renderTextPage(key) {
        const page = TERMINAL_CONTENT[key];
        printLine('');
        if (!page) { printLine('No content available for "' + key + '".'); printLine(''); return; }
        printHeading(page.heading);
        (page.lines || []).forEach((line) => printLine(line));
        printLine('');
    }
    function cmdProjects() {
        const data = TERMINAL_CONTENT.projects;
        printLine('');
        printHeading(data.heading);
        data.categories.forEach((cat) => {
            printLine('[ ' + cat.name + ' ]', 'terminal-subheading');
            printLine('');
            cat.items.forEach((item, idx) => {
                printLine('  ' + (idx + 1) + '. ' + item.title + ' - ' + item.subtitle);
                printLine('     ' + item.description);
                if (item.link) printLine('     > ' + item.link);
                printLine('');
            });
        });
    }
    function cmdAwards() {
        const data = TERMINAL_CONTENT.awards;
        printLine('');
        printHeading(data.heading);
        data.categories.forEach((cat) => {
            printLine('[ ' + cat.name + ' ]', 'terminal-subheading');
            printLine('');
            cat.items.forEach((item) => {
                printLine('  * ' + item.title + ' - ' + item.reason);
                printLine('    ' + item.location);
                printLine('');
            });
        });
    }
    function exitTerminal() {
        if (!terminalActive) return;
        acceptingInput = false;
        printLine('');
        printLine('Shutting down Terminal Mode...');
        inputLineEl.style.visibility = 'hidden';
        setTimeout(deactivateTerminal, 700);
    }

    function printLine(text, className) {
        const line = document.createElement('div');
        line.className = 'terminal-line' + (className ? ' ' + className : '');
        line.textContent = (text === undefined || text === null) ? '' : text;
        outputEl.appendChild(line);
        scrollToBottom();
        return line;
    }
    function printHeading(text) {
        printLine(text, 'terminal-heading');
        printLine('='.repeat(text.length), 'terminal-heading');
        printLine('');
    }
    function scrollToBottom() {
        if (terminalEl) terminalEl.scrollTop = terminalEl.scrollHeight;
    }
})();