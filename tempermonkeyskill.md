# ADP Tampermonkey Automation Skill & Learnings

## Summary of the Challenge
Automating element selection in ADP Workforce Now (and similar Angular/React/Vue-based enterprise applications) is notoriously difficult due to several critical UI quirks:
1. **Angular Event Listeners**: Standard JavaScript `.click()` completely fails on most actionable elements because Angular listens for specific pointer events (like `pointerdown`/`mousedown`) or relies on directives like `data-ng-dblclick` placed on parent wrappers.
2. **Hidden Tooltip Traps**: Visible labels often contain hidden child `<div>`s containing extensive tooltips or file paths. Standard `.textContent` bundles all this hidden garbage together, ruining length checks and string matching.
3. **Dynamic DOM Structures**: IDs and nested classes frequently change or act inconsistently. 
4. **Prefix Collision**: Searching with `.indexOf()` creates collisions (e.g. searching for "Federal Tax" falsely matches "Federal Tax Percentage" because "Percentage" appears first in the DOM).

---

## What to Ask the User First
If a new agent takes over, or if you are automating a different section of ADP, **do not guess the DOM**. Ask the user these specific questions before writing code:

1. **"Please provide the raw Outer HTML:"** Ask the user to right-click the exact item they are trying to interact with on the screen, choose "Inspect", right-click the highlighted code in the DevTools, select `Copy > Copy outerHTML`, and paste it. 
2. **"Look for `data-ng-click` or `data-ng-dblclick`:"** Ask the user to confirm if there are any angular binding attributes in the parent wrapper of the button they want clicked.
3. **"What is the exact visible text?"** Ensure the text they want to match is verbatim what appears visibly on the screen, noting any brackets like `(Personal Profile)`.

---

## The Implementation Strategy (Best Practices)

### 1. Robust Event Dispatching (The "Simulate Click" Engine)
Never rely just on `.click()`. You must synthesize the full event lifecycle:
```javascript
function simulateClick(element) {
    if (!element) return;
    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(function(eventType) {
        try {
            var evt = new MouseEvent(eventType, { bubbles: true, cancelable: true, view: window, button: 0, buttons: 1 });
            element.dispatchEvent(evt);
        } catch(e) {}
    });
    try { element.click(); } catch(e) {}
}
```

### 2. Double-Click Fallbacks
If clicking the "Add" icon `<i>` or `<button>` fails, fallback to double-clicking the parent container if it has a listener.
```javascript
function simulateDblClick(element) {
    if (!element) return;
    try {
        var evt = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window, button: 0, buttons: 1 });
        element.dispatchEvent(evt);
    } catch(e) {}
}
```

### 3. Extracting Pure Text (Avoiding Tooltip Traps)
Enterprise apps nest hidden help text inside the label (e.g., `<div class="field-label-truncate">Name <div class="hidden-tooltip">Path: ABC > DEF</div></div>`). Doing `el.textContent` will combine all text. Explicitly target the first text node:
```javascript
var txt = '';
// el.childNodes[0].nodeType === 3 means it's a pure Text Node
if (el.childNodes.length > 0 && el.childNodes[0].nodeType === 3) {
    txt = el.childNodes[0].textContent.toLowerCase().trim();
} else {
    txt = el.textContent.toLowerCase().trim();
}
```

### 4. Visibility Checks before Interaction
Only process elements that are actually painted on the screen. `getBoundingClientRect()` filters out structurally loaded but visually hidden components.
```javascript
var rect = el.getBoundingClientRect();
if (rect.width === 0 || rect.height === 0) continue; // Skip hidden elements
```

### 5. Prioritize Exact Matches Over Prefix Matches
When iterating over labels, matching by `.indexOf()` or `.includes()` can cause earlier fields with appended words (e.g. "Federal Tax Percentage") to accidentally trigger when searching for just "Federal Tax". 
**Solution:** Loop through candidate elements to find an **exact match** first (`txt === cleanTarget`). Store partial/prefix matches in a temporary fallback variable `bestMatchContainer`, and only use them if the exact match fails.

### 6. Aggressive Modal Killing
Unexpected dialogue popups (like timeouts or validation warnings) block background scripts from clicking the DOM. Periodically clear them by synthesizing an `Escape` keypress, along with searching for modal "Close" icons.
```javascript
document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
```
