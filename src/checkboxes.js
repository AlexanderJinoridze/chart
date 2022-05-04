function noop(){}

export function checkBoxes(root, data){
    let nextFn = noop;
    let filter = {};

    function next(){
        nextFn(getFilter());
    }

    function checkBoxClick(){
        const $input = this.querySelector("input");
        filter[$input.id] = $input.checked;
        if(Object.values(filter).every((val)=>val===false)){
            $input.checked = true;
            filter[$input.id] = true;
        }

        next();
    }

    function getFilter(){
        return filter;
    }

    Object.keys(data.names).map((key, i, obj)=>{
        let template = `
            <input type="checkbox" id="${ key }" checked>
            <label for="${ key }"><span style="border-color: ${ data.colors[key] }"></span></label>
            <span>${ data.names[key] }</span>
        `;
        let checkBox = document.createElement("div");
        checkBox.classList.add("tg-chart-checkbox");
        checkBox.innerHTML = template;

        checkBox.addEventListener("click",checkBoxClick);
        checkBoxClick.apply(checkBox);

        root.appendChild(checkBox);
    });

    return {
        subscribe(fn){
            nextFn = fn;
            fn(getFilter());
        }
    }
}