console.log("OVERLAY PLUGIN INITIALISE");
Class ("paella.plugins.overlayButtonPlugin",paella.ButtonPlugin, {
    overlaySubclass:'overlayButtonPlugin',


    getAlignment:function() { return 'left'; },
    getSubclass:function() { return this.overlaySubclass; },
    getName:function() { return "edu.beuth.paella.overlayButtonPlugin"; },
    getDefaultToolTip:function() { return base.dictionary.translate("Overlay"); },
    getIndex:function() {return 110;},

    checkEnabled:function(onSuccess) {
        onSuccess(!paella.player.isLiveStream());
    },

    setup:function() {
        var This = this;
        if (paella.player.playing()) {
            this.changeSubclass(This.overlaySubclass);
        }
        paella.events.bind(paella.events.pause,function(event) { This.changeSubclass(This.playSubclass); This.setToolTip(paella.dictionary.translate("Overlay"));});
    },

    action:function(button) {
        alert("OVERLAY PLUGIN LOAD");
        console.log("OVERLAY PLUGIN LOAD");
    }
});

paella.plugins.overlayButtonPlugin = new paella.plugins.overlayButtonPlugin();

