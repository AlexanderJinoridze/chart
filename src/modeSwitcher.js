export function modeSwithcer(switcher, theme = "day"){
    const nightTitle = "Swith to Day Mode";
    const dayTitle = "Swith to Night Mode";
    const body = document.body;

    if(theme !== "day" && theme !== "night"){
        throw new Error("Proper values of defaultMode argument are 'day' or 'night'");
    }

    function switchMode(event){
        event.preventDefault();

        if(!body.classList.contains("dark")){
            theme = "night";
            body.classList.add("dark");
            event.target.innerText = nightTitle  ;
        } else {
            theme = "day";
            body.classList.remove("dark");
            event.target.innerText = dayTitle;
        }
    }

    if(theme === "night"){
        body.classList.add("dark");
        switcher.innerText = nightTitle ;
    } else if(theme === "day") {
        body.classList.remove("dark");
        switcher.innerText = dayTitle ;
    }

    switcher.addEventListener("click", switchMode);
}