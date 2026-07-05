import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';
import path from 'node:path';

export default defineConfig([
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

                            /** @param {string} line */
                            function isBlankStarLine(line) {
                                return /^\s*\*\s*$/.test(line);
                            }

                            /** @param {string} line */
                            function isMissingSpaceAfterStar(line) {
                                // Matches lines like: " *text" or "\t*text" but NOT " * text" and NOT a blank star line.
                                return /^\s*\*\S/.test(line);
                            }

                            return {
                                Program() {
                                    const comments =
                                        sourceCode.getAllComments();
                                    for (const c of comments) {
                                        if (c.type !== 'Block') continue;

                                        const raw = sourceCode.getText(c);

                                        // Only enforce for multi-line block comments.
                                        if (!raw.includes('\n')) continue;

                                        // Enforce `/**` instead of `/*` for multi-line doc-style blocks.
                                        if (
                                            raw.startsWith('/*') &&
                                            !raw.startsWith('/**')
                                        ) {
                                            context.report({
                                                loc: c.loc,
                                                messageId: 'useJsdoc',
                                                fix(fixer) {
                                                    // Turn `/*` into `/**` by inserting one `*` after `/`.
                                                    return fixer.insertTextAfterRange(
                                                        [
                                                            c.range[0],
                                                            c.range[0] + 1,
                                                        ],
                                                        '*'
                                                    );
                                                },
                                            });
                                            continue;
                                        }

                                        // Enforce no blank padding lines at start/end of JSDoc blocks.
                                        if (raw.startsWith('/**')) {
                                            const lines = raw.split('\n');
                                            // lines[0] is `/**` (possibly with trailing text, but in our style it should not).
                                            // last line is `*/` (possibly prefixed with spaces).

                                            if (lines.length >= 3) {
                                                const firstInner =
                                                    lines[1].replace(/\r$/, '');
                                                const lastInner = lines[
                                                    lines.length - 2
                                                ].replace(/\r$/, '');

                                                // Enforce `* text` spacing: disallow `*text` on non-empty lines.
                                                for (
                                                    let i = 1;
                                                    i < lines.length - 1;
                                                    i++
                                                ) {
                                                    const line = lines[
                                                        i
                                                    ].replace(/\r$/, '');

                                                    if (isBlankStarLine(line))
                                                        continue;
                                                    if (
                                                        !isMissingSpaceAfterStar(
                                                            line
                                                        )
                                                    )
                                                        continue;

                                                    context.report({
                                                        loc: c.loc,
                                                        messageId:
                                                            'missingSpaceAfterStar',
                                                        fix(fixer) {
                                                            // Insert a single space after the first `*` on this line.
                                                            const updated = [
                                                                ...lines,
                                                            ];
                                                            updated[i] =
                                                                updated[
                                                                    i
                                                                ].replace(
                                                                    /^(\s*\*)/,
                                                                    '$1 '
                                                                );
                                                            return fixer.replaceTextRange(
                                                                c.range,
                                                                updated.join(
                                                                    '\n'
                                                                )
                                                            );
                                                        },
                                                    });

                                                    // Avoid multiple overlapping fixes on the same comment in one pass.
                                                    break;
                                                }

                                                if (
                                                    isBlankStarLine(firstInner)
                                                ) {
                                                    context.report({
                                                        loc: c.loc,
                                                        messageId:
                                                            'noLeadingBlank',
                                                        fix(fixer) {
                                                            // Remove the first inner blank `*` line (including its newline)
                                                            const start =
                                                                c.range[0];
                                                            const text =
                                                                sourceCode.getText(
                                                                    c
                                                                );
                                                            const lines =
                                                                text.split(
                                                                    '\n'
                                                                );

                                                            // Rebuild without the first inner line
                                                            const rebuilt = [
                                                                lines[0],
                                                                ...lines.slice(
                                                                    2
                                                                ),
                                                            ].join('\n');
                                                            return fixer.replaceTextRange(
                                                                c.range,
                                                                rebuilt
                                                            );
                                                        },
                                                    });
                                                }

                                                if (
                                                    isBlankStarLine(lastInner)
                                                ) {
                                                    context.report({
                                                        loc: c.loc,
                                                        messageId:
                                                            'noTrailingBlank',
                                                        fix(fixer) {
                                                            // Remove the last inner blank `*` line (right before `*/`)
                                                            const text =
                                                                sourceCode.getText(
                                                                    c
                                                                );
                                                            const lines =
                                                                text.split(
                                                                    '\n'
                                                                );

                                                            // Rebuild without the last inner line
                                                            const rebuilt = [
                                                                ...lines.slice(
                                                                    0,
                                                                    lines.length -
                                                                        2
                                                                ),
                                                                lines[
                                                                    lines.length -
                                                                        1
                                                                ],
                                                            ].join('\n');

                                                            return fixer.replaceTextRange(
                                                                c.range,
                                                                rebuilt
                                                            );
                                                        },
                                                    });
                                                }
                                            }
                                        }
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
