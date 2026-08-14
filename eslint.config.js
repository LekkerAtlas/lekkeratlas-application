import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import stylistic from '@stylistic/eslint-plugin';
import path from 'node:path';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import { fileURLToPath } from 'node:url';

const prettierIgnorePath = fileURLToPath(
    new URL('.prettierignore', import.meta.url)
);

/** @param {string} line */
function isBlankStarLine(line) {
    return /^\s*\*\s*$/.test(line);
}

/** @param {string} line */
function isMissingSpaceAfterStar(line) {
    return /^\s*\*\S/.test(line);
}

function reportUseJsdoc(context, comment) {
    context.report({
        loc: comment.loc,
        messageId: 'useJsdoc',
        fix(fixer) {
            return fixer.insertTextAfterRange(
                [comment.range[0], comment.range[0] + 1],
                '*'
            );
        },
    });
}

function findMissingSpaceLineIndex(lines) {
    return lines.findIndex((line, index) => {
        if (index === 0 || index === lines.length - 1) {
            return false;
        }

        const normalizedLine = line.replace(/\r$/, '');

        return (
            !isBlankStarLine(normalizedLine) &&
            isMissingSpaceAfterStar(normalizedLine)
        );
    });
}

function reportMissingSpaceAfterStar(context, comment, lines) {
    const lineIndex = findMissingSpaceLineIndex(lines);

    if (lineIndex === -1) {
        return;
    }

    context.report({
        loc: comment.loc,
        messageId: 'missingSpaceAfterStar',
        fix(fixer) {
            const updatedLines = [...lines];
            updatedLines[lineIndex] = updatedLines[lineIndex].replace(
                /^(\s*\*)/,
                '$1 '
            );

            return fixer.replaceTextRange(
                comment.range,
                updatedLines.join('\n')
            );
        },
    });
}

function reportLeadingBlankLine(context, comment, lines) {
    const firstInnerLine = lines[1]?.replace(/\r$/, '');

    if (!firstInnerLine || !isBlankStarLine(firstInnerLine)) {
        return;
    }

    context.report({
        loc: comment.loc,
        messageId: 'noLeadingBlank',
        fix(fixer) {
            const rebuilt = [lines[0], ...lines.slice(2)].join('\n');

            return fixer.replaceTextRange(comment.range, rebuilt);
        },
    });
}

function reportTrailingBlankLine(context, comment, lines) {
    const lastInnerLine = lines.at(-2)?.replace(/\r$/, '');

    if (!lastInnerLine || !isBlankStarLine(lastInnerLine)) {
        return;
    }

    context.report({
        loc: comment.loc,
        messageId: 'noTrailingBlank',
        fix(fixer) {
            const rebuilt = [...lines.slice(0, -2), lines.at(-1)].join('\n');

            return fixer.replaceTextRange(comment.range, rebuilt);
        },
    });
}

function inspectDocumentationComment(context, sourceCode, comment) {
    if (comment.type !== 'Block') {
        return;
    }

    const raw = sourceCode.getText(comment);

    if (!raw.includes('\n')) {
        return;
    }

    if (raw.startsWith('/*') && !raw.startsWith('/**')) {
        reportUseJsdoc(context, comment);
        return;
    }

    if (!raw.startsWith('/**')) {
        return;
    }

    const lines = raw.split('\n');

    if (lines.length < 3) {
        return;
    }

    reportMissingSpaceAfterStar(context, comment, lines);
    reportLeadingBlankLine(context, comment, lines);
    reportTrailingBlankLine(context, comment, lines);
}

export default defineConfig([
    includeIgnoreFile(prettierIgnorePath),
    { ignores: ['dist'] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                /**
                 * We use the automatic React JSX runtime (tsconfig: "jsx": "react-jsx"),
                 * so React should NOT be treated as implicitly referenced by JSX.
                 * Without this, typescript-eslint will mark `React` as "used" in TSX files.
                 */
                jsxPragma: null,
                jsxFragmentName: null,
            },
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            import: importPlugin,
            jsdoc,
            '@stylistic': stylistic,
            // 'unused-imports': unusedImports,

            /**
             * Local project rules.
             * We keep them here to avoid introducing another package just for small style checks.
             */
            local: {
                rules: {
                    /**
                     * Enforce documentation block comments to use JSDoc-style /** ...
                     * disallow an empty `*` line immediately after `/**`
                     * - disallow an empty `*` line immediately before `*\/`
                     *
                     * Example (invalid):
                     * /**
                     *  *
                     *  *Text
                     *  *
                     *  *\/
                     *
                     * Example (valid):
                     * /**
                     *  *Text
                     *  *\/
                     */
                    'require-jsdoc-block': {
                        meta: {
                            type: 'layout',
                            docs: {
                                description:
                                    'Require `/** */` for multi-line block comments and disallow leading/trailing blank lines inside the doc block.',
                            },
                            fixable: 'code',
                            schema: [],
                            messages: {
                                useJsdoc:
                                    'Use `/** ... */` for multi-line documentation comments (not `/* ... */`).',
                                noLeadingBlank:
                                    'Do not leave a blank `*` line immediately after `/**`.',
                                noTrailingBlank:
                                    'Do not leave a blank `*` line immediately before `*/`.',
                                missingSpaceAfterStar:
                                    'Add a space after `*` in JSDoc lines (use `* text`, not `*text`).',
                            },
                        },
                        create(context) {
                            const sourceCode = context.sourceCode;

                            return {
                                Program() {
                                    for (const comment of sourceCode.getAllComments()) {
                                        inspectDocumentationComment(
                                            context,
                                            sourceCode,
                                            comment
                                        );
                                    }
                                },
                            };
                        },
                    },
                    'prefer-alias-imports': {
                        meta: {
                            type: 'suggestion',
                            docs: {
                                description:
                                    'Disallow parent-relative imports and automatically rewrite them to the `@/` alias.',
                            },
                            fixable: 'code',
                            schema: [],
                            messages: {
                                useAliasImport:
                                    'Relative imports from parent directories are not allowed. Use the `@/` alias for anything outside the current folder.',
                            },
                        },
                        create(context) {
                            return {
                                ImportDeclaration(node) {
                                    const importSource = node.source.value;
                                    if (typeof importSource !== 'string')
                                        return;
                                    if (!importSource.startsWith('../')) return;

                                    const currentFilePath = context.filename;
                                    if (
                                        !currentFilePath ||
                                        currentFilePath === '<input>'
                                    )
                                        return;

                                    const currentDir =
                                        path.dirname(currentFilePath);
                                    const resolvedTarget = path.resolve(
                                        currentDir,
                                        importSource
                                    );
                                    const srcRoot = path.resolve(
                                        process.cwd(),
                                        'src'
                                    );
                                    const relativeToSrc = path.relative(
                                        srcRoot,
                                        resolvedTarget
                                    );

                                    /**
                                     * Only rewrite imports that actually resolve to something inside `src`.
                                     * If the import points outside `src`, do not try to auto-fix it.
                                     */
                                    if (
                                        relativeToSrc.startsWith('..') ||
                                        path.isAbsolute(relativeToSrc)
                                    ) {
                                        context.report({
                                            node: node.source,
                                            messageId: 'useAliasImport',
                                        });
                                        return;
                                    }

                                    const normalizedRelativeToSrc =
                                        relativeToSrc.split(path.sep).join('/');
                                    const fixedSource = `@/${normalizedRelativeToSrc}`;

                                    context.report({
                                        node: node.source,
                                        messageId: 'useAliasImport',
                                        fix(fixer) {
                                            return fixer.replaceText(
                                                node.source,
                                                `'${fixedSource}'`
                                            );
                                        },
                                    });
                                },
                            };
                        },
                    },
                },
            },
        },
        settings: {
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: './tsconfig.app.json',
                },
            },
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            'import/no-unresolved': [
                'error',
                { caseSensitive: true, caseSensitiveStrict: true },
            ],

            /**
             * Force alias-based imports for anything outside the current folder.
             * `./foo` stays allowed for same-directory imports, but parent imports like `../foo` are disallowed.
             * Imports using the `@/` alias remain allowed, and parent-relative imports can be auto-fixed.
             */
            'local/prefer-alias-imports': 'error',

            // Disallow blank lines at the start of a file
            'no-multiple-empty-lines': [
                'error',
                { max: 1, maxBOF: 0, maxEOF: 1 },
            ],

            // Enforce double quotes in TS/TSX
            quotes: ['error', 'single', { avoidEscape: true }],
            'jsx-quotes': ['error', 'prefer-double'],

            // Enforce starred block style (kills: /*\nText\n*/ and /*\n\nText\n\n*/ etc.)
            // (ESLint core version is deprecated; stylistic replacement recommended.)  [oai_citation:2‡ESLint](https://eslint.org/docs/latest/rules/multiline-comment-style)
            '@stylistic/multiline-comment-style': ['error', 'starred-block'],

            // Ensure JSDoc lines have the asterisk prefix and consistent formatting
            'jsdoc/require-asterisk-prefix': 'error',
            'jsdoc/check-line-alignment': 'error',

            // Prevent “empty/whitespace-only” JSDoc blocks
            'jsdoc/no-blank-blocks': 'off',
            'jsdoc/no-multi-asterisks': 'error',
            'jsdoc/tag-lines': 'off',
            'jsdoc/require-description': 'error',

            /**
             * This is the one that targets extra blank lines in the JSDoc “description” area,
             * i.e. the part before any tags.  [oai_citation:3‡npm](https://www.npmjs.com/package/eslint-plugin-jsdoc?ref=hackernoon.com&utm_source=chatgpt.com)
             */
            'jsdoc/no-blank-block-descriptions': 'off',

            // Enforce `/** ... */` and no blank padding lines at the start/end of doc blocks
            'local/require-jsdoc-block': 'error',
        },
    },
]);
