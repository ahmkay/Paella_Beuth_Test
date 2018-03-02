/*

console.log("load Overlay Plugin");

var overlayBool = true;

function startOverlay() {
    if (overlayBool) {
        console.log("START OVERLAY");
        var img = document.createElement("img");
        img.id = "overlayBauchbindeID";
        img.style.display = "block";
        img.src = "http://om-circle.de/img/PaellaStuff/bauchbinde.png";
        img.style.position = "absolute";
        img.style.bottom = 5 + "%";
        img.style.width = 100 + "%";
        img.style.height = 25 + "%";
        var container = document.getElementById("overlayContainer");
        container.appendChild(img);
    }
}

function startText() {
    if (overlayBool) {
        console.log("START TEXT");
        var name = document.createElement("h2");
        name.id = "overlayUntertitelID";
        name.style.display = "block";
        name.innerHTML = "Prof. Dr. Marquez Sanchez";
        name.style.position = "absolute";
        name.style.bottom = 20 + "%";
        name.style.left = 18 + "%";
        name.style.fontSize = 3 + "vw";
        name.style.color = "white";

        var title = document.createElement("h1");
        title.id = "overlayTitelID";
        title.style.display = "block";
        title.innerHTML = '"Die Erde ist eine Scheibe"';
        title.style.position = "absolute";
        title.style.bottom = 6 + "%";
        title.style.left = 15 + "%";
        title.style.fontSize = 5 + "vw";
        title.style.color = "white";

        var container = document.getElementById("overlayContainer");
        container.appendChild(title);
        container.appendChild(name);
    }
}

function startIcon() {
    if (overlayBool) {
        console.log("START ICON");
        var icon = document.createElement("img");
        icon.src = "http://om-circle.de/img/PaellaStuff/beuth_logo.gif";
        icon.id = "overlayIconID";
        icon.style.display = "block";
        icon.style.position = "absolute";
        icon.style.bottom = 22 + "%";
        icon.style.width = 5 + "%";
        icon.style.left = 2 + "%";

        var container = document.getElementById("overlayContainer");
        container.appendChild(icon);
    }
}


function startGong() {
    if (overlayBool) {
        console.log("START GONG");
        if (document.getElementById('gong')) {
            document.getElementById('gong').play();
            document.getElementById("dotGong").style.opacity = 100;
            setTimeout(function () {
                document.getElementById("dotGong").style.opacity = 0;
            }, 1500);
        }
        else {
            var gong = document.createElement("audio");
            gong.src = "http://om-circle.de/img/PaellaStuff/gong.mp3";
            gong.type = "audio/mpeg";
            gong.id = "gong";
            gong.play();

            var dot = document.createElement("img");
            dot.src = "http://om-circle.de/img/PaellaStuff/redDot.png";
            dot.style.position = "absolute";
            dot.style.top = 2 + "%";
            dot.style.width = 3 + "%";
            dot.style.right = 1 + "%";
            dot.style.opacity = 0;
            dot.id = "dotGong";

            var container = document.getElementById("overlayContainer");
            container.appendChild(dot);

            dot.style.opacity = 100;


            setTimeout(function () {
                dot.style.opacity = 0;
            }, 1500);
        }
    }
}


function startAdd1() {
        console.log("START ADD Overlay");
        var add1 = document.createElement("img");
        add1.src = "http://om-circle.de/img/PaellaStuff/add1b.png";
        add1.style.position = "absolute";
        add1.style.bottom = 0;
        add1.style.left = 0;
        add1.style.opacity = 100;
        add1.style.height = 100 + "%";
        add1.style.zIndex = 105;
        var container = document.getElementById("overlayContainer");
        container.appendChild(add1);
        setTimeout(function () {
            add1.style.opacity = 0;
        }, 3000);
}

function startAdd2() {
    console.log("START ADD Fullscreen");
    var add2 = document.createElement("img");
    add2.src = "http://om-circle.de/img/PaellaStuff/add2.png";
    add2.style.position = "absolute";
    add2.style.bottom = 0;
    add2.style.left = 0;
    add2.style.opacity = 100;
    add2.style.height = 100 + "%";
    add2.style.width = 100 + "%";
    add2.style.zIndex = 110;
    var container = document.getElementById("overlayContainer");
    container.appendChild(add2);

    paella.player.pause();

    setTimeout(function () {
        add2.style.opacity = 0;
        paella.player.play();
    }, 3000);
}


function startLink() {
    if (overlayBool) {
        console.log("START LINK CONTAINER");
        var contLink = document.getElementById("linkContainerMaster");
        contLink.style.display = "block";

        var gong = document.createElement("audio");
        gong.src = "http://om-circle.de/img/PaellaStuff/gong.mp3";
        gong.type = "audio/mpeg";
        gong.id = "gong";
        gong.play();

        setTimeout(function () {
            contLink.style.display = "none";
        }, 4500);
    }
}


function disableOveray() {
    if (document.getElementById("overlayBauchbindeID")) {
        var elem1 = document.getElementById("overlayBauchbindeID");
        elem1.parentNode.removeChild(elem1);
    }

    if (document.getElementById("overlayUntertitelID")) {
        var elem2 = document.getElementById("overlayUntertitelID");
        elem2.parentNode.removeChild(elem2);
    }

    if (document.getElementById("overlayTitelID")) {
        var elem3 = document.getElementById("overlayTitelID");
        elem3.parentNode.removeChild(elem3);
    }

    if (document.getElementById("overlayIconID")) {
        var elem4 = document.getElementById("overlayIconID");
        elem4.parentNode.removeChild(elem4);
    }


    if(overlayBool){ overlayBool = false; }
    else { overlayBool = true; }
}


*/

