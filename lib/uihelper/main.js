class FloatingGUI {
    constructor(anchor, content="", title="", show_anchor=true, center="true") {
        this.anchor  = anchor;
        this.content = content;
        this.title   = title;

        this.show_anchor = show_anchor;
        this.centering   = center;

        this.whenClose = () => {};
    }

    open(container=document.body) {
        return new Promise((promiseResolve) => {
            let backgroundHTML = document.createElement("DIV");
            backgroundHTML.classList.add("fGUI-background");

            let containerHTML = document.createElement("DIV");
            containerHTML.classList.add("fGUI-container");

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
            anchor_container.classList.add("fGUI-anchor-container");
            
            if(this.show_anchor) {
                let anchor_clone = document.createElement("DIV");
                anchor_clone.classList.add("fGUI-anchor");
                anchor_clone.appendChild(this.anchor.cloneNode(1));
                anchor_container.appendChild(anchor_clone);
            }
            
            let anchor_title = document.createElement("LABEL");
            anchor_title.classList.add("fGUI-title");
            anchor_title.innerHTML = this.title;
            anchor_container.appendChild(anchor_title);
            
            containerHTML.appendChild(anchor_container);

            containerHTML.append(this.content);
            backgroundHTML.appendChild(containerHTML);
            container.appendChild(backgroundHTML);

            this.prepareClose(backgroundHTML, container);

            promiseResolve();
        });
    }

    close(container=document.body) {
        container.getElementsByClassName("fGUI-background")[0].remove();
        this.whenClose();
    }

    prepareClose(element, container=document.body) {
        element.onclick = (e) => {
            if(e.target === element) {
                this.close(container);
            }
        };
    }
}