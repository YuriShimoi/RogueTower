class VirtualGUI {
    constructor(content="", title="", background_class="vGUI-background") {
        this.content = content;
        this.title   = title;

        this.background_class = background_class;

        this.instance  = null;
        this.whenClose = () => {};
    }

    close(container=document.body) {
        container.getElementsByClassName(this.background_class)[0].remove();
        this.whenClose();
    }

    update(content) {
        let contentHTML = this.instance.getElementsByClassName("GUI-content")[0];
        contentHTML.innerHTML = "";
        contentHTML.append(content);
    }
}

class FloatingGUI extends VirtualGUI {
    static GUIResgister = [];

    constructor(anchor, content="", title="", show_anchor=true, center="true") {
        super(content, title, "fGUI-background");

        this.anchor      = anchor;
        this.show_anchor = show_anchor;
        this.centering   = center;

        FloatingGUI.GUIResgister.push(this);
    }

    static closeFloats(container=document.body) {
         for(let guir=0; guir < FloatingGUI.GUIResgister.length; guir++) {
            let foundBackground = container.getElementsByClassName(FloatingGUI.GUIResgister[guir].background_class);
            if(foundBackground.length) foundBackground[0].remove();
            
            FloatingGUI.GUIResgister[guir].whenClose();
            FloatingGUI.GUIResgister.splice(guir, 1);
            guir--;
         }
    }

    open(container=document.body) {
        return new Promise((promiseResolve) => {
            let backgroundHTML = document.createElement("DIV");
            backgroundHTML.classList.add(this.background_class, "GUI-background");

            let containerHTML = document.createElement("DIV");
            containerHTML.classList.add("fGUI-container", "GUI-container");

            if(!this.centering) {
                containerHTML.style.top  = (this.anchor.offsetTop - 11) + "px";
                containerHTML.style.left = (this.anchor.offsetLeft - 11) + "px";
            }
            else {
                containerHTML.style.top  = "50%";
                containerHTML.style.left = "50%";
                containerHTML.style.transform = "translate(-50%, -50%)";
            }

            let anchor_container = document.createElement("DIV");
            anchor_container.classList.add("fGUI-anchor-container", "GUI-anchor-container");
            
            if(this.show_anchor) {
                let anchor_clone = document.createElement("DIV");
                anchor_clone.classList.add("fGUI-anchor");
                anchor_clone.appendChild(this.anchor.cloneNode(1));
                anchor_container.appendChild(anchor_clone);
            }
            
            let anchor_title = document.createElement("LABEL");
            anchor_title.classList.add("fGUI-title", "GUI-title");
            anchor_title.innerHTML = this.title;
            anchor_container.appendChild(anchor_title);
            
            containerHTML.appendChild(anchor_container);

            let contentHTML = document.createElement("SPAN");
            contentHTML.classList.add("GUI-content");
            contentHTML.append(this.content);

            containerHTML.append(contentHTML);
            backgroundHTML.appendChild(containerHTML);
            container.appendChild(backgroundHTML);

            this.prepareClose(backgroundHTML, container);

            this.instance = containerHTML;
            promiseResolve();
        });
    }

    prepareClose(element, container=document.body) {
        element.onclick = (e) => {
            if(e.target === element) {
                this.close(container);
            }
        };
    }
}

class StaticGUI extends VirtualGUI {
    constructor(content="", title="", anchor="center", container=document.body) {
        super(content, title, "sGUI-background");
        
        this.anchor    = anchor;
        this.container = container;
    }

    open(container=this.container) {
        return new Promise((promiseResolve) => {
            let backgroundHTML = document.createElement("DIV");
            backgroundHTML.classList.add(this.background_class, "GUI-background");

            let containerHTML = document.createElement("DIV");
            containerHTML.classList.add("sGUI-container", "GUI-container");

            switch(this.anchor) {
                case "topleft":
                    // default positioning
                    break;
                case "topright":
                    backgroundHTML.style.justifyContent = "flex-end";
                    break;
                case "bottomleft":
                    backgroundHTML.style.alignItems = "flex-end";
                    break;
                case "bottomright":
                    backgroundHTML.style.justifyContent = "flex-end";
                    backgroundHTML.style.alignItems = "flex-end";
                    break;
                case "center":
                    backgroundHTML.style.justifyContent = "center";
                    backgroundHTML.style.alignItems = "center";
                default:

            }

            let anchor_container = document.createElement("DIV");
            anchor_container.classList.add("sGUI-anchor-container", "GUI-anchor-container");
            
            let anchor_title = document.createElement("LABEL");
            anchor_title.classList.add("sGUI-title", "GUI-title");
            anchor_title.innerHTML = this.title;
            anchor_container.appendChild(anchor_title);

            containerHTML.appendChild(anchor_container);

            let contentHTML = document.createElement("SPAN");
            contentHTML.classList.add("GUI-content");
            contentHTML.append(this.content);

            containerHTML.append(contentHTML);
            backgroundHTML.appendChild(containerHTML);
            container.appendChild(backgroundHTML);

            this.instance = containerHTML;
            promiseResolve();
        });
    }
}