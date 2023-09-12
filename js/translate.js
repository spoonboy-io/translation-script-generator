// JavaScript to generate a translation script for use with Morpheus Option Lists
// Ollie Phillips




const jsonDataTextarea = document.getElementById('jsonData');
const generateCodeButton = document.getElementById('generateCode');
const generatedCode = document.getElementById('generatedCode');
const nameKeyInput = document.getElementById('nameKey');
const valueKeyInput = document.getElementById('valueKey');

const whereFieldInput = document.getElementById('whereField');
const conditionInput = document.getElementById('condition');
const whereValueInput = document.getElementById('whereValue');

const sampleJSON = document.getElementById("sampleJSON");
const clipboardCopy = document.getElementById("clipboardCopy");

// textarea change handler
jsonDataTextarea.addEventListener('blur', initControls);

// button click handler
generateCodeButton.addEventListener('click', generateTranslationScript);

sampleJSON.addEventListener('click', loadSampleJSON);
clipboardCopy.addEventListener('click', copyIt);

// bit of a fudge to make the key name readable
let tempParent = '';

// we parse the json and use the results to populate the controls and enable them
function initControls() {
    // clear this
    tempParent = '';

    // create the data
    const keyMap = {};
    generatedCode.textContent = "";
    try {
        // get the data from textarea
        const jsonData = JSON.parse(jsonDataTextarea.value);
        getKeyMap(jsonData, '', keyMap);
    } catch (error) {
        generatedCode.textContent = 'There was a problem: ' + error.message;
        disableControls()
        return;
    }

    // make options
    let options = ""
    for (const key in keyMap) {
        options += "<option value=\"" + keyMap[key] + "\">" + key + "</option>\n"
    }
    let options2 = "<option value=\"\">No Filter</option>\n" + options
    // set and enable form controls
    nameKeyInput.innerHTML = options;
    nameKeyInput.disabled = false;
    valueKeyInput.innerHTML = options;
    valueKeyInput.disabled = false;
    whereFieldInput.innerHTML = options2;
    whereFieldInput.disabled = false;
    conditionInput.disabled = false;
    whereValueInput.disabled = false;
    generateCodeButton.disabled = false;
}

// helper to reset stuff
function disableControls() {
    // set and enable form controls
    nameKeyInput.disabled = true;
    valueKeyInput.disabled = true;
    whereFieldInput.disabled = true;
    conditionInput.disabled = true;
    whereValueInput.disabled = true;
    generateCodeButton.disabled = true;
}

// generate translation script function does all the work
function generateTranslationScript() {
    // morpheus root object always data so set that
    let baseIterator = 'data.';
    let iterator = '';

    // we will set this and output them in the template
    let namePath = '';
    let valuePath = '';

    try {
        const jsonData = JSON.parse(jsonDataTextarea.value);
        let rootKey = isRootKey(jsonData);
        if (rootKey != null) {
            iterator = baseIterator + rootKey + '.';
        }

        namePath = nameKeyInput.value;
        valuePath = valueKeyInput.value;

    } catch (error) {
        generatedCode.textContent = 'There was a problem: ' + error.message;
    }

    let template = '';
    let comment = "// Morpheus Translation Script Generator\n// https://spoonboy.io/translation-script-generator/\n\n"
    if (whereFieldInput.value === "") {
        // simple template no filter
        // the output template, currently no if condition to filter
        template = `results = [];
for (let i = 0; i < ${iterator}length; i++){
    results.push({
        name : ${baseIterator}${namePath},
        value : ${baseIterator}${valuePath}
    })  
}`
    } else {
        // we need to wrap strings but leave input references
        let tempVal = whereValueInput.value;
        if (!tempVal.startsWith("input")) {
            tempVal = '"' + tempVal + '"';
        }
        template = `results = [];
for (let i = 0; i < ${iterator}length; i++){
    if( ${baseIterator}${whereFieldInput.value} ${conditionInput.value} ${tempVal} ) {
        results.push({
            name : ${baseIterator}${namePath},
            value : ${baseIterator}${valuePath}
        })  
    }
}`
    }
    generatedCode.innerHTML = comment + template;
}


// getKeyMap calls itself recursively to identify keys in the JSON which hold data
// and store them in an object with their object path
function getKeyMap(obj, parentPath = '', result = {}) {
    if (typeof obj !== "object" || obj === null) {
        return;
    }

    if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
            getKeyMap(item, `${parentPath}[i]`, result);
        });
    } else {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const currentPath = parentPath ? `${parentPath}.${key}` : key;
                // hacky
                let abbrPath = `${currentPath}`;
                if (tempParent === "") {
                    tempParent = `${currentPath}[i].`;
                } else {
                    abbrPath = abbrPath.replace(tempParent, "");
                }

                // check if the value is not null or undefined before storing
                if (obj[key] !== null && obj[key] !== undefined) {

                    // only store points with actual values string, number, boolean
                    if (typeof obj[key] === "string" || typeof obj[key] === "number" || typeof obj[key] === "boolean") {
                        result[abbrPath] = currentPath;
                    }
                    getKeyMap(obj[key], currentPath, result);
                }
            }
        }
    }
}

// simple logic to determine if we have object or array at root of JSON
function isRootKey(obj) {
    if (typeof obj !== "object" || obj === null) {
        return;
    }

    if (!Array.isArray(obj)) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                return key;
            }
        }
    }
}

function copyIt(){
    let toast = new bootstrap.Toast(document.getElementById("clipboardToast"));
    navigator.clipboard.writeText(generatedCode.value);
    toast.show();
}

// sample data based on modified api/reports response from https://apidocs.morpheusdata.com
// changed one of the statuses to "running"
let sampleData = {
    "reportResults": [
        {
            "id": 1380,
            "type": {
                "id": 59,
                "code": "automation-overview-report",
                "name": "Automation Overview",
                "category": "inventory"
            },
            "reportTitle": "Automation Overview Mar 02, 2022 16:06:36",
            "filterTitle": null,
            "status": "ready",
            "dateCreated": "2022-03-02T16:06:36Z",
            "lastUpdated": "2022-03-02T16:06:37Z",
            "startDate": null,
            "endDate": null,
            "config": {
                "reportType": null,
                "metadata": {},
                "metadataExclude": {}
            },
            "createdBy": {
                "id": 263,
                "username": "Martez Reed"
            }
        },
        {
            "id": 1378,
            "type": {
                "id": 31,
                "code": "amazonReservationUtilization",
                "name": "Amazon Reservation Utilization",
                "category": "cost"
            },
            "reportTitle": "Amazon Reservation Utilization Mar 01, 2022 00:00:07",
            "filterTitle": "Mar 10, 2021 - Mar 12, 2022 | AWS Labs | Mar 01, 2022",
            "status": "running",
            "dateCreated": "2022-03-01T00:00:07Z",
            "lastUpdated": "2022-03-01T00:00:08Z",
            "startDate": "2021-03-10T00:00:00Z",
            "endDate": "2022-03-12T23:59:00Z",
            "config": {
                "reportType": null,
                "startDate": "03/10/2021 00:00:00",
                "endDate": "03/12/2022 23:59:59",
                "name": "AWS Labs Reservation Utilization",
                "scheduleMode": "7",
                "dateTime": "2021-03-12 21:38:42",
                "cloudId": "141",
                "config": {
                    "dateTime": "2021-03-12 21:38:42",
                    "cloudId": "141"
                },
                "metadata": {},
                "metadataExclude": {}
            },
            "createdBy": {
                "id": 2,
                "username": "jwheeler"
            }
        }
    ],
    "meta": {
        "size": 2,
        "total": 1162,
        "offset": 0,
        "max": 2
    }
}


function loadSampleJSON(){
    jsonDataTextarea.innerHTML = JSON.stringify(sampleData);
    jsonDataTextarea.focus();
    jsonDataTextarea.blur();
}

// test function
function scriptTest(){
    let data = sampleData;
    let results = [];

    // this is generated output we are testing it against the sample data (api/reports)
    // which we used to create the translation script

    // start of generated output
    for (let i = 0; i < data.reportResults.length; i++){
        if( data.reportResults[i].status === "ready" ) {
            results.push({
                name : data.reportResults[i].reportTitle,
                value : data.reportResults[i].type.id
            })
        }
    }
    // end of generated output

    console.log(results);

    // outputs, so passes
    // {
    //     "name": "Automation Overview Mar 02, 2022 16:06:36",
    //     "value": 59
    // }
}