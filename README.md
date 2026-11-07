# MindArena

A responsive, browser-based quiz platform built with HTML, CSS and vanilla JavaScript.

## Run
1. Extract the ZIP.
2. Open `index.html` in a modern browser.
3. Choose IQ & Brain, Personality, or General Knowledge.
4. Complete the 20-question attempt and view the result.

No backend, package installation, or build step is required. Google Fonts are loaded online; system fallbacks are included.

## Included
- 60 IQ-style reasoning questions and 60 General Knowledge questions. Each attempt draws a random 20 and shuffles their order and the A–D options.
- 60 personality reflection questions (15 per trait). Each attempt draws 5 per trait so the four-dimension snapshot stays balanced.
- Four options per question, question map, previous/next navigation, progress, timer for IQ/GK (30 seconds per question, 10 minutes total), answer review, retake and share.
- Dark/light theme toggle and responsive mobile layout.
- Recent attempt summaries saved locally in browser storage.

## Notes
- The IQ section is an informal reasoning quiz, not a clinically or psychometrically validated IQ assessment.
- Personality output is a lightweight reflection snapshot, not a psychological diagnosis or validated personality instrument.
- Questions are stored in `js/questions.js`. Add questions using the same object shape and keep at least as many as `PER_TEST` (20) in each category. The question count and time per question are set at the top of `js/app.js` (`PER_TEST`, `SECONDS_PER_QUESTION`); the total time is calculated from them. The more you add, the more each attempt varies. For personality, add a similar number to each `dimension`.
