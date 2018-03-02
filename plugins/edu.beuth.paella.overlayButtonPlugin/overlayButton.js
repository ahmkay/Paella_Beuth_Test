Class("paella.plugins.overlayButtonPlugin", paella.ButtonPlugin, {
    overlaySubclass: 'overlayButtonPlugin',


    getAlignment: function () {
        return 'left';
    },
    getSubclass: function () {
        return 'overlayButton';
    },
    getName: function () {
        return "edu.beuth.paella.overlayButtonPlugin";
    },
    getButtonType: function () {
        return paella.ButtonPlugin.type.popUpButton;
    },
    getDefaultToolTip: function () {
        return base.dictionary.translate("Overlay");
    },
    getIndex: function () {
        return 110;
    },

    checkEnabled: function (onSuccess) {
        onSuccess(!paella.player.isLiveStream());
        var button = document.getElementById("buttonPlugin1");
        var iconLayer = document.createElement("img");
        iconLayer.id = "overlayButtonIconID";
        iconLayer.src = "resources/images/layer_white.png";
        iconLayer.style.width = 100 + "%";
        button.appendChild(iconLayer);
    },

    setup: function () {
        var This = this;
        if (paella.player.playing()) {
            this.changeSubclass(This.overlaySubclass);
        }
        paella.events.bind(paella.events.pause, function (event) {
            This.changeSubclass(This.playSubclass);
            This.setToolTip(paella.dictionary.translate("Overlay"));

        });





        var vid = document.getElementById("playerContainer_videoContainer_master");
        var timeVid = 0;

        vid.ontimeupdate = function () {
            myFunction()
        };

        function myFunction() {
            timeVid = Math.round(vid.currentTime);


            switch (timeVid) {
                case dataOverlay.streams["0"].left.inserts["0"].insert1.time:                   //Bauchbinde
                    startOverlay(dataOverlay.streams["0"].left.inserts["0"].insert1.duration);
                    break;
                case dataOverlay.streams["0"].left.notifications["0"].notification1.time:       //Notification
                    startGong();
                    break;
                case dataOverlay.streams["0"].left.commercials["0"].commercial1.time:           //Werbung 1 Layer
                    startAdd1(dataOverlay.streams["0"].left.commercials["0"].commercial1.duration);
                    break;
                case dataOverlay.streams["0"].left.commercials["0"].commercial2.time:           //Werbung 2 Fullscreen
                    startAdd2(dataOverlay.streams["0"].left.commercials["0"].commercial2.duration);
                    break;
                case dataOverlay.streams["0"].left.links["0"].link1.time:                        //Link
                    startLink(dataOverlay.streams["0"].left.links["0"].link1.duration);
                    break;
                case dataOverlay.streams["0"].left.logos["0"].logo1.time:                       //Logo
                    startLogo(dataOverlay.streams["0"].left.logos["0"].logo1.duration);
                    break;
            }

        }

    },
    action: function (button) {
        disableOveray();
    }
});

paella.plugins.overlayButtonPlugin = new paella.plugins.overlayButtonPlugin();


// - - - - START OVERLAY CODE - - - - -

var dataOverlay = 0;
var overlayBool = true;

$.getJSON('../../repository/video-overlay-1/multiview.json', function (data) {
    dataOverlay = data;
});

function startOverlay(duration) {
    if (overlayBool) {
        var container = document.getElementById("overlayContainer");
        if (document.getElementById("overlayBauchbindeID")) {
            console.log("Bauchbinde schon vorhanden");
        }
        else {
            console.log("START OVERLAY");
            var img = document.createElement("img");
            img.id = "overlayBauchbindeID";
            img.src = dataOverlay.streams["0"].left.inserts["0"].insert1.src;

            container.appendChild(img);
        }

        if (document.getElementById("overlayUntertitelID")) {
            console.log("Text schon vorhanden");
        }
        else {
            console.log("START TEXT");
            var name = document.createElement("h2");
            name.id = "overlayUntertitelID";
            name.innerHTML = dataOverlay.streams["0"].left.inserts["0"].insert1.title;

            var title = document.createElement("h1");
            title.id = "overlayTitelID";
            title.innerHTML = dataOverlay.streams["0"].left.inserts["0"].insert1.text;

            container.appendChild(title);
            container.appendChild(name);
        }

        if (document.getElementById("overlayIconID")) {
            console.log("Icon schon vorhanden");
        }
        else {
            console.log("START ICON");
            var icon = document.createElement("img");
            icon.src = dataOverlay.streams["0"].left.inserts["0"].insert1.icon;
            icon.id = "overlayIconID";

            container.appendChild(icon);
        }

        setTimeout(function () {
            disableBauchbinde();
        }, (duration) * 1000);
    }
}

function disableBauchbinde() {
    var container = document.getElementById("overlayContainer");

    var childBauchbinde = document.getElementById("overlayBauchbindeID");
    var childTitle = document.getElementById("overlayTitelID");
    var childUntertitel = document.getElementById("overlayUntertitelID");
    var childIcon = document.getElementById("overlayIconID");

    container.removeChild(childBauchbinde);
    container.removeChild(childTitle);
    container.removeChild(childUntertitel);
    container.removeChild(childIcon);
}

function startGong() {
    if (overlayBool) {

        if (document.getElementById('gong')) {
            if (document.getElementById('gong').paused) {
                console.log("START GONG");
                document.getElementById('gong').play();
                document.getElementById("dotGong").style.opacity = 100;
                setTimeout(function () {
                    document.getElementById("dotGong").style.opacity = 0;
                }, 1500);
            }
            else {
                console.log("Gong spielt schon");
            }
        }
        else {
            if (document.getElementById("dotGong")) {
                console.log("Gong spielt schon");
            }
            else {
                var gong = document.createElement("audio");
                gong.src = dataOverlay.streams["0"].left.notifications["0"].notification1.src_audio;
                gong.type = "audio/mpeg";
                gong.id = "gong";
                gong.play();

                var dot = document.createElement("img");
                dot.src = dataOverlay.streams["0"].left.notifications["0"].notification1.src_visuell;
                dot.id = "dotGong";
                dot.style.opacity = 100;

                var container = document.getElementById("overlayContainer");
                container.appendChild(dot);

                setTimeout(function () {
                    dot.style.opacity = 0;
                }, 2500);
            }
        }
    }
}

function startAdd1(duration) {
    if (document.getElementById("add1IdBox")) {
        console.log("Add schon vorhanden");
    }
    else {
        console.log("START ADD Overlay");
        var add1 = document.createElement("img");
        add1.src = dataOverlay.streams["0"].left.commercials["0"].commercial1.src;
        add1.id = "add1IdBox";

        var container = document.getElementById("overlayContainer");
        container.appendChild(add1);

        setTimeout(function () {
            container.removeChild(add1);
        }, (duration * 1000));
    }

}

function startAdd2(duration) {
    if (document.getElementById("add2IdBox")) {
        console.log("Add schon vorhanden");
    }
    else {
        console.log("START ADD Fullscreen");
        var add2 = document.createElement("img");
        add2.id = "add2IdBox";
        add2.src = dataOverlay.streams["0"].left.commercials["0"].commercial2.src;

        var container = document.getElementById("overlayContainer");
        container.appendChild(add2);

        paella.player.pause();
        document.getElementById("playerContainer_controls").style.display = "none";

        setTimeout(function () {
            container.removeChild(add2);
            paella.player.play();
            document.getElementById("playerContainer_controls").style.display = "block";
        }, (duration * 1000));
    }
}

function startLink(duration) {
    console.log("Link Start");
    if (overlayBool) {
        if (document.getElementById("linkContainer")){
            console.log("Link schon vorhanden");
        }
        else {
            console.log("Link wird erstellt");

            //Hauptcontainer
            var linkContainerMaster = document.getElementById("linkContainerMaster");

            //Linkcontainer
            var linkContainer = document.createElement("div");
            linkContainer.id = "linkContainer";


            //Bild-Link
            var linkContainerAnker1 = document.createElement("a");
            linkContainerAnker1.setAttribute('target', '_blank');
            linkContainerAnker1.setAttribute('href', dataOverlay.streams["0"].left.links["0"].link1.url);
            linkContainerAnker1.id = "linkContainerAnker";
            linkContainer.appendChild(linkContainerAnker1);

            //Bild
            var linkContainerImage = document.createElement("img");
            linkContainerImage.id = "linkContainerImage";
            linkContainerImage.src = dataOverlay.streams["0"].left.links["0"].link1.image;
            linkContainerAnker1.appendChild(linkContainerImage);

            //Horizontale Linie
            var linkContainerHR = document.createElement("hr");
            linkContainer.appendChild(linkContainerHR);

            //Link-Text
            var linkContainerText = document.createElement("p");
            linkContainerText.id = "linkContainerText";
            linkContainer.appendChild(linkContainerText);

            //Text
            var linkContainerAnker2 = document.createElement("a");
            linkContainerAnker2.id = "linkContainerAnker2";
            linkContainerAnker2.setAttribute('target', '_blank');
            linkContainerAnker2.setAttribute('href', dataOverlay.streams["0"].left.links["0"].link1.url);
            linkContainerAnker2.innerHTML = dataOverlay.streams["0"].left.links["0"].link1.text;
            linkContainerText.appendChild(linkContainerAnker2);


            linkContainerMaster.appendChild(linkContainer);
            console.log("Link wird angehängt");

            setTimeout(function () {
                linkContainerMaster.removeChild(linkContainer);
            }, (duration * 1000));
        }

    }
}


function startLogo(duration) {
    var logo = document.getElementById("beuth-logo.png");
    logo.style.display = "block";
    logo.style.zIndex = 15;
    logo.src = dataOverlay.streams["0"].left.links["0"].link1.image;

    setTimeout(function () {
        logo.src = "config/profiles/resources/beuth-logo.png";
    }, (duration * 1000));
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


    if (overlayBool) {
        overlayBool = false;
    }
    else {
        overlayBool = true;
    }

    if (overlayBool) {
        var icon = document.getElementById("overlayButtonIconID");
        icon.src = "resources/images/layer_white.png";
    }
    else {
        var icon = document.getElementById("overlayButtonIconID");
        icon.src = "resources/images/layer_red.png";
    }
    console.log("Status Overlay Bool: " + overlayBool);
}





