# English Practice

A static, responsive CPE English workbook. No framework, build process, server, account, or paid service is required. All exercise content and accepted answers live in unit JSON files.

## Publish on GitHub Pages

1. Create a GitHub repository and upload the **contents** of this folder, keeping the folders intact. `index.html` must be at the repository root.
2. Open **Settings → Pages**.
3. Either choose **Deploy from a branch**, select `main` and `/ (root)`, then Save; or choose **GitHub Actions** to use the included `.github/workflows/pages.yml` workflow and run it once from Actions. Do not enable both deployment methods.
4. Wait for deployment and open the URL GitHub provides, usually `https://YOUR-NAME.github.io/YOUR-REPOSITORY/`.

Everything uses relative URLs, so repository subpaths work. For the workflow, rename its `main` branch trigger if your default branch has another name. The workflow runs the included tests before deployment. No `npm install` is needed.

## Run locally

From this folder run `python3 -m http.server 8000`, then open `http://localhost:8000`. Use a web server: double-clicking `index.html` opens a `file://` URL and browsers generally block loading the unit JSON and ES modules that way.

## Practice

- Choose any of the 15 exercises in the sidebar. Numbered passage gaps correspond to the numbered answer fields below the passage.
- Type only the missing words; multiple blanks have separate fields. Multiple-choice questions use radio buttons.
- **Check** checks one question; **Check exercise** checks every question, including unanswered blanks. You can revise and check again. Wrong answers are not exposed automatically.
- **Show answer** displays all accepted key alternatives for the question. The question then earns no points until **Reset exercise**, even if you type the shown answer. Reset clears the entire exercise after confirmation.
- **Hide correct questions** focuses on questions that still need work. It hides only completely correct, checked questions.
- The progress bar counts filled blanks. The score counts correct, checked, unrevealed blanks against all blanks in the unit. Multiple-choice questions count as one blank each.
- Progress and imported units are saved in this browser's local storage. They do not sync across devices. Private browsing or clearing site data can remove them. **Export progress** downloads a backup containing all loaded units and answers; **Restore progress** replaces the current browser's practice data after confirmation.
- No answers are sent to a server. Unit files and answer keys are publicly readable if you host this repository publicly; this is a practice tool.

## Add a future unit using only one JSON file

1. Copy `units/unit-template.json`, edit its questions, and give it a unique `id` such as `unit-1b` or `unit-2a`. Save it as `unit-1b.json`.
2. Upload that single file to the repository's `units` folder. No HTML or JavaScript change is required.
3. In the app, select **Add a unit**, enter `unit-1b.json`, and click **Open unit**. The unit is then available in that browser's unit selector.

You can also open or share `https://YOUR-NAME.github.io/YOUR-REPOSITORY/?unit=unit-1b.json`. Each browser must open a new hosted unit once before it appears in its selector; static GitHub Pages cannot list a folder automatically. No manifest needs editing. **Import unit JSON** instead loads a local file into the current browser without uploading it to the repository.

An imported replacement with the same ID and changed content asks before clearing the previous progress. Use distinct IDs for different units. Updating a hosted JSON does not silently replace an already cached unit; reopen it via **Add a unit** or its `?unit=` link.

## Unit format

See `units/unit-template.json` for editable examples and `units/unit.schema.json` for the formal schema. Unit files must be valid JSON, with no comments or trailing commas.

```json
{
  "schemaVersion": 1,
  "id": "unit-2a",
  "title": "Grammar: Your topic",
  "subtitle": "Unit 2a",
  "exercises": [{
    "id": "1",
    "title": "Present tenses",
    "instructions": "Complete the sentence.",
    "questions": [{
      "id": "1",
      "prompt": "She {{1}} here and they {{2}} nearby.",
      "answers": [["lives"], ["work"]]
    }]
  }]
}
```

- Each unit needs `schemaVersion: 1`, a unique `id`, `title` and nonempty `exercises` array. IDs must be strings. Unit IDs allow letters, digits, `_` and `-`. Exercise IDs must be unique within a unit; question IDs within an exercise.
- Each exercise needs `id`, `title`, `instructions` and `questions`. Optional text fields: `example`, `passage`, `note`. Optional `wordBank`: an array of words. Use `[1]`, `[2]` etc. in passage text to reference question IDs, as in the supplied unit.
- Each question needs `id`, `prompt`, `answers`. Use exactly one `{{1}}` for the first blank, `{{2}}` for the second, etc. Each corresponding nested `answers` array contains accepted alternatives. Example: `[["has lived", "has been living"], ["works"]]` has two blanks. There must be at least one answer in each array. Do not use slashes to encode alternatives; use separate strings.
- Multiple choice adds `options`, an object such as `{"A":"works","B":"worked"}`. Use one `{{1}}` blank and answers such as `[["A"]]` (option keys, not option text).
- Transformations add `keyword`. Keep the source sentence and second sentence together in `prompt`, separated by `\n`. Accepted answers contain only the missing words.
- Content is rendered as plain text; HTML and executable instructions inside JSON are not executed. Import is validated before activation. Unit JSON is limited to 5 MB through file import and to 5,000 answer gaps.

## Answer checking and source notes

The included Unit 1a has **15 exercises, 130 numbered questions and 143 answer gaps**. Check `tests/content.test.js` for exact counts. All numbered exercises 1–15 from pages 7, 9 and 11–14 are transcribed, including the passages for exercises 3, 4, 6 and 10. Completed examples are shown but not scored. The supplied key's Unit 1b material is outside the attached exercise pages, so is not invented as an additional unit.

`references/worksheet.pdf` preserves the full original worksheet, including the reference tables on present, future and past tenses, stative verbs, used to/would, and structural conversion. `references/answer-key.pdf` preserves the supplied key.

Accepted alternatives follow the supplied key. Checking ignores case, repeated spaces, straight/curly apostrophes and trailing sentence punctuation. Common unambiguous contractions are expanded. In transformation answers, `he's`, `she's` and `it's` expand to `he has`, `she has` and `it has`, matching this unit's key. Ambiguous `'d` contractions are not expanded: add the exact contracted form as another accepted answer if a future unit needs it. Valid answers absent from the key may need another accepted string in the JSON.

Some printed transformation keys exceed the printed 3–8-word limit, especially exercise 13 questions 3–5 and exercise 15 question 1. The app flags this and uses the supplied key without enforcing the limit. It does not invent replacement answer keys or penalize the supplied answers. Contractions can also change a literal word count.

## Files and checks

- `index.html`, `styles.css`: interface and responsive styling.
- `app.js`: loading, navigation, local saving, import/export and interaction.
- `engine.js`: validation and answer comparison.
- `units/unit-1a.json`: complete exercise and answer data.
- `units/unit-template.json`: small teaching example for the next unit, not a transcription of Unit 1b.
- `units/unit.schema.json`: reusable JSON Schema for editors.
- `references/`: original PDFs for reference.
- `.github/workflows/pages.yml`: optional GitHub Pages deployment.
- `tests/`: dependency-free tests. Run `npm test` with Node.js 20+.

The app loads no external fonts, scripts, analytics or tracking. It works without an internet connection while a loaded page remains open, but reloading offline is not supported. Native text inputs, explicit labels, keyboard focus outlines, live answer feedback and a responsive layout support accessible practice.
