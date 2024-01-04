let expression = document.querySelector(".expression");
let result = document.querySelector(".result");
let keys = document.querySelector(".keys-grid");
let history = [];

keys.addEventListener("click", (e) => {
    if (e.target.matches("button")) {
        let dataValue = e.target.dataset.value,
            dataFunction = e.target.dataset.function;
        withDataAttributes(dataValue, dataFunction);
    }
});

const withDataAttributes = (dataValue, dataFunction = undefined) => {
    updateScreen(dataValue);
    dataFunction && withDataFunctions(dataFunction);
};

const withDataFunctions = (dataFunction) => {
    switch (dataFunction) {
        case "clear":
            clear();
            break;
        case "equal":
            equalTo(expression.value);
            break;
        case "del":
            del();
            break;
    }
};

const updateScreen = (value = "") => {
    if (validateExp(value, expression.value)) expression.value += value;
    calculate(expression.value);
};

const mexp = new Mexp();
mexp.addToken([
    { token: "%", show: "%", type: 7, precedence: 11, value: (x) => x / 100 },
]);
mexp.addToken([
    { token: "sqrt", show: "sqrt", type: 0, precedence: 11, value: Math.sqrt },
]);
mexp.addToken([
    { token: "abs", show: "abs", type: 0, precedence: 11, value: Math.abs },
]);

const validateExp = (value, exp) => {
    let tokens = [];
    mexp.tokens.forEach((e) => tokens.push(e.token));
    let lastValue = (exp != "" && exp[exp.length - 1]) || "";
    if (value == "" || tokens.indexOf(value) < 0 || " n,".includes(value))
        return false;
    else if (
        !isNumber(lastValue) &&
        !isNumber(value) &&
        "*/+".includes(value) &&
        !"%pi!e".includes(lastValue)
    )
        return false;
    else if (!isNumber(lastValue) && lastValue == value) return false;
    return true;
};

const isNumber = (value) => !isNaN(parseFloat(value));

const calculate = (exp) => {
    try {
        let ans = mexp.eval(exp);
        isNumber(ans) && (result.textContent = ans);
    } catch (err) {
        console.log(err.message);
    }
};

const equalTo = (exp) => {
    if (exp == "") return;
    calculate(expression.value);
    let ent = { expression: exp, result: result.textContent, __proto__: null };
    history.push(ent);
    history.length &&
        history.forEach(
            (e, i) =>
                e.expression == ent.result &&
                (history = history
                    .slice(0, i - 1)
                    .concat(history.slice(i + 1, history.length)))
        );
    history.length && updateHistory(history);
    expression.value = result.textContent;
    result.textContent = "";
};

const updateHistory = (history) => {
    history.forEach((e) => createHistory(e.expression, e.result));
};

const createHistory = (exp, result) => {
    let list = document.querySelector(".history");
    let item = document.createElement("li");
    let p = document.createElement("p");
    let strong = document.createElement("strong");
    [p.textContent, strong.textContent] = [exp, result];
    item.classList.add("item");
    item.append(p, strong);
    list.insertBefore(item, list.lastElementChild);
};

const resetHistory = (last) => {
    history = [];
    let items = document.querySelectorAll(".item");
    items.forEach((item) => item != last && item.remove());
};

const clear = () => {
    expression.value = "";
    result.textContent = "";
};

const del = () => {
    expression.value = expression.value.slice(0, expression.value.length - 1);
    if (expression.value.length < 2) result.textContent = "";
    calculate(expression.value);
};

let toggleVar = {
    dark: false,
    unhide: false,
    histOpen: false,
    __proto__: null,
};

const toggler = (property, mainFunc, alternativeFunc, target) => {
    target[property] = !target[property];
    target[property] ? mainFunc() : alternativeFunc();
};

const darkMode = () => {
    let body = document.body;
    toggler(
        "dark",
        () => body.classList.add("dark-mode"),
        () => body.classList.remove("dark-mode"),
        toggleVar
    );
};

const toggleHide = () => {
    let container = keys.querySelector(".hidden");
    toggler(
        "unhide",
        () => (container.style.display = "grid"),
        () => (container.style.display = "none"),
        toggleVar
    );
};

const toggleDeg = (btn) => {
    toggler(
        "isDegree",
        () => (btn.textContent = "deg"),
        () => (btn.textContent = "rad"),
        mexp.math
    );
};

toggleHistory = () => {
    let container = document.querySelector(".history");
    toggler(
        "histOpen",
        () => (container.style.display = "flex"),
        () => (container.style.display = "none"),
        toggleVar
    );
};

const onKeyDown = (e) => {
    let funcKeys = ["Escape", "Backspace", "Enter"];
    if (e.key != "Tab") e.preventDefault();
    if (validateExp(e.key, expression.value) || funcKeys.indexOf(e.key) > -1) {
        e.preventDefault();
        e.key == "Escape" && withDataFunctions("clear");
        e.key == "Backspace" && withDataFunctions("del");
        e.key == "Enter" && withDataFunctions("equal");
        validateExp(e.key, expression.value) && withDataAttributes(e.key);
    }
};
expression.addEventListener(
    "input",
    (e) => e.key != "Tab" && e.preventDefault()
);
document.addEventListener("keydown", onKeyDown);