// ==UserScript==
// @name         ADP Multi-Mode Assistant v8
// @namespace    http://tampermonkey.net/
// @version      8.8
// @description  Multi-Mode Assistant with bracket-friendly name matching
// @author       Antigravity
// @match        https://workforcenow.adp.com/theme/admin.html*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('ADP Multi-Mode Assistant v9.2 loaded.');

    var SIT_FIT_COLUMNS = [
        "Associate ID (Employment Profile)",
        "Legal First Name (Personal Profile)",
        "Legal Last Name (Personal Profile)",
        "Legal Middle Name (Personal Profile)",
        "Salutation (Personal Profile)",
        "Do Not Calculate Federal Income Tax (Tax Withholdings)",
        "Do Not Calculate Federal Taxable (Tax Withholdings)",
        "Federal/W4 Additional Tax Type Description (Tax Withholdings)",
        "Federal Additional Tax Amount Percentage (Tax Withholdings)",
        "Federal Additional Tax Amount (Tax Withholdings)",
        "Federal/W4 Exemptions (Tax Withholdings)",
        "Federal/W4 Marital Status Description (Tax Withholdings)",
        "Federal/W4 Effective Date (Tax Withholdings)",
        "Federal/W4 Effective End Date (Tax Withholdings)",
        "Dependents (Tax Withholdings)",
        "Deductions (Tax Withholdings)",
        "Multiple Jobs indicator (Tax Withholdings)",
        "Other Income (Tax Withholdings)",
        "Non-Resident Alien (Tax Withholdings)",
        "Do not calculate Medicare (Tax Withholdings)",
        "Do not calculate Social Security (Tax Withholdings)",
        "Do not calculate State Tax (Tax Withholdings)",
        "Do not calculate State Taxable (Tax Withholdings)",
        "Lived In State Tax Code",
        "State Tax Code (Tax Withholdings)",
        "State Tax Description (Tax Withholdings)",
        "State Marital Status Code (Tax Withholdings)",
        "State Marital Status Description (Tax Withholdings)",
        "State Exemptions/Allowances (Tax Withholdings)",
        "Exemptions in Dollars (Tax Withholdings)",
        "State Additional Tax Type Description (Tax Withholdings)",
        "State Additional Tax Amount (Tax Withholdings)",
        "State Additional Tax Amount Percentage (Tax Withholdings)",
        "Household employee (Tax Withholdings)",
        "Itemized Deduction Allowance (Tax Withholdings)",
        "Itemized Deductions (Tax Withholdings)",
        "MD County Code (Tax Withholdings)",
        "Medical Leave Insurance",
        "NJ Tax Table (Tax Withholdings)",
        "ND Actual # of Dependents",
        "Parental Leave Insurance",
        "Family Leave Insurance",
        "Do not calculate SUI/SDI Tax (Tax Withholdings)",
        "Do not calculate Washington Cares Fund Tax (Tax Withholdings)",
        "Do not calculate workers compensation (Tax Withholdings)",
        "Do not calculate family leave insurance (FLI) tax (Tax Withholdings)",
        "CT Filing Status (Tax Withholdings)",
        "# of Dependent Children (Personal Profile)",
        "Primary Address: County (Personal Profile)",
        "Lived in State Code (Tax Withholdings)",
        "Lived in State Description (Tax Withholdings)",
        "Worked in State Code (Tax Withholding)",
        "Worked in State Description (Tax Withholding)"
    ];

    var CENSUS_COLUMNS = [
        "Legal First Name (Personal Profile)",
        "Legal Middle Name (Personal Profile)",
        "Legal Last Name (Personal Profile)",
        "Generation Suffix Code (Personal Profile)",
        "Generation Suffix Description (Personal Profile)",
        "Associate ID (Employment Profile)",
        "Position ID (Employment Profile)",
        "Birth Date (Personal Profile)",
        "Tax ID (SSN) (Personal Profile)",
        "Hire Date (Employment Profile)",
        "Hire/Rehire Date (Employment Profile)",
        "Termination Date (Employment Profile)",
        "Termination Reason Code (Employment Profile)",
        "Termination Reason Description (Employment Profile)",
        "Tobacco User (Personal Profile)",
        "Sex (Personal Profile)",
        "Gender / Sex (Self-ID) (Personal Profile)",
        "Marital Status Code (Personal Profile)",
        "Marital Status Description (Personal Profile)",
        "FLSA Description (Employment Profile)",
        "FLSA Code (Employment Profile)",
        "Worker category description (Employment Profile)",
        "Annual Salary (Employment Profile - Pay Rates)",
        "Job Title Description (Employment Profile)",
        "Position Start Date (Employment Profile)",
        "Reports To Associate ID (Employment Profile)",
        "EEOC Job Classification (Employment Profile)",
        "Race Description (Personal Profile)",
        "Primary Address: Address Line 1 (Personal Profile)",
        "Primary Address: Address Line 2 (Personal Profile)",
        "Primary Address: Address Line 3 (Personal Profile)",
        "Primary Address: City (Personal Profile)",
        "Primary Address: Country Code (Personal Profile)",
        "Primary Address: Country (Personal Profile)",
        "Primary Address: County (Personal Profile)",
        "Primary Address: State / Territory Code (Personal Profile)",
        "Primary Address: State / Territory Description (Personal Profile)",
        "Primary Address: Zip / Postal Code (Personal Profile)",
        "Personal Contact: Personal Email (Personal Profile)",
        "Protected Veteran Status (Statutory Compliance)",
        "Disabled Veteran (Statutory Compliance)",
        "Work Address: Address Line 1 (Personal Profile)",
        "Work Address: Address Line 2 (Personal Profile)",
        "Work Address: City (Personal Profile)",
        "Work Address: State / Territory Code (Personal Profile)",
        "Work Address: Zip / Postal Code (Personal Profile)",
        "Location Description (Employment Profile)",
        "SOC Code (Tax Withholdings)",
        "SOC Description (Tax Withholdings)",
        "Compensation Information",
        "Pay Frequency (Employment Profile - Pay Rates)",
        "Payroll Name (Personal Profile)",
        "Standard Hours (Employment Profile - Pay Rates)",
        "# of Dependents (Personal Profile)",
        "Work Contact: Work Email (Personal Profile)",
        "Regular Pay Rate Code (Employment Profile - Pay Rates)",
        "Regular Pay Rate Description (Employment Profile - Pay Rates)",
        "Regular Pay Rate",
        "Position Status (Employment Profile)",
        "NAICS Workers' Comp Code (Employment Profile)",
        "NAICS Workers' Comp Description (Employment Profile)",
        "NAICS Workers' Comp",
        "Legal / Preferred Address: Address Line 1 (Personal Profile)",
        "Legal / Preferred Address: Address Line 2 (Personal Profile)",
        "Legal / Preferred Address: City (Personal Profile)",
        "Legal / Preferred Address: Zip / Postal Code (Personal Profile)",
        "Legal / Preferred Address: State / Territory Code (Personal Profile)",
        "Pronouns (Personal Profile)"
    ];

    var corrections = {
        "CT Filing Status (Tax Withholdings)": "CT Filing Status",
        "Tax ID (SSN) (Personal Profile)": "Tax ID",
        "Sex (Personal Profile)": "Sex",
        "Gender / Sex (Self-ID) (Personal Profile)": "Gender / Sex",
        "Annual Salary (Employment Profile - Pay Rates)": "Annual Salary",
        "Reports To Associate ID (Employment Profile)": "Reports To"
    };

    var activeColumns = [];
    var currentIndex = 0;
    var isRunning = false;
    var failedFields = [];

    // UI Panel Setup
    var wrapper = document.createElement('div');
    wrapper.id = 'adp-multi-panel';
    wrapper.style.cssText = 'position:fixed;top:80px;right:20px;z-index:9999;background:#fff;border:2px solid #0056b3;padding:15px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.2);font-family:Arial,sans-serif;width:240px;display:none;';

    var title = document.createElement('h4');
    title.style.cssText = 'margin:0 0 5px;color:#0056b3;text-align:center;';
    title.textContent = 'ADP Assistant v9.2';

    var statusDiv = document.createElement('div');
    statusDiv.style.cssText = 'font-size:12px;margin-bottom:10px;font-weight:bold;text-align:center;';
    statusDiv.textContent = 'Status: Ready';

    var logDiv = document.createElement('div');
    logDiv.style.cssText = 'font-size:11px;max-height:80px;overflow-y:auto;border:1px solid #eee;padding:5px;margin-bottom:10px;background:#f9f9f9;line-height:1.3;';
    logDiv.textContent = 'Ready for selection...';

    var sitFitBtn = document.createElement('button');
    sitFitBtn.style.cssText = 'width:100%;background:#0056b3;color:white;border:none;padding:8px;border-radius:4px;cursor:pointer;font-weight:bold;margin-bottom:5px;';
    sitFitBtn.textContent = 'Select SIT / FIT (53)';

    var censusBtn = document.createElement('button');
    censusBtn.style.cssText = 'width:100%;background:#28a745;color:white;border:none;padding:8px;border-radius:4px;cursor:pointer;font-weight:bold;';
    censusBtn.textContent = 'Select Census (67)';

    var progressBar = document.createElement('div');
    progressBar.style.cssText = 'width:0%;height:6px;background:#0056b3;transition:width 0.3s;margin-top:10px;border-radius:3px;';

    wrapper.appendChild(title);
    wrapper.appendChild(statusDiv);
    wrapper.appendChild(logDiv);
    wrapper.appendChild(sitFitBtn);
    wrapper.appendChild(censusBtn);
    wrapper.appendChild(progressBar);
    document.body.appendChild(wrapper);

    function checkVisibility() {
        var searchInput = document.querySelector('input[name="search"].adpr-search-input');
        if (searchInput) {
            wrapper.style.display = 'block';
        } else {
            wrapper.style.display = 'none';
        }
    }
    setInterval(checkVisibility, 2000);
    checkVisibility();

    function triggerSearch(text) {
        var searchInput = document.querySelector('input[name="search"].adpr-search-input');
        if (searchInput) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            searchInput.value = text;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            searchInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

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

    function simulateDblClick(element) {
        if (!element) return;
        try {
            var evt = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window, button: 0, buttons: 1 });
            element.dispatchEvent(evt);
        } catch(e) {}
    }

    function findAndClick(targetName) {
        var cleanTarget = targetName.toLowerCase().trim();
        if (corrections[targetName]) {
            cleanTarget = corrections[targetName].toLowerCase().trim();
        }
        var baseTarget = cleanTarget.split(' (')[0].trim();

        // Based on user HTML: <div class="field-label-truncate">Salutation (Personal Profile)...</div>
        var labels = document.querySelectorAll('.field-label-truncate, .adpr-column-label, span.field-label, span[data-ng-bind]');
        var bestMatchContainer = null;
        
        for (var i = 0; i < labels.length; i++) {
            var el = labels[i];
            
            var rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue; // Skip hidden elements

            // Try to extract only the top-level text to ignore tooltip fluff
            var txt = '';
            if (el.childNodes.length > 0 && el.childNodes[0].nodeType === 3) {
                txt = el.childNodes[0].textContent.toLowerCase().trim();
            } else {
                txt = el.textContent.toLowerCase().trim();
            }
            var fullTxt = (el.textContent || '').toLowerCase().trim().replace(/\s+/g, ' ');

            if (txt === cleanTarget || txt === baseTarget) {
                // Exact match found!
                var container = el.closest('.field-item-wrapper, .field-item, .adpr-column-row, .list-group-item, li[data-ng-repeat], div[role="row"]');
                if (!container) container = el.parentElement;
                
                var alreadyAdded = container.querySelector('.fa-check, .fa-minus-circle, [data-pendo-id="PENDO_ADPR_CANVAS_REMOVE_FIELD"], .icon-check, i[class*="check"]');
                if (alreadyAdded) return true; // Already selected!

                var addBtn = container.querySelector('.fa-plus-circle, .fa-plus, .icon-plus, .icon-add, [data-pendo-id="PENDO_ADPR_CANVAS_ADD_FIELD"], i[class*="plus"]');
                if (addBtn) {
                    simulateClick(addBtn);
                    return true;
                }

                // Fallback: the wrapper itself might have a double click listener
                var dblClickContainer = container.closest('[data-ng-dblclick]') || (container.getAttribute('data-ng-dblclick') ? container : null);
                if (dblClickContainer) {
                    simulateDblClick(dblClickContainer);
                    return true;
                }

                simulateClick(container);
                return true;
            } else if (!bestMatchContainer && (txt.indexOf(baseTarget) === 0 || fullTxt.indexOf(cleanTarget) === 0 || fullTxt.indexOf(baseTarget) === 0)) {
                var c = el.closest('.field-item-wrapper, .field-item, .adpr-column-row, .list-group-item, li[data-ng-repeat], div[role="row"]');
                if (!c) c = el.parentElement;
                bestMatchContainer = c;
            }
        }

        // If no exact match, use the partial match
        if (bestMatchContainer) {
            var alreadyAddedPartial = bestMatchContainer.querySelector('.fa-check, .fa-minus-circle, [data-pendo-id="PENDO_ADPR_CANVAS_REMOVE_FIELD"], .icon-check, i[class*="check"]');
            if (alreadyAddedPartial) return true;

            var addBtnPartial = bestMatchContainer.querySelector('.fa-plus-circle, .fa-plus, .icon-plus, .icon-add, [data-pendo-id="PENDO_ADPR_CANVAS_ADD_FIELD"], i[class*="plus"]');
            if (addBtnPartial) {
                simulateClick(addBtnPartial);
                return true;
            }

            var dblClickContainerPartial = bestMatchContainer.closest('[data-ng-dblclick]') || (bestMatchContainer.getAttribute('data-ng-dblclick') ? bestMatchContainer : null);
            if (dblClickContainerPartial) {
                simulateDblClick(dblClickContainerPartial);
                return true;
            }
            simulateClick(bestMatchContainer);
            return true;
        }
        
        // Failsafe for general spans/divs without expected classes
        var fallbackEls = document.querySelectorAll('span, div, label, td, a');
        for (var j = 0; j < fallbackEls.length; j++) {
            var fEl = fallbackEls[j];
            var fRect = fEl.getBoundingClientRect();
            if (fRect.width === 0 || fRect.height === 0) continue;
            
            var fTxt = (fEl.textContent || '').toLowerCase().trim().replace(/\s+/g, ' ');
            if (fTxt.length > 0 && fTxt.length < 150 && (fTxt === cleanTarget || fTxt === baseTarget)) {
                 var fContainer = fEl.closest('.field-item-wrapper, .field-item, .adpr-column-row') || fEl.parentElement;
                 var fAddBtn = fContainer.querySelector('.fa-plus-circle, .fa-plus, [data-pendo-id="PENDO_ADPR_CANVAS_ADD_FIELD"]');
                 if (fAddBtn) {
                     simulateClick(fAddBtn);
                     return true; 
                 }
            }
        }

        return false;
    }

    function detectAndCloseModal() {
        var modal = document.querySelector('.adp-modal, .modal-dialog, [role="dialog"], .dijitDialog');
        if (modal) {
            console.log('Modal detected... attempting to force close.');
            var buttons = modal.querySelectorAll('button, a, i, span');
            for (var b = 0; b < buttons.length; b++) {
                var btn = buttons[b];
                var txt = (btn.textContent || '').toLowerCase().trim();
                var aria = (btn.getAttribute('aria-label') || '').toLowerCase();
                var cls = (btn.getAttribute('class') || '').toLowerCase();
                
                if (txt === 'cancel' || txt === 'close' || aria.indexOf('close') !== -1 || cls.indexOf('close') !== -1 || cls.indexOf('times') !== -1) {
                    simulateClick(btn);
                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
                    return true;
                }
            }
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
        }
        return false;
    }

    function processNext() {
        if (!isRunning || currentIndex >= activeColumns.length) {
            isRunning = false;
            statusDiv.textContent = 'Status: Complete!';
            statusDiv.style.color = '#28a745';
            sitFitBtn.disabled = false;
            censusBtn.disabled = false;
            if (failedFields.length > 0) {
                logDiv.innerHTML = '<span style="color:red;font-weight:bold;">MISSING FIELDS:</span><br>' + failedFields.join('<br>');
            } else {
                logDiv.innerHTML = '<span style="color:green;font-weight:bold;">All selected successfully!</span>';
            }
            return;
        }

        var col = activeColumns[currentIndex];
        statusDiv.textContent = 'Processing (' + (currentIndex + 1) + '/' + activeColumns.length + ')';
        logDiv.innerHTML = '<span style="color:black">Searching:<br>' + col + '</span>';
        progressBar.style.width = Math.round(((currentIndex + 1) / activeColumns.length) * 100) + '%';

        var searchTerm = corrections[col] || col.split(' (')[0];
        triggerSearch(searchTerm);

        var attempts = 0;
        var maxAttempts = 10;

        function tryFind() {
            detectAndCloseModal();
            
            var success = findAndClick(col);
            if (success) {
                logDiv.innerHTML = '<span style="color:green;font-weight:bold;">Added successfully:</span><br>' + col;
                currentIndex++;
                setTimeout(processNext, 800);
            } else {
                attempts++;
                if (attempts < maxAttempts) {
                    if (attempts === 5) triggerSearch(searchTerm); 
                    setTimeout(tryFind, 500);
                } else {
                    failedFields.push(col);
                    logDiv.innerHTML = '<span style="color:red;font-weight:bold;">FAILED to click:</span><br>' + col;
                    currentIndex++;
                    setTimeout(processNext, 800);
                }
            }
        }

        setTimeout(tryFind, 800);
    }

    function startRun(cols, type) {
        if (isRunning) return;
        isRunning = true;
        activeColumns = cols;
        currentIndex = 0;
        failedFields = [];
        progressBar.style.width = '0%';
        progressBar.style.background = (type === 'census' ? '#28a745' : '#0056b3');
        sitFitBtn.disabled = true;
        censusBtn.disabled = true;
        logDiv.style.color = 'black';
        logDiv.textContent = 'Starting...';
        processNext();
    }

    sitFitBtn.addEventListener('click', function() {
        startRun(SIT_FIT_COLUMNS, 'sitfit');
    });

    censusBtn.addEventListener('click', function() {
        startRun(CENSUS_COLUMNS, 'census');
    });
})();
