"use strict";

function paella_DeferredResolved(e) {
    return new Promise(function (t) {
        t(e)
    })
}

function paella_DeferredRejected(e) {
    return new Promise(function (t, n) {
        n(e)
    })
}

function paella_DeferredNotImplemented() {
    return paella_DeferredRejected(new Error("not implemented"))
}

function initPaellaEngage(e, t) {
    t || (t = new paella.InitDelegate), paella.initDelegate = t;
    navigator.language || window.navigator.userLanguage;
    paellaPlayer = new PaellaPlayer(e, paella.initDelegate)
}

function DeprecatedClass(e, t, n) {
    Class(e, n, {
        initialize: function () {
            base.log.warning(e + " is deprecated, use " + t + " instead."), this.parent.apply(this, arguments)
        }
    })
}

function DeprecatedFunc(e, t, n) {
    function a() {
        base.log.warning(e + " is deprecated, use " + t + " instead."), n.apply(this, arguments)
    }

    return a
}

function buildChromaVideoCanvas(e, t) {
    var n = function (e) {
        function t(e) {
            $traceurRuntime.superConstructor(t).call(this), this.stream = e, this._chroma = bg.Color.White(), this._crop = new bg.Vector4(.3, .01, .3, .01), this._transform = bg.Matrix4.Identity().translate(.6, -.04, 0), this._bias = .01
        }

        return $traceurRuntime.createClass(t, {
            get chroma() {
                return this._chroma
            }, get bias() {
                return this._bias
            }, get crop() {
                return this._crop
            }, get transform() {
                return this._transform
            }, set chroma(e) {
                this._chroma = e
            }, set bias(e) {
                this._bias = e
            }, set crop(e) {
                this._crop = e
            }, set transform(e) {
                this._transform = e
            }, get video() {
                return this.texture ? this.texture.video : null
            }, loaded: function () {
                var e = this;
                return new Promise(function (t) {
                    var n = function () {
                        e.video ? t(e) : setTimeout(n, 100)
                    };
                    n()
                })
            }, buildShape: function () {
                this.plist = new bg.base.PolyList(this.gl), this.plist.vertex = [-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], this.plist.texCoord0 = [0, 0, 1, 0, 1, 1, 0, 1], this.plist.index = [0, 1, 2, 2, 3, 0], this.plist.build()
            }, buildShader: function () {
                this.shader = new bg.base.Shader(this.gl), this.shader.addShaderSource(bg.base.ShaderType.VERTEX, "\n\t\t\t\t\tattribute vec4 position;\n\t\t\t\t\tattribute vec2 texCoord;\n\t\t\t\t\tuniform mat4 inTransform;\n\t\t\t\t\tvarying vec2 vTexCoord;\n\t\t\t\t\tvoid main() {\n\t\t\t\t\t\tgl_Position = inTransform * position;\n\t\t\t\t\t\tvTexCoord = texCoord;\n\t\t\t\t\t}\n\t\t\t\t"), this.shader.addShaderSource(bg.base.ShaderType.FRAGMENT, "\n\t\t\t\t\tprecision mediump float;\n\t\t\t\t\tvarying vec2 vTexCoord;\n\t\t\t\t\tuniform sampler2D inTexture;\n\t\t\t\t\tuniform vec4 inChroma;\n\t\t\t\t\tuniform float inBias;\n\t\t\t\t\tuniform vec4 inCrop;\n\t\t\t\t\tvoid main() {\n\t\t\t\t\t\tvec4 result = texture2D(inTexture,vTexCoord);\n\t\t\t\t\t\t\n\t\t\t\t\t\tif ((result.r>=inChroma.r-inBias && result.r<=inChroma.r+inBias &&\n\t\t\t\t\t\t\tresult.g>=inChroma.g-inBias && result.g<=inChroma.g+inBias &&\n\t\t\t\t\t\t\tresult.b>=inChroma.b-inBias && result.b<=inChroma.b+inBias) ||\n\t\t\t\t\t\t\t(vTexCoord.x<inCrop.x || vTexCoord.x>inCrop.z || vTexCoord.y<inCrop.w || vTexCoord.y>inCrop.y)\n\t\t\t\t\t\t)\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\tdiscard;\n\t\t\t\t\t\t}\n\t\t\t\t\t\telse {\n\t\t\t\t\t\t\tgl_FragColor = result;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t"), status = this.shader.link(), this.shader.status || (console.log(this.shader.compileError), console.log(this.shader.linkError)), this.shader.initVars(["position", "texCoord"], ["inTransform", "inTexture", "inChroma", "inBias", "inCrop"])
            }, init: function () {
                var e = this;
                bg.Engine.Set(new bg.webgl1.Engine(this.gl)), bg.base.Loader.RegisterPlugin(new bg.base.VideoTextureLoaderPlugin), this.buildShape(), this.buildShader(), this.pipeline = new bg.base.Pipeline(this.gl), bg.base.Pipeline.SetCurrent(this.pipeline), this.pipeline.clearColor = bg.Color.Transparent(), bg.base.Loader.Load(this.gl, this.stream.src).then(function (t) {
                    e.texture = t
                })
            }, frame: function (e) {
                this.texture && this.texture.update()
            }, display: function () {
                this.pipeline.clearBuffers(bg.base.ClearBuffers.COLOR | bg.base.ClearBuffers.DEPTH), this.texture && (this.shader.setActive(), this.shader.setInputBuffer("position", this.plist.vertexBuffer, 3), this.shader.setInputBuffer("texCoord", this.plist.texCoord0Buffer, 2), this.shader.setMatrix4("inTransform", this.transform), this.shader.setTexture("inTexture", this.texture || bg.base.TextureCache.WhiteTexture(this.gl), bg.base.TextureUnit.TEXTURE_0), this.shader.setVector4("inChroma", this.chroma), this.shader.setValueFloat("inBias", this.bias), this.shader.setVector4("inCrop", new bg.Vector4(this.crop.x, 1 - this.crop.y, 1 - this.crop.z, this.crop.w)), this.plist.draw(), this.shader.disableInputBuffer("position"), this.shader.disableInputBuffer("texCoord"), this.shader.clearActive())
            }, reshape: function (e, t) {
                var n = this.canvas.domElement;
                n.width = e, n.height = t, this.pipeline.viewport = new bg.Viewport(0, 0, e, t)
            }, mouseMove: function (e) {
                this.postRedisplay()
            }
        }, {}, e)
    }(bg.app.WindowController), a = new n(e), i = bg.app.MainLoop.singleton;
    return i.updateMode = bg.app.FrameUpdate.AUTO, i.canvas = t, i.run(a), a.loaded()
}

function buildVideo360Canvas(e, t) {
    var n = function (e) {
        function t(e) {
            $traceurRuntime.superConstructor(t).call(this), this.stream = e
        }

        return $traceurRuntime.createClass(t, {
            get video() {
                return this.texture ? this.texture.video : null
            }, loaded: function () {
                var e = this;
                return new Promise(function (t) {
                    var n = function () {
                        e.video ? t(e) : setTimeout(n, 100)
                    };
                    n()
                })
            }, buildScene: function () {
                var e = this;
                this._root = new bg.scene.Node(this.gl, "Root node"), bg.base.Loader.RegisterPlugin(new bg.base.TextureLoaderPlugin), bg.base.Loader.RegisterPlugin(new bg.base.VideoTextureLoaderPlugin), bg.base.Loader.RegisterPlugin(new bg.base.VWGLBLoaderPlugin), bg.base.Loader.Load(this.gl, this.stream.src).then(function (t) {
                    e.texture = t;
                    var n = bg.scene.PrimitiveFactory.Sphere(e.gl, 1, 50), a = new bg.scene.Node(e.gl);
                    a.addComponent(n), n.getMaterial(0).texture = t, n.getMaterial(0).lightEmission = 1, n.getMaterial(0).lightEmissionMaskInvert = !0, n.getMaterial(0).cullFace = !1, e._root.addChild(a), e.postRedisplay()
                });
                var t = new bg.scene.Node(this.gl, "Light");
                this._root.addChild(t), this._camera = new bg.scene.Camera;
                var n = new bg.scene.Node("Camera");
                n.addComponent(this._camera), n.addComponent(new bg.scene.Transform);
                var a = new bg.manipulation.OrbitCameraController;
                n.addComponent(a), a.maxPitch = 90, a.minPitch = -90, a.maxDistance = 0, a.minDistace = 0, this._root.addChild(n)
            }, init: function () {
                bg.Engine.Set(new bg.webgl1.Engine(this.gl)), this.buildScene(), this._renderer = bg.render.Renderer.Create(this.gl, bg.render.RenderPath.FORWARD), this._inputVisitor = new bg.scene.InputVisitor
            }, frame: function (e) {
                this.texture && this.texture.update(), this._renderer.frame(this._root, e)
            }, display: function () {
                this._renderer.display(this._root, this._camera)
            }, reshape: function (e, t) {
                this._camera.viewport = new bg.Viewport(0, 0, e, t), this._camera.projection.perspective(60, this._camera.viewport.aspectRatio, .1, 100)
            }, mouseDown: function (e) {
                this._inputVisitor.mouseDown(this._root, e)
            }, mouseDrag: function (e) {
                this._inputVisitor.mouseDrag(this._root, e), this.postRedisplay()
            }, mouseWheel: function (e) {
                this._inputVisitor.mouseWheel(this._root, e), this.postRedisplay()
            }, touchStart: function (e) {
                this._inputVisitor.touchStart(this._root, e)
            }, touchMove: function (e) {
                this._inputVisitor.touchMove(this._root, e), this.postRedisplay()
            }, mouseUp: function (e) {
                this._inputVisitor.mouseUp(this._root, e)
            }, mouseMove: function (e) {
                this._inputVisitor.mouseMove(this._root, e)
            }, mouseOut: function (e) {
                this._inputVisitor.mouseOut(this._root, e)
            }, touchEnd: function (e) {
                this._inputVisitor.touchEnd(this._root, e)
            }
        }, {}, e)
    }(bg.app.WindowController), a = new n(e), i = bg.app.MainLoop.singleton;
    return i.updateMode = bg.app.FrameUpdate.AUTO, i.canvas = t, i.run(a), a.loaded()
}

function buildVideo360ThetaCanvas(e, t) {
    function n(e, t) {
        return new bg.Vector3(Math.cos(t) * Math.cos(e), Math.cos(t) * Math.sin(e), Math.sin(t))
    }

    function a(e, t, n) {
        var a = n;
        return n < -1 ? a = -1 : n > 1 && (a = 1), new bg.Vector2(Math.atan2(t, e), Math.acos(a) / Math.PI)
    }

    function i(e, t, i) {
        var r = n(((e + 90) / 180 - 1) * Math.PI, (.5 - t / 180) * Math.PI),
            o = a(Math.sin(-.5 * Math.PI) * r.z + Math.cos(-.5 * Math.PI) * r.x, r.y, Math.cos(-.5 * Math.PI) * r.z - Math.sin(-.5 * Math.PI) * r.x),
            l = 0 === i ? .883 * o.y * Math.cos(o.x) * .5 + .25 : .883 * (1 - o.y) * Math.cos(-1 * o.x + Math.PI) * .5 + .75,
            s = 0 === i ? .784888888888881 * o.y * Math.sin(o.x) + .55555555555556 : .784888888888881 * (1 - o.y) * Math.sin(-1 * o.x + Math.PI) + .55555555555556;
        return new bg.Vector2(l, s)
    }

    function r(e) {
        function t(e, t, n, a, i, o, l, s, u) {
            r.vertex.push(e.x), r.vertex.push(e.y), r.vertex.push(e.z), r.vertex.push(t.x), r.vertex.push(t.y), r.vertex.push(t.z), r.vertex.push(n.x), r.vertex.push(n.y), r.vertex.push(n.z), r.normal.push(a.x), r.normal.push(a.y), r.normal.push(a.z), r.normal.push(i.x), r.normal.push(i.y), r.normal.push(i.z), r.normal.push(o.x), r.normal.push(o.z), r.normal.push(o.z), r.texCoord0.push(l.x), r.texCoord0.push(l.y), r.texCoord0.push(s.x), r.texCoord0.push(s.y), r.texCoord0.push(u.x), r.texCoord0.push(u.y), r.index.push(r.index.length), r.index.push(r.index.length), r.index.push(r.index.length)
        }

        var n = new bg.scene.Node(e), a = new bg.scene.Drawable;
        n.addComponent(a);
        for (var r = new bg.base.PolyList(e), o = [], l = [], s = [], u = 0; u <= 180; u += 5) {
            for (var c = 0; c <= 360; c += 5) o.push(new bg.Vector3(Math.sin(Math.PI * u / 180) * Math.sin(Math.PI * c / 180) * 1, 1 * Math.cos(Math.PI * u / 180), Math.sin(Math.PI * u / 180) * Math.cos(Math.PI * c / 180) * 1)), l.push(new bg.Vector3(0, 0, -1));
            for (var d = 0; d <= 180; d += 5) s.push(i(d, u, 0));
            for (var p = 180; p <= 360; p += 5) s.push(i(p, u, 1))
        }
        for (var h = 0; h < 36; h++) for (var m = 0; m < 72; m++) {
            var f = 73 * h + m, g = m < 36 ? 74 * h + m : 74 * h + m + 1;
            s[g + 0], s[g + 1], s[g + 74], s[g + 1], s[g + 75], s[g + 74];
            var v = o[f + 0], y = l[f + 0], b = s[g + 0], _ = o[f + 1], C = l[f + 1], w = s[g + 1], P = o[f + 73], E = l[f + 73], T = s[g + 74], k = o[f + 74], S = l[f + 74],
                x = s[g + 75];
            t(v, _, P, y, C, E, b, w, T), t(_, k, P, C, S, E, w, x, T)
        }
        r.build(), a.addPolyList(r);
        var I = bg.Matrix4.Scale(-1, 1, 1);
        return n.addComponent(new bg.scene.Transform(I)), n
    }

    var o = function (e) {
        function t(e) {
            $traceurRuntime.superConstructor(t).call(this), this.stream = e
        }

        return $traceurRuntime.createClass(t, {
            get video() {
                return this.texture ? this.texture.video : null
            }, loaded: function () {
                var e = this;
                return new Promise(function (t) {
                    var n = function () {
                        e.video ? t(e) : setTimeout(n, 100)
                    };
                    n()
                })
            }, buildScene: function () {
                var e = this;
                this._root = new bg.scene.Node(this.gl, "Root node"), bg.base.Loader.RegisterPlugin(new bg.base.TextureLoaderPlugin), bg.base.Loader.RegisterPlugin(new bg.base.VideoTextureLoaderPlugin), bg.base.Loader.RegisterPlugin(new bg.base.VWGLBLoaderPlugin), bg.base.Loader.Load(this.gl, this.stream.src).then(function (t) {
                    e.texture = t;
                    var n = r(e.gl), a = n.component("bg.scene.Drawable");
                    a.getMaterial(0).texture = t, a.getMaterial(0).lightEmission = 1, a.getMaterial(0).lightEmissionMaskInvert = !0, a.getMaterial(0).cullFace = !1, e._root.addChild(n), e.postRedisplay()
                });
                var t = new bg.scene.Node(this.gl, "Light");
                this._root.addChild(t), this._camera = new bg.scene.Camera;
                var n = new bg.scene.Node("Camera");
                n.addComponent(this._camera), n.addComponent(new bg.scene.Transform);
                var a = new bg.manipulation.OrbitCameraController;
                n.addComponent(a), a.maxPitch = 90, a.minPitch = -90, a.maxDistance = 0, a.minDistace = 0, this._root.addChild(n)
            }, init: function () {
                bg.Engine.Set(new bg.webgl1.Engine(this.gl)), this.buildScene(), this._renderer = bg.render.Renderer.Create(this.gl, bg.render.RenderPath.FORWARD), this._inputVisitor = new bg.scene.InputVisitor
            }, frame: function (e) {
                this.texture && this.texture.update(), this._renderer.frame(this._root, e)
            }, display: function () {
                this._renderer.display(this._root, this._camera)
            }, reshape: function (e, t) {
                this._camera.viewport = new bg.Viewport(0, 0, e, t), this._camera.projection.perspective(60, this._camera.viewport.aspectRatio, .1, 100)
            }, mouseDown: function (e) {
                this._inputVisitor.mouseDown(this._root, e)
            }, mouseDrag: function (e) {
                this._inputVisitor.mouseDrag(this._root, e), this.postRedisplay()
            }, mouseWheel: function (e) {
                this._inputVisitor.mouseWheel(this._root, e), this.postRedisplay()
            }, touchStart: function (e) {
                this._inputVisitor.touchStart(this._root, e)
            }, touchMove: function (e) {
                this._inputVisitor.touchMove(this._root, e), this.postRedisplay()
            }, mouseUp: function (e) {
                this._inputVisitor.mouseUp(this._root, e)
            }, mouseMove: function (e) {
                this._inputVisitor.mouseMove(this._root, e)
            }, mouseOut: function (e) {
                this._inputVisitor.mouseOut(this._root, e)
            }, touchEnd: function (e) {
                this._inputVisitor.touchEnd(this._root, e)
            }
        }, {}, e)
    }(bg.app.WindowController), l = new o(e), s = bg.app.MainLoop.singleton;
    return s.updateMode = bg.app.FrameUpdate.AUTO, s.canvas = t, s.run(l), l.loaded()
}

function onYouTubeIframeAPIReady() {
    paella.youtubePlayerVars.apiReadyPromise.resolve()
}

var GlobalParams = {video: {zIndex: 1}, background: {zIndex: 0}}, paella = {};
paella.player = null, paella.version = "5.1.12 - build: ff1b6ca", paella.events = {
    play: "paella:play",
    pause: "paella:pause",
    next: "paella:next",
    previous: "paella:previous",
    seeking: "paella:seeking",
    seeked: "paella:seeked",
    timeupdate: "paella:timeupdate",
    timeUpdate: "paella:timeupdate",
    seekTo: "paella:setseek",
    endVideo: "paella:endvideo",
    seekToTime: "paella:seektotime",
    setTrim: "paella:settrim",
    setPlaybackRate: "paella:setplaybackrate",
    setVolume: "paella:setVolume",
    setComposition: "paella:setComposition",
    loadStarted: "paella:loadStarted",
    loadComplete: "paella:loadComplete",
    loadPlugins: "paella:loadPlugins",
    error: "paella:error",
    setProfile: "paella:setprofile",
    documentChanged: "paella:documentChanged",
    didSaveChanges: "paella:didsavechanges",
    controlBarWillHide: "paella:controlbarwillhide",
    controlBarDidHide: "paella:controlbardidhide",
    controlBarDidShow: "paella:controlbardidshow",
    hidePopUp: "paella:hidePopUp",
    showPopUp: "paella:showPopUp",
    enterFullscreen: "paella:enterFullscreen",
    exitFullscreen: "paella:exitFullscreen",
    resize: "paella:resize",
    qualityChanged: "paella:qualityChanged",
    singleVideoReady: "paella:singleVideoReady",
    singleVideoUnloaded: "paella:singleVideoUnloaded",
    videoReady: "paella:videoReady",
    videoUnloaded: "paella:videoUnloaded",
    controlBarLoaded: "paella:controlBarLoaded",
    flashVideoEvent: "paella:flashVideoEvent",
    captionAdded: "paella:caption:add",
    captionsEnabled: "paella:caption:enabled",
    captionsDisabled: "paella:caption:disabled",
    trigger: function (e, t) {
        $(document).trigger(e, t)
    },
    bind: function (e, t) {
        $(document).bind(e, function (e, n) {
            t(e, n)
        })
    },
    setupExternalListener: function () {
        window.addEventListener("message", function (e) {
            e.data && e.data.event && paella.events.trigger(e.data.event, e.data.params)
        }, !1)
    }
}, paella.events.setupExternalListener(), Class("paella.MouseManager", {
    targetObject: null, initialize: function () {
        var e = this;
        paella.events.bind("mouseup", function (t) {
            e.up(t)
        }), paella.events.bind("mousemove", function (t) {
            e.move(t)
        }), paella.events.bind("mouseover", function (t) {
            e.over(t)
        })
    }, down: function (e, t) {
        return this.targetObject = e, this.targetObject && this.targetObject.down && (this.targetObject.down(t, t.pageX, t.pageY), t.cancelBubble = !0), !1
    }, up: function (e) {
        return this.targetObject && this.targetObject.up && (this.targetObject.up(e, e.pageX, e.pageY), e.cancelBubble = !0), this.targetObject = null, !1
    }, out: function (e) {
        return this.targetObject && this.targetObject.out && (this.targetObject.out(e, e.pageX, e.pageY), e.cancelBubble = !0), !1
    }, move: function (e) {
        return this.targetObject && this.targetObject.move && (this.targetObject.move(e, e.pageX, e.pageY), e.cancelBubble = !0), !1
    }, over: function (e) {
        return this.targetObject && this.targetObject.over && (this.targetObject.over(e, e.pageX, e.pageY), e.cancelBubble = !0), !1
    }
}), paella.utils = {
    mouseManager: new paella.MouseManager, folders: {
        get: function (e) {
            if (paella.player && paella.player.config && paella.player.config.folders && paella.player.config.folders[e]) return paella.player.config.folders[e]
        }, profiles: function () {
            return paella.utils.folders.get("profiles") || "config/profiles"
        }, resources: function () {
            return paella.utils.folders.get("resources") || "resources"
        }, skins: function () {
            return paella.utils.folders.get("skins") || paella.utils.folders.get("resources") + "/style"
        }
    }, styleSheet: {
        removeById: function (e) {
            var t = $(document.head).find("#" + e)[0];
            t && document.head.removeChild(t)
        }, remove: function (e) {
            for (var t = document.head.getElementsByTagName("link"), n = 0; n < t.length; ++n) if (t[n].href) {
                document.head.removeChild(t[n]);
                break
            }
        }, add: function (e, t) {
            var n = document.createElement("link");
            n.rel = "stylesheet", n.href = e, n.type = "text/css", n.media = "screen", n.charset = "utf-8", t && (n.id = t), document.head.appendChild(n)
        }, swap: function (e, t) {
            this.remove(e), this.add(t)
        }
    }, skin: {
        set: function (e) {
            paella.utils.styleSheet.removeById("paellaSkin"), paella.utils.styleSheet.add(paella.utils.folders.skins() + "/style_" + e + ".css"), base.cookies.set("skin", e)
        }, restore: function (e) {
            var t = base.cookies.get("skin");
            t && "" != t ? this.set(t) : this.set(e)
        }
    }, timeParse: {
        timeToSeconds: function (e) {
            var t = 0, n = 0, a = 0;
            return /([0-9]+)h/i.test(e) && (t = 60 * parseInt(RegExp.$1) * 60), /([0-9]+)m/i.test(e) && (n = 60 * parseInt(RegExp.$1)), /([0-9]+)s/i.test(e) && (a = parseInt(RegExp.$1)), t + n + a
        }, secondsToTime: function (e) {
            var t = ~~(e / 3600);
            t < 10 && (t = "0" + t);
            var n = ~~(e % 3600 / 60);
            n < 10 && (n = "0" + n);
            var a = Math.floor(e % 60);
            return a < 10 && (a = "0" + a), t + ":" + n + ":" + a
        }, secondsToText: function (e) {
            if (e <= 1) return base.dictionary.translate("1 second ago");
            if (e < 60) return base.dictionary.translate("{0} seconds ago").replace(/\{0\}/g, e);
            var t = Math.round(e / 60);
            if (t <= 1) return base.dictionary.translate("1 minute ago");
            if (t < 60) return base.dictionary.translate("{0} minutes ago").replace(/\{0\}/g, t);
            var n = Math.round(e / 3600);
            if (n <= 1) return base.dictionary.translate("1 hour ago");
            if (n < 24) return base.dictionary.translate("{0} hours ago").replace(/\{0\}/g, n);
            var a = Math.round(e / 86400);
            if (a <= 1) return base.dictionary.translate("1 day ago");
            if (a < 24) return base.dictionary.translate("{0} days ago").replace(/\{0\}/g, a);
            var i = Math.round(e / 2592e3);
            if (i <= 1) return base.dictionary.translate("1 month ago");
            if (i < 12) return base.dictionary.translate("{0} months ago").replace(/\{0\}/g, i);
            var r = Math.round(e / 31536e3);
            return r <= 1 ? base.dictionary.translate("1 year ago") : base.dictionary.translate("{0} years ago").replace(/\{0\}/g, r)
        }, matterhornTextDateToDate: function (e) {
            var t = new Date;
            return t.setFullYear(parseInt(e.substring(0, 4), 10)), t.setMonth(parseInt(e.substring(5, 7), 10) - 1), t.setDate(parseInt(e.substring(8, 10), 10)), t.setHours(parseInt(e.substring(11, 13), 10)), t.setMinutes(parseInt(e.substring(14, 16), 10)), t.setSeconds(parseInt(e.substring(17, 19), 10)), t
        }
    }
}, Class("paella.DataDelegate", {
    read: function (e, t, n) {
        "function" == typeof n && n({}, !0)
    }, write: function (e, t, n, a) {
        "function" == typeof a && a({}, !0)
    }, remove: function (e, t, n) {
        "function" == typeof n && n({}, !0)
    }
}), paella.dataDelegates = {}, Class("paella.dataDelegates.CookieDataDelegate", paella.DataDelegate, {
    initialize: function () {
    }, serializeKey: function (e, t) {
        return "object" == $traceurRuntime.typeof(t) && (t = JSON.stringify(t)), e + "|" + t
    }, read: function (e, t, n) {
        var a = this.serializeKey(e, t), i = base.cookies.get(a);
        try {
            i = unescape(i), i = JSON.parse(i)
        } catch (e) {
        }
        "function" == typeof n && n(i, !0)
    }, write: function (e, t, n, a) {
        var i = this.serializeKey(e, t);
        "object" == $traceurRuntime.typeof(n) && (n = JSON.stringify(n)), n = escape(n), base.cookies.set(i, n), "function" == typeof a && a({}, !0)
    }, remove: function (e, t, n) {
        var a = this.serializeKey(e, t);
        "object" == $traceurRuntime.typeof(value) && (value = JSON.stringify(value)), base.cookies.set(a, ""), "function" == typeof n && n({}, !0)
    }
}), paella.dataDelegates.DefaultDataDelegate = paella.dataDelegates.CookieDataDelegate, Class("paella.Data", {
    enabled: !1, dataDelegates: {}, initialize: function (e) {
        this.enabled = e.data.enabled;
        for (var t in e.data.dataDelegates) try {
            var n = e.data.dataDelegates[t], a = paella.dataDelegates[n], i = new a;
            this.dataDelegates[t] = i
        } catch (e) {
            base.log.debug("Warning: delegate not found - " + n)
        }
        this.dataDelegates.default || (this.dataDelegates.default = new paella.dataDelegates.DefaultDataDelegate)
    }, read: function (e, t, n) {
        this.getDelegate(e).read(e, t, n)
    }, write: function (e, t, n, a) {
        this.getDelegate(e).write(e, t, n, a)
    }, remove: function (e, t, n) {
        this.getDelegate(e).remove(e, t, n)
    }, getDelegate: function (e) {
        return this.dataDelegates[e] ? this.dataDelegates[e] : this.dataDelegates.default
    }
}), paella.data = null, Class("paella.MessageBox", {
    modalContainerClassName: "modalMessageContainer",
    frameClassName: "frameContainer",
    messageClassName: "messageContainer",
    errorClassName: "errorContainer",
    currentMessageBox: null,
    messageContainer: null,
    onClose: null,
    initialize: function () {
        var e = this;
        $(window).resize(function (t) {
            e.adjustTop()
        })
    },
    showFrame: function (e, t) {
        var n = !0, a = "80%", i = "80%", r = null;
        t && (n = t.closeButton, a = t.width, i = t.height, r = t.onClose), this.doShowFrame(e, n, a, i, r)
    },
    doShowFrame: function (e, t, n, a, i) {
        this.onClose = i, this.currentMessageBox && this.close(), n || (n = "80%"), a || (a = "80%");
        var r = document.createElement("div");
        r.className = this.modalContainerClassName, r.style.position = "fixed", r.style.top = "0px", r.style.left = "0px", r.style.right = "0px", r.style.bottom = "0px", r.style.zIndex = 999999;
        var o = document.createElement("div");
        o.className = this.frameClassName, o.style.width = n, o.style.height = a, o.style.position = "relative", r.appendChild(o);
        var l = document.createElement("iframe");
        l.src = e, l.setAttribute("frameborder", "0"), l.style.width = "100%", l.style.height = "100%", o.appendChild(l), $("body")[0].appendChild(r), this.currentMessageBox = r, this.messageContainer = o;
        this.adjustTop(), t && this.createCloseButton()
    },
    showElement: function (e, t) {
        var n = !0, a = "60%", i = "40%", r = null, o = this.messageClassName;
        t && (o = t.className, n = t.closeButton, a = t.width, i = t.height, r = t.onClose), this.doShowElement(e, n, a, i, o, r)
    },
    showMessage: function (e, t) {
        var n = !0, a = "60%", i = "40%", r = null, o = this.messageClassName;
        t && (o = t.className, n = t.closeButton, a = t.width, i = t.height, r = t.onClose), this.doShowMessage(e, n, a, i, o, r)
    },
    doShowElement: function (e, t, n, a, i, r) {
        this.onClose = r, this.currentMessageBox && this.close(), i || (i = this.messageClassName), n || (n = "80%"), a || (a = "30%");
        var o = document.createElement("div");
        o.className = this.modalContainerClassName, o.style.position = "fixed", o.style.top = "0px", o.style.left = "0px", o.style.right = "0px", o.style.bottom = "0px", o.style.zIndex = 999999;
        var l = document.createElement("div");
        l.className = i, l.style.width = n, l.style.height = a, l.style.position = "relative", l.appendChild(e), o.appendChild(l), $("body")[0].appendChild(o), this.currentMessageBox = o, this.messageContainer = l;
        this.adjustTop(), t && this.createCloseButton()
    },
    doShowMessage: function (e, t, n, a, i, r) {
        this.onClose = r, this.currentMessageBox && this.close(), i || (i = this.messageClassName), n || (n = "80%"), a || (a = "30%");
        var o = document.createElement("div");
        o.className = this.modalContainerClassName, o.style.position = "fixed", o.style.top = "0px", o.style.left = "0px", o.style.right = "0px", o.style.bottom = "0px", o.style.zIndex = 999999;
        var l = document.createElement("div");
        l.className = i, l.style.width = n, l.style.height = a, l.style.position = "relative", l.innerHTML = e, o.appendChild(l), $("body")[0].appendChild(o), this.currentMessageBox = o, this.messageContainer = l;
        this.adjustTop(), t && this.createCloseButton()
    },
    showError: function (e, t) {
        var n = !1, a = "60%", i = "20%", r = null;
        t && (n = t.closeButton, a = t.width, i = t.height, r = t.onClose), this.doShowError(e, n, a, i, r)
    },
    doShowError: function (e, t, n, a, i) {
        this.doShowMessage(e, t, n, a, this.errorClassName, i)
    },
    createCloseButton: function () {
        if (this.messageContainer) {
            var e = this, t = document.createElement("div");
            this.messageContainer.appendChild(t), t.className = "paella_messageContainer_closeButton", $(t).click(function (t) {
                e.onCloseButtonClick()
            })
        }
    },
    adjustTop: function () {
        if (this.currentMessageBox) {
            var e = $(this.messageContainer).outerHeight(), t = $(this.currentMessageBox).height(), n = t / 2 - e / 2;
            this.messageContainer.style.marginTop = n + "px"
        }
    },
    close: function () {
        if (this.currentMessageBox && this.currentMessageBox.parentNode) {
            var e = this.currentMessageBox, t = e.parentNode;
            $(e).animate({opacity: 0}, 300, function () {
                t.removeChild(e)
            }), this.onClose && this.onClose()
        }
    },
    onCloseButtonClick: function () {
        this.close()
    }
}), paella.messageBox = new paella.MessageBox, paella.AntiXSS = {
    htmlEscape: function (e) {
        return String(e).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    }, htmlUnescape: function (e) {
        return String(e).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    }
}, Class("paella.Node", {
    identifier: "", nodeList: null, initialize: function (e) {
        this.nodeList = {}, this.identifier = e
    }, addTo: function (e) {
        e.addNode(this)
    }, addNode: function (e) {
        return this.nodeList[e.identifier] = e, e
    }, getNode: function (e) {
        return this.nodeList[e]
    }, removeNode: function (e) {
        return !!this.nodeList[e.identifier] && (delete this.nodeList[e.identifier], !0)
    }
}), Class("paella.DomNode", paella.Node, {
    domElement: null, initialize: function (e, t, n) {
        this.parent(t), this.domElement = document.createElement(e), this.domElement.id = t, n && $(this.domElement).css(n)
    }, addNode: function (e) {
        var t = this.parent(e);
        return this.domElement.appendChild(e.domElement), t
    }, onresize: function () {
    }, removeNode: function (e) {
        this.parent(e) && this.domElement.removeChild(e.domElement)
    }
}), Class("paella.Button", paella.DomNode, {
    isToggle: !1, initialize: function (e, t, n, a) {
        this.isToggle = a;
        var i = {};
        if (this.parent("div", e, i), this.domElement.className = t, a) {
            var r = this;
            $(this.domElement).click(function (e) {
                r.toggleIcon()
            })
        }
        $(this.domElement).click("click", n)
    }, isToggled: function () {
        if (this.isToggle) {
            return /([a-zA-Z0-9_]+)_active/.test(this.domElement.className)
        }
        return !1
    }, toggle: function () {
        this.toggleIcon()
    }, toggleIcon: function () {
        var e = this.domElement;
        /([a-zA-Z0-9_]+)_active/.test(e.className) ? e.className = RegExp.$1 : e.className = e.className + "_active"
    }, show: function () {
        $(this.domElement).show()
    }, hide: function () {
        $(this.domElement).hide()
    }, visible: function () {
        return this.domElement.visible()
    }
}), Class("paella.VideoQualityStrategy", {
    getParams: function () {
        return paella.player.config.player.videoQualityStrategyParams || {}
    }, getQualityIndex: function (e) {
        return e.length > 0 ? e[e.length - 1] : e
    }
}), Class("paella.BestFitVideoQualityStrategy", paella.VideoQualityStrategy, {
    getQualityIndex: function (e) {
        var t = e.length - 1;
        if (e.length > 0) {
            var n = e[0], a = $(window).width(), i = $(window).height(), r = a * i;
            if (n.res && n.res.w && n.res.h) for (var o = parseInt(n.res.w) * parseInt(n.res.h), l = Math.abs(r - o), s = 0; s < e.length; ++s) {
                var u = e[s].res;
                if (u) {
                    var c = parseInt(e[s].res.w) * parseInt(e[s].res.h), d = Math.abs(r - c);
                    d <= l && (l = d, t = s)
                }
            }
        }
        return t
    }
}), Class("paella.LimitedBestFitVideoQualityStrategy", paella.VideoQualityStrategy, {
    getQualityIndex: function (e) {
        var t = e.length - 1, n = this.getParams();
        if (e.length > 0) {
            var a = null, i = $(window).height(), r = n.maxAutoQualityRes || 720, o = Number.MAX_VALUE;
            e.forEach(function (e, n) {
                if (e.res && e.res.h <= r) {
                    Math.abs(i - e.res.h) < o && (a = e, t = n)
                }
            })
        }
        return t
    }
}), Class("paella.VideoFactory", {
    isStreamCompatible: function (e) {
        return !1
    }, getVideoObject: function (e, t, n) {
        return null
    }
}), paella.videoFactory = {
    _factoryList: [], initFactories: function () {
        if (paella.videoFactories) {
            var e = this;
            paella.player.config.player.methods.forEach(function (t) {
                t.enabled && e.registerFactory(new paella.videoFactories[t.factory])
            }), this.registerFactory(new paella.videoFactories.EmptyVideoFactory)
        }
    }, getVideoObject: function (e, t, n) {
        0 == this._factoryList.length && this.initFactories();
        var a = null;
        return this._factoryList.some(function (e) {
            if (e.isStreamCompatible(t)) return a = e, !0
        }) ? a.getVideoObject(e, t, n) : null
    }, registerFactory: function (e) {
        this._factoryList.push(e)
    }
}, function () {
    var e = function (e) {
        function t(e, n) {
            $traceurRuntime.superConstructor(t).call(this, "div", e), this._stream = n
        }

        return $traceurRuntime.createClass(t, {
            setAutoplay: function () {
                return Promise.reject(new Error("no such compatible video player"))
            }, load: function () {
                return Promise.reject(new Error("no such compatible video player"))
            }, play: function () {
                return Promise.reject(new Error("no such compatible video player"))
            }, pause: function () {
                return Promise.reject(new Error("no such compatible video player"))
            }, isPaused: function () {
                return Promise.reject(new Error("no such compatible video player"))
            }, duration: function () {
                return Promise.reject(new Error("no such compatible video player"))
            }, setCurrentTime: function (e) {
                return Promise.reject(new Error("no such compatible video player"))
            }, currentTime: function () {
                return Promise.reject(new Error("no such compatible video player"))
            }, setVolume: function (e) {
                return Promise.reject(new Error("no such compatible video player"))
            }, volume: function () {
                return Promise.reject(new Error("no such compatible video player"))
            }, setPlaybackRate: function (e) {
                return Promise.reject(new Error("no such compatible video player"))
            }, playbackRate: function () {
                return Promise.reject(new Error("no such compatible video player"))
            }, unload: function () {
                return Promise.reject(new Error("no such compatible video player"))
            }
        }, {}, e)
    }(paella.DomNode);
    paella.AudioElementBase = e, paella.audioFactories = {};
    var t = function () {
        function e() {
        }

        return $traceurRuntime.createClass(e, {
            isStreamCompatible: function (e) {
                return !1
            }, getAudioObject: function (e, t) {
                return null
            }
        }, {})
    }();
    paella.AudioFactory = t, paella.audioFactory = {
        _factoryList: [], initFactories: function () {
            if (paella.audioFactories) {
                var e = this;
                paella.player.config.player.audioMethods = paella.player.config.player.audioMethods || {}, paella.player.config.player.audioMethods.forEach(function (t) {
                    t.enabled && e.registerFactory(new paella.audioFactories[t.factory])
                })
            }
        }, getAudioObject: function (e, t) {
            0 == this._factoryList.length && this.initFactories();
            var n = null;
            return this._factoryList.some(function (e) {
                if (e.isStreamCompatible(t)) return n = e, !0
            }) ? n.getAudioObject(e, t) : null
        }, registerFactory: function (e) {
            this._factoryList.push(e)
        }
    }
}(), function () {
    function e(e) {
        var t = this;
        return new Promise(function (n, a) {
            if (t._ready) n("function" != typeof e || e()); else {
                var i = function () {
                    t.audio.readyState >= t.audio.HAVE_CURRENT_DATA ? (t._ready = !0, n("function" != typeof e || e())) : setTimeout(i, 50)
                };
                i()
            }
        })
    }

    var t = function (t) {
        function n(e, t) {
            $traceurRuntime.superConstructor(n).call(this, e, t), this._streamName = "audio", this._audio = document.createElement("audio"), this.domElement.appendChild(this._audio)
        }

        return $traceurRuntime.createClass(n, {
            get audio() {
                return this._audio
            }, setAutoplay: function (e) {
                this.audio.autoplay = e
            }, load: function () {
                var t = this._stream.sources[this._streamName], n = t.length > 0 ? t[0] : null;
                if (this.audio.innerHTML = "", n) {
                    var a = this.audio.querySelector("source");
                    return a || (a = document.createElement("source"), this.audio.appendChild(a)), a.src = n.src, n.type && (a.type = n.type), this.audio.load(), e.apply(this, [function () {
                        return n
                    }])
                }
                return Promise.reject(new Error("Could not load video: invalid quality stream index"))
            }, play: function () {
                var t = this;
                return e.apply(this, [function () {
                    t.audio.play()
                }])
            }, pause: function () {
                var t = this;
                return e.apply(this, [function () {
                    t.audio.pause()
                }])
            }, isPaused: function () {
                var t = this;
                return e.apply(this, [function () {
                    return t.audio.paused
                }])
            }, duration: function () {
                var t = this;
                return e.apply(this, [function () {
                    return t.audio.duration
                }])
            }, setCurrentTime: function (t) {
                var n = this;
                return e.apply(this, [function () {
                    n.audio.currentTime = t
                }])
            }, currentTime: function () {
                var t = this;
                return e.apply(this, [function () {
                    return t.audio.currentTime
                }])
            }, setVolume: function (t) {
                var n = this;
                return e.apply(this, [function () {
                    return n.audio.volume = t
                }])
            }, volume: function () {
                var t = this;
                return e.apply(this, [function () {
                    return t.audio.volume
                }])
            }, setPlaybackRate: function (t) {
                var n = this;
                return e.apply(this, [function () {
                    n.audio.playbackRate = t
                }])
            }, playbackRate: function () {
                var t = this;
                return e.apply(this, [function () {
                    return t.audio.playbackRate
                }])
            }, unload: function () {
                return Promise.resolve()
            }
        }, {}, t)
    }(paella.AudioElementBase);
    paella.MultiformatAudioElement = t;
    var n = function () {
        function e() {
        }

        return $traceurRuntime.createClass(e, {
            isStreamCompatible: function (e) {
                return !0
            }, getAudioObject: function (e, t) {
                return new paella.MultiformatAudioElement(e, t)
            }
        }, {})
    }();
    paella.audioFactories.MultiformatAudioFactory = n
}(), paella.Profiles = {
    profileList: null, getDefaultProfile: function () {
        return paella.player.videoContainer.masterVideo() && paella.player.videoContainer.masterVideo().defaultProfile() ? paella.player.videoContainer.masterVideo().defaultProfile() : paella.player && paella.player.config && paella.player.config.defaultProfile ? paella.player.config.defaultProfile : void 0
    }, loadProfile: function (e, t) {
        var n = this.getDefaultProfile();
        this.loadProfileList(function (a) {
            var i;
            if (a[e]) i = a[e]; else {
                if (!a[n]) return base.log.debug("Error loading the default profile. Check your Paella Player configuration"), !1;
                i = a[n]
            }
            t(i)
        })
    }, loadProfileList: function (e) {
        var t = this;
        if (null == this.profileList) {
            var n = {url: paella.utils.folders.profiles() + "/profiles.json"};
            base.ajax.get(n, function (n, a, i) {
                "string" == typeof n && (n = JSON.parse(n)), t.profileList = n, e(t.profileList)
            }, function (e, t, n) {
                base.log.debug("Error loading video profiles. Check your Paella Player configuration")
            })
        } else e(t.profileList)
    }
}, Class("paella.RelativeVideoSize", {
    w: 1280, h: 720, proportionalHeight: function (e) {
        return Math.floor(this.h * e / this.w)
    }, proportionalWidth: function (e) {
        return Math.floor(this.w * e / this.h)
    }, percentVSize: function (e) {
        return 100 * e / this.h
    }, percentWSize: function (e) {
        return 100 * e / this.w
    }, aspectRatio: function () {
        return this.w / this.h
    }
}), Class("paella.VideoRect", paella.DomNode, {
    _rect: null, initialize: function (e, t, n, a, i, r) {
        this._rect = {left: n, top: a, width: i, height: r};
        var o = new paella.RelativeVideoSize, l = o.percentVSize(a) + "%", s = o.percentWSize(n) + "%", u = o.percentWSize(i) + "%", c = o.percentVSize(r) + "%",
            d = {top: l, left: s, width: u, height: c, position: "absolute", zIndex: GlobalParams.video.zIndex};
        this.parent(t, e, d)
    }, setRect: function (e, t) {
        this._rect = JSON.parse(JSON.stringify(e));
        var n = new paella.RelativeVideoSize, a = n.percentVSize(e.top) + "%", i = n.percentWSize(e.left) + "%", r = n.percentWSize(e.width) + "%",
            o = n.percentVSize(e.height) + "%", l = {top: a, left: i, width: r, height: o, position: "absolute"};
        if (t) {
            this.disableClassName();
            var s = this;
            $(this.domElement).animate(l, 400, function () {
                s.enableClassName(), paella.events.trigger(paella.events.setComposition, {video: s})
            }), this.enableClassNameAfter(400)
        } else $(this.domElement).css(l), paella.events.trigger(paella.events.setComposition, {video: this})
    }, getRect: function () {
        return this._rect
    }, disableClassName: function () {
        this.classNameBackup = this.domElement.className, this.domElement.className = ""
    }, enableClassName: function () {
        this.domElement.className = this.classNameBackup
    }, enableClassNameAfter: function (e) {
        setTimeout("$('#" + this.domElement.id + "')[0].className = '" + this.classNameBackup + "'", e)
    }, setVisible: function (e, t) {
        "true" == e && t ? ($(this.domElement).show(), $(this.domElement).animate({opacity: 1}, 300)) : "true" != e || t ? "false" == e && t ? $(this.domElement).animate({opacity: 0}, 300) : "false" != e || t || $(this.domElement).hide() : $(this.domElement).show()
    }, setLayer: function (e) {
        this.domElement.style.zIndex = e
    }
}), Class("paella.VideoElementBase", paella.VideoRect, {
    _ready: !1, _autoplay: !1, _stream: null, _videoQualityStrategy: null, initialize: function (e, t, n, a, i, r, o) {
        this._stream = t, this.parent(e, n, a, i, r, o), Object.defineProperty(this, "ready", {
            get: function () {
                return this._ready
            }
        }), this._stream.preview && this.setPosterFrame(this._stream.preview)
    }, defaultProfile: function () {
        return null
    }, setVideoQualityStrategy: function (e) {
        this._videoQualityStrategy = e
    }, setPosterFrame: function (e) {
        base.log.debug("TODO: implement setPosterFrame() function")
    }, setAutoplay: function (e) {
        this._autoplay = e
    }, setMetadata: function (e) {
        this._metadata = e
    }, load: function () {
        return paella_DeferredNotImplemented()
    }, getVideoData: function () {
        return paella_DeferredNotImplemented()
    }, play: function () {
        return base.log.debug("TODO: implement play() function in your VideoElementBase subclass"), paella_DeferredNotImplemented()
    }, pause: function () {
        return base.log.debug("TODO: implement pause() function in your VideoElementBase subclass"), paella_DeferredNotImplemented()
    }, isPaused: function () {
        return base.log.debug("TODO: implement isPaused() function in your VideoElementBase subclass"), paella_DeferredNotImplemented()
    }, duration: function () {
        return base.log.debug("TODO: implement duration() function in your VideoElementBase subclass"), paella_DeferredNotImplemented()
    }, setCurrentTime: function (e) {
        return base.log.debug("TODO: implement setCurrentTime() function in your VideoElementBase subclass"), paella_DeferredNotImplemented()
    }, currentTime: function () {
        return base.log.debug("TODO: implement currentTime() function in your VideoElementBase subclass"), paella_DeferredNotImplemented()
    }, setVolume: function (e) {
        return base.log.debug("TODO: implement setVolume() function in your VideoElementBase subclass"), paella_DeferredNotImplemented()
    }, volume: function () {
        return base.log.debug("TODO: implement volume() function in your VideoElementBase subclass"), paella_DeferredNotImplemented()
    }, setPlaybackRate: function (e) {
        return base.log.debug("TODO: implement setPlaybackRate() function in your VideoElementBase subclass"), paella_DeferredNotImplemented()
    }, playbackRate: function () {
        return base.log.debug("TODO: implement playbackRate() function in your VideoElementBase subclass"), paella_DeferredNotImplemented()
    }, getQualities: function () {
        return paella_DeferredNotImplemented()
    }, setQuality: function (e) {
        return paella_DeferredNotImplemented()
    }, getCurrentQuality: function () {
        return paella_DeferredNotImplemented()
    }, unload: function () {
        return this._callUnloadEvent(), paella_DeferredNotImplemented()
    }, getDimensions: function () {
        return paella_DeferredNotImplemented()
    }, goFullScreen: function () {
        return paella_DeferredNotImplemented()
    }, freeze: function () {
        return paella_DeferredNotImplemented()
    }, unFreeze: function () {
        return paella_DeferredNotImplemented()
    }, setClassName: function (e) {
        this.domElement.className = e
    }, _callReadyEvent: function () {
        paella.events.trigger(paella.events.singleVideoReady, {sender: this})
    }, _callUnloadEvent: function () {
        paella.events.trigger(paella.events.singleVideoUnloaded, {sender: this})
    }
}), Class("paella.EmptyVideo", paella.VideoElementBase, {
    initialize: function (e, t, n, a, i, r) {
        this.parent(e, t, "div", n, a, i, r)
    }, setPosterFrame: function (e) {
    }, setAutoplay: function (e) {
    }, load: function () {
        return paella_DeferredRejected(new Error("no such compatible video player"))
    }, play: function () {
        return paella_DeferredRejected(new Error("no such compatible video player"))
    }, pause: function () {
        return paella_DeferredRejected(new Error("no such compatible video player"))
    }, isPaused: function () {
        return paella_DeferredRejected(new Error("no such compatible video player"))
    }, duration: function () {
        return paella_DeferredRejected(new Error("no such compatible video player"))
    }, setCurrentTime: function (e) {
        return paella_DeferredRejected(new Error("no such compatible video player"))
    }, currentTime: function () {
        return paella_DeferredRejected(new Error("no such compatible video player"))
    }, setVolume: function (e) {
        return paella_DeferredRejected(new Error("no such compatible video player"))
    }, volume: function () {
        return paella_DeferredRejected(new Error("no such compatible video player"))
    }, setPlaybackRate: function (e) {
        return paella_DeferredRejected(new Error("no such compatible video player"))
    }, playbackRate: function () {
        return paella_DeferredRejected(new Error("no such compatible video player"))
    }, unFreeze: function () {
        return paella_DeferredRejected(new Error("no such compatible video player"))
    }, freeze: function () {
        return paella_DeferredRejected(new Error("no such compatible video player"))
    }, unload: function () {
        return paella_DeferredRejected(new Error("no such compatible video player"))
    }, getDimensions: function () {
        return paella_DeferredRejected(new Error("no such compatible video player"))
    }
}), Class("paella.videoFactories.EmptyVideoFactory", paella.VideoFactory, {
    isStreamCompatible: function (e) {
        return !0
    }, getVideoObject: function (e, t, n) {
        return new paella.EmptyVideo(e, t, n.x, n.y, n.w, n.h)
    }
}), Class("paella.Html5Video", paella.VideoElementBase, {
    _posterFrame: null, _currentQuality: null, _autoplay: !1, _streamName: null, initialize: function (e, t, n, a, i, r, o) {
        function l(e) {
            u._ready || 4 != u.video.readyState || (u._ready = !0, void 0 !== u._initialCurrentTipe && (u.video.currentTime = u._initialCurrentTime, delete u._initialCurrentTime), u._callReadyEvent())
        }

        function s(e) {
            l.apply(u, e)
        }

        this.parent(e, t, "video", n, a, i, r), this._streamName = o || "mp4";
        var u = this;
        this._playbackRate = 1, this._stream.sources[this._streamName] && this._stream.sources[this._streamName].sort(function (e, t) {
            return e.res.h - t.res.h
        }), Object.defineProperty(this, "video", {
            get: function () {
                return u.domElement
            }
        }), this.video.preload = "auto", this.video.setAttribute("playsinline", ""), $(this.video).bind("progress", s), $(this.video).bind("loadstart", s), $(this.video).bind("loadedmetadata", s), $(this.video).bind("canplay", s), $(this.video).bind("oncanplay", s)
    }, _deferredAction: function (e) {
        var t = this;
        return new Promise(function (n, a) {
            t.ready ? n(e()) : $(t.video).bind("canplay", function () {
                t._ready = !0, n(e())
            })
        })
    }, _getQualityObject: function (e, t) {
        return {
            index: e, res: t.res, src: t.src, toString: function () {
                return this.res.w + "x" + this.res.h
            }, shortLabel: function () {
                return this.res.h + "p"
            }, compare: function (e) {
                return this.res.w * this.res.h - e.res.w * e.res.h
            }
        }
    }, getVideoData: function () {
        var e = this, t = this;
        return new Promise(function (n, a) {
            e._deferredAction(function () {
                n({
                    duration: t.video.duration,
                    currentTime: t.video.currentTime,
                    volume: t.video.volume,
                    paused: t.video.paused,
                    ended: t.video.ended,
                    res: {w: t.video.videoWidth, h: t.video.videoHeight}
                })
            })
        })
    }, setPosterFrame: function (e) {
        this._posterFrame = e
    }, setAutoplay: function (e) {
        this._autoplay = e, e && this.video && this.video.setAttribute("autoplay", e)
    }, load: function () {
        var e = this._stream.sources[this._streamName];
        null === this._currentQuality && this._videoQualityStrategy && (this._currentQuality = this._videoQualityStrategy.getQualityIndex(e));
        var t = this._currentQuality < e.length ? e[this._currentQuality] : null;
        if (this.video.innerHTML = "", t) {
            var n = this.video.querySelector("source");
            return n || (n = document.createElement("source"), this.video.appendChild(n)), this._posterFrame && this.video.setAttribute("poster", this._posterFrame), n.src = t.src, n.type = t.type, this.video.load(), this.video.playbackRate = this._playbackRate, this._deferredAction(function () {
                return t
            })
        }
        return paella_DeferredRejected(new Error("Could not load video: invalid quality stream index"))
    }, getQualities: function () {
        var e = this;
        return new Promise(function (t, n) {
            setTimeout(function () {
                var n = [], a = e._stream.sources[e._streamName], i = -1;
                a.forEach(function (t) {
                    i++, n.push(e._getQualityObject(i, t))
                }), t(n)
            }, 10)
        })
    }, setQuality: function (e) {
        var t = this;
        return new Promise(function (n) {
            var a = t.video.paused, i = t._stream.sources[t._streamName];
            t._currentQuality = e < i.length ? e : 0;
            var r = t.video.currentTime;
            t.freeze().then(function () {
                return t._ready = !1, t.load()
            }).then(function () {
                a || t.play(), $(t.video).on("seeked", function () {
                    t.unFreeze(), n(), $(t.video).off("seeked")
                }), t.video.currentTime = r
            })
        })
    }, getCurrentQuality: function () {
        var e = this;
        return new Promise(function (t) {
            t(e._getQualityObject(e._currentQuality, e._stream.sources[e._streamName][e._currentQuality]))
        })
    }, play: function () {
        var e = this;
        return this._deferredAction(function () {
            e.video.play()
        })
    }, pause: function () {
        var e = this;
        return this._deferredAction(function () {
            e.video.pause()
        })
    }, isPaused: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.paused
        })
    }, duration: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.duration
        })
    }, setCurrentTime: function (e) {
        var t = this;
        return this._deferredAction(function () {
            t.video.currentTime = e
        })
    }, currentTime: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.currentTime
        })
    }, setVolume: function (e) {
        var t = this;
        return this._deferredAction(function () {
            t.video.volume = e
        })
    }, volume: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.volume
        })
    }, setPlaybackRate: function (e) {
        var t = this;
        return this._deferredAction(function () {
            t._playbackRate = e, t.video.playbackRate = e
        })
    }, playbackRate: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.playbackRate
        })
    }, goFullScreen: function () {
        var e = this;
        return this._deferredAction(function () {
            var t = e.video;
            t.requestFullscreen ? t.requestFullscreen() : t.msRequestFullscreen ? t.msRequestFullscreen() : t.mozRequestFullScreen ? t.mozRequestFullScreen() : t.webkitEnterFullscreen && t.webkitEnterFullscreen()
        })
    }, unFreeze: function () {
        var e = this;
        return this._deferredAction(function () {
            var t = document.getElementById(e.video.className + "canvas");
            $(t).remove()
        })
    }, freeze: function () {
        var e = this;
        return this._deferredAction(function () {
            var t = document.createElement("canvas");
            t.id = e.video.className + "canvas", t.width = e.video.videoWidth, t.height = e.video.videoHeight, t.style.cssText = e.video.style.cssText, t.style.zIndex = 2, t.getContext("2d").drawImage(e.video, 0, 0, 16 * Math.ceil(t.width / 16), 16 * Math.ceil(t.height / 16)), e.video.parentElement.appendChild(t)
        })
    }, unload: function () {
        return this._callUnloadEvent(), paella_DeferredNotImplemented()
    }, getDimensions: function () {
        return paella_DeferredNotImplemented()
    }
}), Class("paella.videoFactories.Html5VideoFactory", {
    isStreamCompatible: function (e) {
        try {
            if (paella.videoFactories.Html5VideoFactory.s_instances > 0 && base.userAgent.system.iOS) return !1;
            for (var t in e.sources) if ("mp4" == t) return !0
        } catch (e) {
        }
        return !1
    }, getVideoObject: function (e, t, n) {
        return ++paella.videoFactories.Html5VideoFactory.s_instances, new paella.Html5Video(e, t, n.x, n.y, n.w, n.h)
    }
}), paella.videoFactories.Html5VideoFactory.s_instances = 0, Class("paella.ImageVideo", paella.VideoElementBase, {
    _posterFrame: null,
    _currentQuality: null,
    _currentTime: 0,
    _duration: 0,
    _ended: !1,
    _playTimer: null,
    _playbackRate: 1,
    _frameArray: null,
    initialize: function (e, t, n, a, i, r) {
        this.parent(e, t, "img", n, a, i, r);
        var o = this;
        this._stream.sources.image.sort(function (e, t) {
            return e.res.h - t.res.h
        }), Object.defineProperty(this, "img", {
            get: function () {
                return o.domElement
            }
        }), Object.defineProperty(this, "imgStream", {
            get: function () {
                return this._stream.sources.image[this._currentQuality]
            }
        }), Object.defineProperty(this, "_paused", {
            get: function () {
                return null == this._playTimer
            }
        })
    },
    _deferredAction: function (e) {
        var t = this;
        return new Promise(function (n) {
            if (t.ready) n(e()); else {
                var n = function () {
                    t._ready = !0, n(e())
                };
                $(t.video).bind("paella:imagevideoready", n)
            }
        })
    },
    _getQualityObject: function (e, t) {
        return {
            index: e, res: t.res, src: t.src, toString: function () {
                return this.res.w + "x" + this.res.h
            }, shortLabel: function () {
                return this.res.h + "p"
            }, compare: function (e) {
                return this.res.w * this.res.h - e.res.w * e.res.h
            }
        }
    },
    _loadCurrentFrame: function () {
        var e = this;
        if (this._frameArray) {
            var t = this._frameArray[0];
            this._frameArray.some(function (n) {
                if (e._currentTime < n.time) return !0;
                t = n.src
            }), this.img.src = t
        }
    },
    getVideoData: function () {
        var e = this, t = this;
        return new Promise(function (n) {
            e._deferredAction(function () {
                var e = {duration: t._duration, currentTime: t._currentTime, volume: 0, paused: t._paused, ended: t._ended, res: {w: t.imgStream.res.w, h: t.imgStream.res.h}};
                n(e)
            })
        })
    },
    setPosterFrame: function (e) {
        this._posterFrame = e
    },
    setAutoplay: function (e) {
        this._autoplay = e, e && this.video && this.video.setAttribute("autoplay", e)
    },
    load: function () {
        var e = this._stream.sources.image;
        null === this._currentQuality && this._videoQualityStrategy && (this._currentQuality = this._videoQualityStrategy.getQualityIndex(e));
        var t = this._currentQuality < e.length ? e[this._currentQuality] : null;
        if (t) {
            this._frameArray = [];
            for (var n in t.frames) {
                var a = Math.floor(Number(n.replace("frame_", "")));
                this._frameArray.push({src: t.frames[n], time: a})
            }
            return this._frameArray.sort(function (e, t) {
                return e.time - t.time
            }), this._ready = !0, this._currentTime = 0, this._duration = t.duration, this._loadCurrentFrame(), paella.events.trigger("paella:imagevideoready"), this._deferredAction(function () {
                return t
            })
        }
        return paella_DeferredRejected(new Error("Could not load video: invalid quality stream index"))
    },
    getQualities: function () {
        var e = this;
        return new Promise(function (t) {
            setTimeout(function () {
                var n = [], a = e._stream.sources[e._streamName], i = -1;
                a.forEach(function (t) {
                    i++, n.push(e._getQualityObject(i, t))
                }), t(n)
            }, 10)
        })
    },
    setQuality: function (e) {
        var t = this;
        return new Promise(function (n) {
            var a = (t._paused, t._stream.sources.image);
            t._currentQuality = e < a.length ? e : 0;
            t._currentTime;
            t.load().then(function () {
                this._loadCurrentFrame(), n()
            })
        })
    },
    getCurrentQuality: function () {
        var e = this;
        return new Promise(function (t) {
            t(e._getQualityObject(e._currentQuality, e._stream.sources.image[e._currentQuality]))
        })
    },
    play: function () {
        var e = this;
        return this._deferredAction(function () {
            e._playTimer = new base.Timer(function () {
                e._currentTime += .25 * e._playbackRate, e._loadCurrentFrame()
            }, 250), e._playTimer.repeat = !0
        })
    },
    pause: function () {
        var e = this;
        return this._deferredAction(function () {
            e._playTimer.repeat = !1, e._playTimer = null
        })
    },
    isPaused: function () {
        var e = this;
        return this._deferredAction(function () {
            return e._paused
        })
    },
    duration: function () {
        var e = this;
        return this._deferredAction(function () {
            return e._duration
        })
    },
    setCurrentTime: function (e) {
        var t = this;
        return this._deferredAction(function () {
            t._currentTime = e, t._loadCurrentFrame()
        })
    },
    currentTime: function () {
        var e = this;
        return this._deferredAction(function () {
            return e._currentTime
        })
    },
    setVolume: function (e) {
        return this._deferredAction(function () {
        })
    },
    volume: function () {
        return this._deferredAction(function () {
            return 0
        })
    },
    setPlaybackRate: function (e) {
        var t = this;
        return this._deferredAction(function () {
            t._playbackRate = e
        })
    },
    playbackRate: function () {
        var e = this;
        return this._deferredAction(function () {
            return e._playbackRate
        })
    },
    goFullScreen: function () {
        var e = this;
        return this._deferredAction(function () {
            var t = e.img;
            t.requestFullscreen ? t.requestFullscreen() : t.msRequestFullscreen ? t.msRequestFullscreen() : t.mozRequestFullScreen ? t.mozRequestFullScreen() : t.webkitEnterFullscreen && t.webkitEnterFullscreen()
        })
    },
    unFreeze: function () {
        return this._deferredAction(function () {
        })
    },
    freeze: function () {
        return this._deferredAction(function () {
        })
    },
    unload: function () {
        return this._callUnloadEvent(), paella_DeferredNotImplemented()
    },
    getDimensions: function () {
        return paella_DeferredNotImplemented()
    }
}), Class("paella.videoFactories.ImageVideoFactory", {
    isStreamCompatible: function (e) {
        try {
            for (var t in e.sources) if ("image" == t) return !0
        } catch (e) {
        }
        return !1
    }, getVideoObject: function (e, t, n) {
        return new paella.ImageVideo(e, t, n.x, n.y, n.w, n.h)
    }
}), Class("paella.BackgroundContainer", paella.DomNode, {
    initialize: function (e, t) {
        this.parent("img", e, {
            position: "relative",
            top: "0px",
            left: "0px",
            right: "0px",
            bottom: "0px",
            zIndex: GlobalParams.background.zIndex
        }), this.domElement.setAttribute("src", t), this.domElement.setAttribute("alt", ""), this.domElement.setAttribute("width", "100%"), this.domElement.setAttribute("height", "100%")
    }, setImage: function (e) {
        this.domElement.setAttribute("src", e)
    }
}), Class("paella.VideoOverlay", paella.DomNode, {
    size: {w: 1280, h: 720}, initialize: function () {
        var e = {position: "absolute", left: "0px", right: "0px", top: "0px", bottom: "0px", overflow: "hidden", zIndex: 10};
        this.parent("div", "overlayContainer", e), this.domElement.setAttribute("role", "main")
    }, _generateId: function () {
        return Math.ceil(Date.now() * Math.random())
    }, enableBackgroundMode: function () {
        this.domElement.className = "overlayContainer background"
    }, disableBackgroundMode: function () {
        this.domElement.className = "overlayContainer"
    }, clear: function () {
        this.domElement.innerHTML = ""
    }, getMasterRect: function () {
        return paella.player.videoContainer.getMasterVideoRect()
    }, getSlaveRect: function () {
        return paella.player.videoContainer.getSlaveVideoRect()
    }, addText: function (e, t, n) {
        var a = document.createElement("div");
        return a.innerHTML = e, a.className = "videoOverlayText", n && (a.style.backgroundColor = "red"), this.addElement(a, t)
    }, addElement: function (e, t) {
        return this.domElement.appendChild(e), e.style.position = "absolute", e.style.left = this.getHSize(t.left) + "%", e.style.top = this.getVSize(t.top) + "%", e.style.width = this.getHSize(t.width) + "%", e.style.height = this.getVSize(t.height) + "%", e
    }, getLayer: function (e, t) {
        return e = e || this._generateId(), $(this.domElement).find("#" + e)[0] || this.addLayer(e, t)
    }, addLayer: function (e, t) {
        t = t || 10;
        var n = document.createElement("div");
        return n.className = "row", n.id = e || this._generateId(), this.addElement(n, {left: 0, top: 0, width: 1280, height: 720})
    }, removeLayer: function (e) {
        var t = $(this.domElement).find("#" + e)[0];
        t && this.domElement.removeChild(t)
    }, removeElement: function (e) {
        if (e) try {
            this.domElement.removeChild(e)
        } catch (e) {
        }
    }, getVSize: function (e) {
        return 100 * e / this.size.h
    }, getHSize: function (e) {
        return 100 * e / this.size.w
    }
}), Class("paella.VideoContainerBase", paella.DomNode, {
    _trimming: {enabled: !1, start: 0, end: 0},
    timeupdateEventTimer: null,
    timeupdateInterval: 250,
    masterVideoData: null,
    slaveVideoData: null,
    currentMasterVideoData: null,
    currentSlaveVideoData: null,
    _force: !1,
    _playOnClickEnabled: !0,
    initialize: function (e) {
        var t = this, n = {position: "absolute", left: "0px", right: "0px", top: "0px", bottom: "0px", overflow: "hidden"};
        this.parent("div", e, n), $(this.domElement).click(function (e) {
            t.firstClick && base.userAgent.browser.IsMobileVersion || t.firstClick && !t._playOnClickEnabled || paella.player.videoContainer.paused().then(function (e) {
                t.firstClick = !0, e ? paella.player.play() : paella.player.pause()
            })
        }), this.domElement.addEventListener("touchstart", function (e) {
            paella.player.controls && paella.player.controls.restartHideTimer()
        })
    },
    triggerTimeupdate: function () {
        var e = this, t = 0, n = 0;
        this.paused().then(function (n) {
            return t = n, e.duration()
        }).then(function (t) {
            return n = t, e.currentTime()
        }).then(function (a) {
            t && !e._force || (e._force = !1, paella.events.trigger(paella.events.timeupdate, {videoContainer: e, currentTime: a, duration: n}))
        })
    },
    startTimeupdate: function () {
        var e = this;
        this.timeupdateEventTimer = new Timer(function (t) {
            e.triggerTimeupdate()
        }, this.timeupdateInterval), this.timeupdateEventTimer.repeat = !0
    },
    stopTimeupdate: function () {
        this.timeupdateEventTimer && (this.timeupdateEventTimer.repeat = !1), this.timeupdateEventTimer = null
    },
    enablePlayOnClick: function () {
        this._playOnClickEnabled = !0
    },
    disablePlayOnClick: function () {
        this._playOnClickEnabled = !1
    },
    isPlayOnClickEnabled: function () {
        return this._playOnClickEnabled
    },
    play: function () {
        paella.events.trigger(paella.events.play), this.startTimeupdate()
    },
    pause: function () {
        paella.events.trigger(paella.events.pause), this.stopTimeupdate()
    },
    seekTo: function (e) {
        var t = this, n = this;
        this.setCurrentPercent(e).then(function (a) {
            n._force = !0, t.triggerTimeupdate(), paella.events.trigger(paella.events.seekToTime, {newPosition: a.time}), paella.events.trigger(paella.events.seekTo, {newPositionPercent: e})
        })
    },
    seekToTime: function (e) {
        var t = this;
        this.setCurrentTime(e).then(function (e) {
            t._force = !0, t.triggerTimeupdate();
            var n = 100 * e.time / e.duration;
            paella.events.trigger(paella.events.seekToTime, {newPosition: e.time}), paella.events.trigger(paella.events.seekTo, {newPositionPercent: n})
        })
    },
    setPlaybackRate: function (e) {
        paella.events.trigger(paella.events.setPlaybackRate, {rate: e})
    },
    setVolume: function (e) {
    },
    volume: function () {
        return 1
    },
    trimStart: function () {
        var e = this;
        return new Promise(function (t) {
            t(e._trimming.start)
        })
    },
    trimEnd: function () {
        var e = this;
        return new Promise(function (t) {
            t(e._trimming.end)
        })
    },
    trimEnabled: function () {
        var e = this;
        return new Promise(function (t) {
            t(e._trimming.enabled)
        })
    },
    trimming: function () {
        var e = this;
        return new Promise(function (t) {
            t(e._trimming)
        })
    },
    enableTrimming: function () {
        this._trimming.enabled = !0, paella.events.trigger(paella.events.setTrim, {
            trimEnabled: this._trimming.enabled,
            trimStart: this._trimming.start,
            trimEnd: this._trimming.end
        })
    },
    disableTrimming: function () {
        this._trimming.enabled = !1, paella.events.trigger(paella.events.setTrim, {
            trimEnabled: this._trimming.enabled,
            trimStart: this._trimming.start,
            trimEnd: this._trimming.end
        })
    },
    setTrimming: function (e, t) {
        var n = this;
        return new Promise(function (a) {
            var i = 0, r = 0;
            n.currentTime().then(function (e) {
                return i = e, n.duration()
            }).then(function (o) {
                r = o, n._trimming.start = Math.floor(e), n._trimming.end = Math.floor(t), i < n._trimming.start && n.setCurrentTime(n._trimming.start), i > n._trimming.end && n.setCurrentTime(n._trimming.end), paella.events.trigger(paella.events.setTrim, {
                    trimEnabled: n._trimming.enabled,
                    trimStart: n._trimming.start,
                    trimEnd: n._trimming.end
                }), a()
            })
        })
    },
    setTrimmingStart: function (e) {
        return this.setTrimming(e, this._trimming.end)
    },
    setTrimmingEnd: function (e) {
        return this.setTrimming(this._trimming.start, e)
    },
    setCurrentPercent: function (e) {
        var t = this, n = this, a = 0;
        return new Promise(function (i) {
            t.duration().then(function (e) {
                return a = e, n.trimming()
            }).then(function (t) {
                var i = 0;
                if (t.enabled) {
                    var r = t.start, o = t.end;
                    a = o - r;
                    var l = e * a / 100;
                    i = parseFloat(l)
                } else i = e * a / 100;
                return n.setCurrentTime(i)
            }).then(function (e) {
                i(e)
            })
        })
    },
    setCurrentTime: function (e) {
        base.log.debug("VideoContainerBase.setCurrentTime(" + e + ")")
    },
    currentTime: function () {
        return base.log.debug("VideoContainerBase.currentTime()"), 0
    },
    duration: function () {
        return base.log.debug("VideoContainerBase.duration()"), 0
    },
    paused: function () {
        return base.log.debug("VideoContainerBase.paused()"), !0
    },
    setupVideo: function (e) {
        base.log.debug("VideoContainerBase.setupVide()")
    },
    isReady: function () {
        return base.log.debug("VideoContainerBase.isReady()"), !0
    },
    onresize: function () {
        this.parent(onresize)
    }
}), Class("paella.ProfileFrameStrategy", {
    valid: function () {
        return !0
    }, adaptFrame: function (e, t) {
        return t
    }
}), Class("paella.LimitedSizeProfileFrameStrategy", paella.ProfileFrameStrategy, {
    adaptFrame: function (e, t) {
        if (e.width < t.width || e.height < t.height) {
            var n = JSON.parse(JSON.stringify(t));
            n.width = e.width, n.height = e.height;
            var a = {w: t.width - e.width, h: t.height - e.height};
            return n.top = n.top + a.h / 2, n.left = n.left + a.w / 2, n
        }
        return t
    }
}), function () {
    var e = function () {
        function e(e) {
            this._masterVideo = null, this._slaveVideos = [], this._videoStreams = [], this._audioStreams = []
        }

        return $traceurRuntime.createClass(e, {
            init: function (e) {
                var t = this;
                if (0 == e.length) throw Error("Empty video data.");
                if (this._videoData = e, this._videoData.some(function (e) {
                        return "master" == e.role
                    }) || (this._videoData[0].role = "master"), this._videoData.forEach(function (e, n) {
                        e.type = e.type || "video", "master" == e.role ? t._masterVideo = e : "video" == e.type && t._slaveVideos.push(e), "video" == e.type ? t._videoStreams.push(e) : "audio" == e.type && t._audioStreams.push(e)
                    }), 0 == this._videoStreams.length) throw new Error("No video streams found. Paella Player requires at least one video stream.")
            }, get masterVideo() {
                return this._masterVideo
            }, get slaveVideos() {
                return this._slaveVideos
            }, get mainSlaveVideo() {
                return this._slaveVideos.length > 0 ? this._slaveVideos[0] : null
            }, get audioStreams() {
                return this._audioStreams
            }, get isLiveStreaming() {
                return paella.player.isLiveStream()
            }
        }, {})
    }();
    paella.StreamProvider = e
}();
var VideoContainer = function (e) {
    function t(e) {
        $traceurRuntime.superConstructor(t).call(this, e), this.containerId = "", this.video1Id = "", this.videoSlaveId = "", this.backgroundId = "", this.container = null, this.profileFrameStrategy = null, this.videoClasses = {
            master: "video masterVideo",
            slave: "video slaveVideo"
        }, this.isHidden = !1, this.logos = null, this.overlayContainer = null, this.videoSyncTimeMillis = 5e3, this.currentMasterVideoRect = {}, this.currentSlaveVideoRect = {}, this._maxSyncDelay = .5, this._isMonostream = !1, this._videoQualityStrategy = null, this._sourceData = null, this._isMasterReady = !1, this._isSlaveReady = !1, this._firstLoad = !1, this._playOnLoad = !1, this._seekToOnLoad = 0, this._defaultMasterVolume = 1, this._defaultSlaveVolume = 1, this._showPosterFrame = !0, this._currentProfile = null;
        var n = this;
        this._sourceData = [], this.containerId = e + "_container", this.video1Id = e + "_master", this.videoSlaveId = e + "_slave_", this.audioId = e + "_audio_", this.backgroundId = e + "_bkg", this.logos = [], this._videoQualityStrategy = this._getQualityStrategyObject(), this.container = new paella.DomNode("div", this.containerId, {
            position: "relative",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            width: "1024px",
            height: "567px"
        }), this.container.domElement.setAttribute("role", "main"), this.addNode(this.container), this.overlayContainer = new paella.VideoOverlay(this.domElement), this.container.addNode(this.overlayContainer), this.container.addNode(new paella.BackgroundContainer(this.backgroundId, paella.utils.folders.profiles() + "/resources/default_background_paella.jpg")), Object.defineProperty(this, "sourceData", {
            get: function () {
                return this._sourceData
            }
        }), new base.Timer(function (e) {
            n.syncVideos()
        }, n.videoSyncTimeMillis).repeat = !0;
        var a = paella.player.config;
        try {
            var i = a.player.profileFrameStrategy, r = Class.fromString(i), o = new r;
            dynamic_cast("paella.ProfileFrameStrategy", o) && this.setProfileFrameStrategy(o)
        } catch (e) {
        }
        this._streamProvider = new paella.StreamProvider, Object.defineProperty(this, "ready", {
            get: function () {
                return this._isMasterReady && this._isSlaveReady
            }
        }), Object.defineProperty(this, "isMonostream", {
            get: function () {
                return this._isMonostream
            }
        })
    }

    return $traceurRuntime.createClass(t, {
        _getQualityStrategyObject: function () {
            var e = null;
            return paella.player.config.player.videoQualityStrategy.split(".").forEach(function (t, n, a) {
                e = 0 == n && a.length > 1 ? window[t] : e[t]
            }), new (e = e || paella.VideoQualityStrategy())
        }, getVideoData: function () {
            var e = this;
            return new Promise(function (t) {
                var n = {master: null, slaves: []}, a = [];
                e.masterVideo() && a.push(e.masterVideo().getVideoData().then(function (e) {
                    return n.master = e, Promise.resolve(e)
                })), e.slaveVideo() && a.push(e.slaveVideo().getVideoData().then(function (e) {
                    return n.slaves.push(e), Promise.resolve(e)
                })), Promise.all(a).then(function () {
                    t(n)
                })
            })
        }, setVideoQualityStrategy: function (e) {
            this._videoQualityStrategy = e, this.masterVideo() && this.masterVideo().setVideoQualityStrategy(this._videoQualityStrategy), this.slaveVideo() && slaveVideo.setVideoQualityStrategy(this._videoQualityStrategy)
        }, setProfileFrameStrategy: function (e) {
            this.profileFrameStrategy = e
        }, getMasterVideoRect: function () {
            return this.currentMasterVideoRect
        }, getSlaveVideoRect: function () {
            return this.currentSlaveVideoRect
        }, setHidden: function (e) {
            this.isHidden = e
        }, hideVideo: function () {
            this.setHidden(!0)
        }, publishVideo: function () {
            this.setHidden(!1)
        }, syncVideos: function () {
            var e = this, t = this.masterVideo(), n = this.slaveVideo(), a = 0, i = 0;
            !this._isMonostream && t && t.currentTime().then(function (e) {
                return a = e, n ? n.currentTime() : Promise.resolve(-1)
            }).then(function (t) {
                if (t >= -1) {
                    i = t;
                    var r = Math.abs(a - i);
                    r > e._maxSyncDelay && (base.log.debug("Sync videos performed, diff=" + r), n.setCurrentTime(a))
                }
                var o = [];
                return e._audioPlayers.forEach(function (e) {
                    o.push(e.currentTime())
                }), Promise.all(o)
            }).then(function (t) {
                t.forEach(function (t, n) {
                    var i = e._audioPlayers[n], r = Math.abs(a - t);
                    r > e._maxSyncDelay && (base.log.debug("Sync audio performed, diff=" + r), i.setCurrentTime(t))
                })
            })
        }, checkVideoBounds: function (e, t, n, a) {
            var i = this, r = e.start, o = e.end, l = e.enabled;
            paella.events.bind(paella.events.endVideo, function () {
                i.setCurrentTime(0)
            }), l ? t >= Math.floor(o) && !n ? (paella.events.trigger(paella.events.endVideo, {videoContainer: this}), this.pause()) : t < r && this.setCurrentTime(r + 1) : t >= a && (paella.events.trigger(paella.events.endVideo, {videoContainer: this}), this.pause())
        }, play: function () {
            var e = this;
            return new Promise(function (n) {
                e._firstLoad ? e._playOnLoad = !0 : e._firstLoad = !0;
                var a = e.masterVideo(), i = e.slaveVideo();
                a ? a.play().then(function () {
                    i && i.play(), e._audioPlayers.forEach(function (e) {
                        e.play()
                    }), $traceurRuntime.superGet(e, t.prototype, "play").call(e), n()
                }) : reject(new Error("Invalid master video"))
            })
        }, pause: function () {
            var e = this;
            return new Promise(function (n, a) {
                var i = e.masterVideo(), r = e.slaveVideo();
                i ? i.pause().then(function () {
                    r && r.pause(), e._audioPlayers.forEach(function (e) {
                        e.pause()
                    }), $traceurRuntime.superGet(e, t.prototype, "pause").call(e), n()
                }) : a(new Error("invalid master video"))
            })
        }, next: function () {
            0 !== this._trimming.end ? this.setCurrentTime(this._trimming.end) : this.duration(!0).then(function (e) {
                this.setCurrentTime(e)
            }), $traceurRuntime.superGet(this, t.prototype, "next").call(this)
        }, previous: function () {
            this.setCurrentTime(this._trimming.start), $traceurRuntime.superGet(this, t.prototype, "previous").call(this)
        }, setCurrentTime: function (e) {
            var t = this;
            return new Promise(function (n) {
                var a = [];
                t._trimming.enabled && (e += t._trimming.start, e < t._trimming.start && (e = t._trimming.start), e > t._trimming.end && (e = t._trimming.end)), a.push(t.masterVideo().setCurrentTime(e)), t.slaveVideo() && a.push(t.slaveVideo().setCurrentTime(e)), t._audioPlayers.forEach(function (t) {
                    a.push(t.setCurrentTime(e))
                }), Promise.all(a).then(function () {
                    return t.duration(!1)
                }).then(function (t) {
                    n({time: e, duration: t})
                })
            })
        }, currentTime: function () {
            var e = void 0 !== arguments[0] && arguments[0], t = this;
            if (this._trimming.enabled && !e) {
                var n = this._trimming.start;
                return new Promise(function (e) {
                    t.masterVideo().currentTime().then(function (t) {
                        e(t - n)
                    })
                })
            }
            return this.masterVideo().currentTime()
        }, setPlaybackRate: function (e) {
            var n = this.masterVideo(), a = this.slaveVideo();
            n && n.setPlaybackRate(e), a && a.setPlaybackRate(e), $traceurRuntime.superGet(this, t.prototype, "setPlaybackRate").call(this, e)
        }, setVolume: function (e) {
            var t = this;
            return new Promise(function (n) {
                function a() {
                    "object" == $traceurRuntime.typeof(e) ? (o = void 0 !== e.master ? e.master : o, l = void 0 !== e.slave ? e.slave : l) : (o = e, l = 0), i.setVolume(o), r && r.setVolume(l), paella.events.trigger(paella.events.setVolume, {
                        master: o,
                        slave: l
                    })
                }

                var i = t.masterVideo(), r = t.slaveVideo(), o = 0, l = 0;
                i.volume().then(function (e) {
                    return o = e, r ? r.volume() : 0
                }).then(function (t) {
                    l = t, a(), n(e)
                })
            })
        }, volume: function (e) {
            return e ? "master" == e && this.masterVideo() ? this.masterVideo().volume() : "slave" == e && this.slaveVideo() ? this.slaveVideo().volume() : void 0 : this.masterVideo().volume()
        }, setDefaultMasterVolume: function (e) {
            this._defaultMasterVolume = e
        }, setDefaultSlaveVolume: function (e) {
            this._defaultSlaveVolume = e
        }, masterVideo: function () {
            return this.container.getNode(this.video1Id)
        }, slaveVideo: function () {
            return this.container.getNode(this.videoSlaveId + 1)
        }, duration: function (e) {
            var t = this;
            return this.masterVideo().duration().then(function (n) {
                return t._trimming.enabled && !e && (n = t._trimming.end - t._trimming.start), n
            })
        }, paused: function () {
            return this.masterVideo().isPaused()
        }, trimEnabled: function () {
            return this._trimming.enabled
        }, trimStart: function () {
            return this._trimming.enabled ? this._trimming.start : 0
        }, trimEnd: function () {
            return this._trimming.enabled ? this._trimming.end : this.duration()
        }, getQualities: function () {
            var e = this;
            return new Promise(function (t) {
                e.masterVideo().getQualities().then(function (e) {
                    t(e)
                })
            })
        }, setQuality: function (e) {
            var t = this, n = [], a = [], i = this;
            return new Promise(function (r) {
                function o() {
                    var t = e < n.length ? e : n.length - 1, o = e < a.length ? e : a.length - 1;
                    i.masterVideo().setQuality(t).then(function () {
                        return i.slaveVideo() ? i.slaveVideo().setQuality(o) : paella_DeferredResolved()
                    }).then(function () {
                        paella.events.trigger(paella.events.qualityChanged), r()
                    })
                }

                t.masterVideo().getQualities().then(function (e) {
                    return n = e, t.slaveVideo() ? t.slaveVideo().getQualities() : paella_DeferredResolved()
                }).then(function (e) {
                    a = e || [], o()
                })
            })
        }, getCurrentQuality: function () {
            return this.masterVideo().getCurrentQuality()
        }, setStartTime: function (e) {
            this.seekToTime(e)
        }, setStreamData: function (e) {
            var t = this, n = this;
            this._sourceData = e;
            var a = document.createElement("div");
            a.className = "videoLoaderOverlay", this.overlayContainer.addElement(a, {left: 0, top: 0, width: 1280, height: 720}), this._streamProvider.init(e);
            var i = e.length > 1 ? {x: 850, y: 140, w: 360, h: 550} : {x: 0, y: 0, w: 1280, h: 720}, r = {x: 10, y: 40, w: 800, h: 600};
            this._isMonostream = 0 == this._streamProvider.slaveVideos.length;
            var o = this._streamProvider.masterVideo, l = this._streamProvider.audioStreams, s = this._streamProvider.mainSlaveVideo,
                u = paella.videoFactory.getVideoObject(this.video1Id, o, i), c = s ? paella.videoFactory.getVideoObject(this.videoSlaveId + 1, s, r) : null;
            this._audioPlayers = [], l.forEach(function (e, n) {
                var a = paella.audioFactory.getAudioObject(t.audioId + n, e);
                a && (t._audioPlayers.push(a), t.container.addNode(a))
            });
            var d = this.autoplay();
            return u.setAutoplay(d), c && c.setAutoplay(d), u.setVideoQualityStrategy(this._videoQualityStrategy), c && c.setVideoQualityStrategy(this._videoQualityStrategy), this.container.addNode(u), e.length > 1 && this.container.addNode(c), u.load().then(function () {
                return e.length > 1 ? c.load() : paella_DeferredResolved(!0)
            }).then(function () {
                if (n._audioPlayers.length > 0) {
                    var e = [];
                    return n._audioPlayers.forEach(function (t) {
                        e.push(t.load())
                    }), Promise.all(e)
                }
                return paella_DeferredResolved(!0)
            }).then(function () {
                $(u.video).bind("timeupdate", function (e) {
                    var t = n._trimming, a = e.currentTarget.currentTime, i = e.currentTarget.duration;
                    t.enabled && (a -= t.start, i = t.end - t.start), paella.events.trigger(paella.events.timeupdate, {
                        videoContainer: n,
                        currentTime: a,
                        duration: i
                    }), n.checkVideoBounds(t, e.currentTarget.currentTime, e.currentTarget.paused, i)
                }), n.overlayContainer.removeElement(a), n._isMasterReady = !0, n._isSlaveReady = !0;
                var t = paella.player.config, i = t.player.audio && void 0 != t.player.audio.master ? t.player.audio.master : 1,
                    r = t.player.audio && void 0 != t.player.audio.slave ? t.player.audio.slave : 0;
                u.setVolume(i), e.length > 1 && c.setVolume(r), paella.events.trigger(paella.events.videoReady);
                var o = base.parameters.get("profile"), l = base.cookies.get("lastProfile");
                return o ? n.setProfile(o, !1) : l ? n.setProfile(l, !1) : n.setProfile(paella.Profiles.getDefaultProfile(), !1)
            })
        }, setAutoplay: function () {
            var e = void 0 === arguments[0] || arguments[0];
            this._autoplay = e, this.masterVideo() && this.masterVideo().setAutoplay(e), this.slaveVideo() && this.slaveVideo().setAutoplay(e), this._audioPlayers.lenght > 0 && this._audioPlayers.forEach(function (t) {
                t.setAutoplay(e)
            })
        }, autoplay: function () {
            return ("true" == base.parameters.get("autoplay") || this._streamProvider.isLiveStreaming) && !base.userAgent.browser.IsMobileVersion
        }, numberOfStreams: function () {
            return this._sourceData.length
        }, getMonostreamMasterProfile: function () {
            this.masterVideo();
            return {
                content: "presenter",
                visible: !0,
                layer: 1,
                rect: [{aspectRatio: "1/1", left: 280, top: 0, width: 720, height: 720}, {aspectRatio: "6/5", left: 208, top: 0, width: 864, height: 720}, {
                    aspectRatio: "5/4",
                    left: 190,
                    top: 0,
                    width: 900,
                    height: 720
                }, {aspectRatio: "4/3", left: 160, top: 0, width: 960, height: 720}, {aspectRatio: "11/8", left: 145, top: 0, width: 990, height: 720}, {
                    aspectRatio: "1.41/1",
                    left: 132,
                    top: 0,
                    width: 1015,
                    height: 720
                }, {aspectRatio: "1.43/1", left: 125, top: 0, width: 1029, height: 720}, {aspectRatio: "3/2", left: 100, top: 0, width: 1080, height: 720}, {
                    aspectRatio: "16/10",
                    left: 64,
                    top: 0,
                    width: 1152,
                    height: 720
                }, {aspectRatio: "5/3", left: 40, top: 0, width: 1200, height: 720}, {aspectRatio: "16/9", left: 0, top: 0, width: 1280, height: 720}, {
                    aspectRatio: "1.85/1",
                    left: 0,
                    top: 14,
                    width: 1280,
                    height: 692
                }, {aspectRatio: "2.35/1", left: 0, top: 87, width: 1280, height: 544}, {aspectRatio: "2.41/1", left: 0, top: 94, width: 1280, height: 531}, {
                    aspectRatio: "2.76/1",
                    left: 0,
                    top: 128,
                    width: 1280,
                    height: 463
                }]
            }
        }, getMonostreamSlaveProfile: function () {
            return {
                content: "slides",
                visible: !1,
                layer: 0,
                rect: [{aspectRatio: "16/9", left: 0, top: 0, width: 0, height: 0}, {aspectRatio: "4/3", left: 0, top: 0, width: 0, height: 0}]
            }
        }, getCurrentProfileName: function () {
            return this._currentProfile
        }, setProfile: function (e, t) {
            var n = this;
            return new Promise(function (a) {
                t = !base.userAgent.browser.Explorer && t, paella.Profiles.loadProfile(e, function (i) {
                    n._currentProfile = e, 1 == n.numberOfStreams() && (i.masterVideo = n.getMonostreamMasterProfile(), i.slaveVideo = n.getMonostreamSlaveProfile()), n.applyProfileWithJson(i, t), a(e)
                })
            })
        }, getProfile: function (e) {
            return new Promise(function (t, n) {
                paella.Profiles.loadProfile(e, function (e) {
                    t(e)
                })
            })
        }, hideAllLogos: function () {
            for (var e = 0; e < this.logos.length; ++e) {
                var t = this.logos[e], n = this.container.getNode(t);
                $(n.domElement).hide()
            }
        }, showLogos: function (e) {
            if (void 0 != e) for (var t = new paella.RelativeVideoSize, n = 0; n < e.length; ++n) {
                var a = e[n], i = a.content, r = this.container.getNode(i), o = a.rect;
                r ? $(r.domElement).show() : (d = {}, r = this.container.addNode(new paella.DomNode("img", i, d)), r.domElement.setAttribute("src", paella.utils.folders.profiles() + "/resources/" + i), r.domElement.setAttribute("src", paella.utils.folders.profiles() + "/resources/" + i));
                var l = t.percentVSize(o.top) + "%", s = t.percentWSize(o.left) + "%", u = t.percentWSize(o.width) + "%", c = t.percentVSize(o.height) + "%",
                    d = {top: l, left: s, width: u, height: c, position: "absolute", zIndex: a.zIndex};
                $(r.domElement).css(d)
            }
        }, getClosestRect: function (e, t) {
            var n = 10, a = /([0-9\.]+)\/([0-9\.]+)/, i = e.rect[0], r = 0 == t.h ? 1.333333 : t.w / t.h, o = 1, l = !1;
            return e.rect.forEach(function (e) {
                (l = a.exec(e.aspectRatio)) && (o = Number(l[1]) / Number(l[2]));
                var t = Math.abs(o - r);
                n > t && (n = t, i = e)
            }), i
        }, applyProfileWithJson: function (e, t) {
            var n = function (n, a) {
                void 0 == t && (t = !0);
                var i = this.masterVideo(), r = this.slaveVideo(), o = this.container.getNode(this.backgroundId), l = n.res, s = a && a.res,
                    u = this.getClosestRect(e.masterVideo, n.res), c = a && this.getClosestRect(e.slaveVideo, a.res);
                if (this.hideAllLogos(), this.showLogos(e.logos), dynamic_cast("paella.ProfileFrameStrategy", this.profileFrameStrategy)) {
                    var d = {width: $(this.domElement).width(), height: $(this.domElement).height()}, p = u.width / d.width, h = {width: l.w * p, height: l.h * p};
                    if (u.left = Number(u.left), u.top = Number(u.top), u.width = Number(u.width), u.height = Number(u.height), u = this.profileFrameStrategy.adaptFrame(h, u), r) {
                        var m = {width: s.w * p, height: s.h * p};
                        c.left = Number(c.left), c.top = Number(c.top), c.width = Number(c.width), c.height = Number(c.height), c = this.profileFrameStrategy.adaptFrame(m, c)
                    }
                }
                i.setRect(u, t), this.currentMasterVideoRect = u, i.setVisible(e.masterVideo.visible, t), this.currentMasterVideoRect.visible = !!/true/i.test(e.masterVideo.visible), this.currentMasterVideoRect.layer = parseInt(e.masterVideo.layer), r && (r.setRect(c, t), this.currentSlaveVideoRect = c, this.currentSlaveVideoRect.visible = !!/true/i.test(e.slaveVideo.visible), this.currentSlaveVideoRect.layer = parseInt(e.slaveVideo.layer), r.setVisible(e.slaveVideo.visible, t), r.setLayer(e.slaveVideo.layer)), i.setLayer(e.masterVideo.layer), o.setImage(paella.utils.folders.profiles() + "/resources/" + e.background.content)
            }, a = this;
            if (this.masterVideo()) if (this.slaveVideo()) {
                var i = {};
                this.masterVideo().getVideoData().then(function (e) {
                    return i = e, a.slaveVideo().getVideoData()
                }).then(function (e) {
                    n.apply(a, [i, e])
                })
            } else this.masterVideo().getVideoData().then(function (e) {
                n.apply(a, [e])
            })
        }, resizePortrail: function () {
            var e = 1 == paella.player.isFullScreen() ? $(window).width() : $(this.domElement).width(), t = new paella.RelativeVideoSize, n = t.proportionalHeight(e);
            this.container.domElement.style.width = e + "px", this.container.domElement.style.height = n + "px";
            var a = 1 == paella.player.isFullScreen() ? $(window).height() : $(this.domElement).height(), i = a / 2 - n / 2;
            this.container.domElement.style.top = i + "px"
        }, resizeLandscape: function () {
            var e = 1 == paella.player.isFullScreen() ? $(window).height() : $(this.domElement).height(), t = new paella.RelativeVideoSize, n = t.proportionalWidth(e);
            this.container.domElement.style.width = n + "px", this.container.domElement.style.height = e + "px", this.container.domElement.style.top = "0px"
        }, onresize: function () {
            $traceurRuntime.superGet(this, t.prototype, "onresize").call(this);
            var e = new paella.RelativeVideoSize, n = e.aspectRatio();
            (1 == paella.player.isFullScreen() ? $(window).width() : $(this.domElement).width()) / (1 == paella.player.isFullScreen() ? $(window).height() : $(this.domElement).height()) > n ? this.resizeLandscape() : this.resizePortrail()
        }
    }, {}, e)
}(paella.VideoContainerBase);
paella.VideoContainer = VideoContainer, Class("paella.PluginManager", {
    targets: null, pluginList: [], eventDrivenPlugins: [], enabledPlugins: [], setupPlugin: function (e) {
        e.setup(), this.enabledPlugins.push(e), dynamic_cast("paella.UIPlugin", e) && e.checkVisibility()
    }, checkPluginsVisibility: function () {
        this.enabledPlugins.forEach(function (e) {
            dynamic_cast("paella.UIPlugin", e) && e.checkVisibility()
        })
    }, initialize: function () {
        this.targets = {};
        var e = this;
        paella.events.bind(paella.events.loadPlugins, function (t) {
            e.loadPlugins("paella.DeferredLoadPlugin")
        }), new base.Timer(function () {
            paella.player && paella.player.controls && paella.player.controls.onresize()
        }, 1e3).repeat = !0
    }, setTarget: function (e, t) {
        t.addPlugin && (this.targets[e] = t)
    }, getTarget: function (e) {
        return "eventDriven" == e ? this : this.targets[e]
    }, registerPlugin: function (e) {
        this.importLibraries(e), this.pluginList.push(e), this.pluginList.sort(function (e, t) {
            return e.getIndex() - t.getIndex()
        })
    }, importLibraries: function (e) {
        e.getDependencies().forEach(function (e) {
            var t = document.createElement("script");
            t.type = "text/javascript", t.src = "javascript/" + e + ".js", document.head.appendChild(t)
        })
    }, loadPlugins: function (e) {
        if (void 0 != e) {
            var t = this;
            this.foreach(function (n, a) {
                null != dynamic_cast(e, n) && a.enabled && (base.log.debug("Load plugin (" + e + "): " + n.getName()), n.config = a, n.load(t))
            })
        }
    }, foreach: function (e) {
        var t = !1, n = {};
        try {
            t = paella.player.config.plugins.enablePluginsByDefault
        } catch (e) {
        }
        try {
            n = paella.player.config.plugins.list
        } catch (e) {
        }
        this.pluginList.forEach(function (a) {
            var i = a.getName(), r = n[i];
            r || (r = {enabled: t}), e(a, r)
        })
    }, addPlugin: function (e) {
        var t = this;
        e.checkEnabled(function (n) {
            if ("eventDriven" == e.type && n) {
                paella.pluginManager.setupPlugin(e), t.eventDrivenPlugins.push(e);
                for (var a = e.getEvents(), i = function (t, n) {
                    e.onEvent(t.type, n)
                }, r = 0; r < a.length; ++r) {
                    var o = a[r];
                    paella.events.bind(o, i)
                }
            }
        })
    }, getPlugin: function (e) {
        for (var t = 0; t < this.pluginList.length; ++t) if (this.pluginList[t].getName() == e) return this.pluginList[t];
        return null
    }
}), paella.pluginManager = new paella.PluginManager, Class("paella.Plugin", {
    type: "", initialize: function () {
        paella.pluginManager.registerPlugin(this)
    }, getDependencies: function () {
        return []
    }, load: function (e) {
        var t = e.getTarget(this.type);
        t && t.addPlugin && t.addPlugin(this)
    }, getRootNode: function (e) {
        return null
    }, checkEnabled: function (e) {
        e(!0)
    }, setup: function () {
    }, getIndex: function () {
        return 0
    }, getName: function () {
        return ""
    }
}), Class("paella.FastLoadPlugin", paella.Plugin, {}), Class("paella.EarlyLoadPlugin", paella.Plugin, {}), Class("paella.DeferredLoadPlugin", paella.Plugin, {}), Class("paella.PopUpContainer", paella.DomNode, {
    containers: null,
    currentContainerId: -1,
    initialize: function (e, t) {
        var n = {};
        this.parent("div", e, n), this.domElement.className = t, this.containers = {}
    },
    hideContainer: function (e, t) {
        var n = this.containers[e];
        n && this.currentContainerId == e && (n.identifier = e, paella.events.trigger(paella.events.hidePopUp, {container: n}), n.plugin.willHideContent(), $(n.element).hide(), n.button.className = n.button.className.replace(" selected", ""), $(this.domElement).css({width: "0px"}), this.currentContainerId = -1, n.plugin.didHideContent())
    },
    showContainer: function (e, t) {
        function n(e) {
            paella.events.trigger(paella.events.hidePopUp, {container: e}), e.plugin.willHideContent(), $(e.element).hide(), $(i.domElement).css({width: "0px"}), e.button.className = e.button.className.replace(" selected", ""), i.currentContainerId = -1, e.plugin.didHideContent()
        }

        function a(n) {
            if (paella.events.trigger(paella.events.showPopUp, {container: n}), n.plugin.willShowContent(), n.button.className = n.button.className + " selected", $(n.element).show(), r = $(n.element).width(), "right" == n.plugin.getAlignment()) {
                var a = $(t.parentElement).width() - $(t).position().left - $(t).width();
                $(i.domElement).css({width: r + "px", right: a + "px", left: ""})
            } else {
                var o = $(t).position().left;
                $(i.domElement).css({width: r + "px", left: o + "px", right: ""})
            }
            i.currentContainerId = e, n.plugin.didShowContent()
        }

        var i = this, r = 0, o = this.containers[e];
        if (o && this.currentContainerId != e && -1 != this.currentContainerId) {
            n(this.containers[this.currentContainerId]), a(o)
        } else o && this.currentContainerId == e ? n(o) : o && a(o)
    },
    registerContainer: function (e, t, n, a) {
        var i = {identifier: e, button: n, element: t, plugin: a};
        if (this.containers[e] = i, a.closeOnMouseOut && a.closeOnMouseOut()) {
            var r = e, o = n;
            $(t).mouseleave(function (e) {
                paella.player.controls.playbackControl().hidePopUp(r, o)
            })
        }
        $(t).hide(), n.popUpIdentifier = e, n.sourcePlugin = a, $(n).click(function (e) {
            this.plugin.isPopUpOpen() ? paella.player.controls.playbackControl().hidePopUp(this.popUpIdentifier, this) : paella.player.controls.playbackControl().showPopUp(this.popUpIdentifier, this)
        }), $(n).keyup(function (e) {
            13 != e.keyCode || this.plugin.isPopUpOpen() ? 27 == e.keyCode && paella.player.controls.playbackControl().hidePopUp(this.popUpIdentifier, this) : paella.player.controls.playbackControl().showPopUp(this.popUpIdentifier, this)
        }), a.containerManager = this
    }
}), Class("paella.TimelineContainer", paella.PopUpContainer, {
    hideContainer: function (e, t) {
        var n = this.containers[e];
        n && this.currentContainerId == e && (paella.events.trigger(paella.events.hidePopUp, {container: n}), n.plugin.willHideContent(), $(n.element).hide(), n.button.className = n.button.className.replace(" selected", ""), this.currentContainerId = -1, $(this.domElement).css({height: "0px"}), n.plugin.didHideContent())
    }, showContainer: function (e, t) {
        var n = 0, a = this.containers[e];
        if (a && this.currentContainerId != e && -1 != this.currentContainerId) {
            var i = this.containers[this.currentContainerId];
            i.button.className = i.button.className.replace(" selected", ""), a.button.className = a.button.className + " selected", paella.events.trigger(paella.events.hidePopUp, {container: i}), i.plugin.willHideContent(), $(i.element).hide(), i.plugin.didHideContent(), paella.events.trigger(paella.events.showPopUp, {container: a}), a.plugin.willShowContent(), $(a.element).show(), this.currentContainerId = e, n = $(a.element).height(), $(this.domElement).css({height: n + "px"}), a.plugin.didShowContent()
        } else a && this.currentContainerId == e ? (paella.events.trigger(paella.events.hidePopUp, {container: a}), a.plugin.willHideContent(), $(a.element).hide(), a.button.className = a.button.className.replace(" selected", ""), $(this.domElement).css({height: "0px"}), this.currentContainerId = -1, a.plugin.didHideContent()) : a && (paella.events.trigger(paella.events.showPopUp, {container: a}), a.plugin.willShowContent(), a.button.className = a.button.className + " selected", $(a.element).show(), this.currentContainerId = e, n = $(a.element).height(), $(this.domElement).css({height: n + "px"}), a.plugin.didShowContent())
    }
}), Class("paella.UIPlugin", paella.DeferredLoadPlugin, {
    ui: null, checkVisibility: function () {
        var e = this.config.visibleOn || [paella.PaellaPlayer.mode.standard, paella.PaellaPlayer.mode.fullscreen, paella.PaellaPlayer.mode.embed], t = !1;
        e.forEach(function (e) {
            e == paella.player.getPlayerMode() && (t = !0)
        }), t ? this.showUI() : this.hideUI()
    }, hideUI: function () {
        this.ui.setAttribute("aria-hidden", "true"), $(this.ui).hide()
    }, showUI: function () {
        var e = this;
        paella.pluginManager.enabledPlugins.forEach(function (t) {
            t == e && (e.ui.setAttribute("aria-hidden", "false"), $(e.ui).show())
        })
    }
}), Class("paella.ButtonPlugin", paella.UIPlugin, {
    type: "button", subclass: "", container: null, containerManager: null, getAlignment: function () {
        return "left"
    }, getSubclass: function () {
        return "myButtonPlugin"
    }, addSubclass: function (e) {
        $(this.container).addClass(e)
    }, removeSubclass: function (e) {
        $(this.container).removeClass(e)
    }, action: function (e) {
    }, getName: function () {
        return "ButtonPlugin"
    }, getMinWindowSize: function () {
        return 0
    }, buildContent: function (e) {
    }, willShowContent: function () {
        base.log.debug(this.getName() + " willDisplayContent")
    }, didShowContent: function () {
        base.log.debug(this.getName() + " didDisplayContent")
    }, willHideContent: function () {
        base.log.debug(this.getName() + " willHideContent")
    }, didHideContent: function () {
        base.log.debug(this.getName() + " didHideContent")
    }, getButtonType: function () {
        return paella.ButtonPlugin.type.actionButton
    }, getText: function () {
        return ""
    }, setText: function (e) {
        this.container.innerHTML = e
    }, hideButton: function () {
        this.hideUI()
    }, showButton: function () {
        this.showUI()
    }, changeSubclass: function (e) {
        this.subclass = e, this.container.className = this.getClassName()
    }, getClassName: function () {
        return paella.ButtonPlugin.kClassName + " " + this.getAlignment() + " " + this.subclass
    }, getContainerClassName: function () {
        return this.getButtonType() == paella.ButtonPlugin.type.timeLineButton ? paella.ButtonPlugin.kTimeLineClassName + " " + this.getSubclass() : this.getButtonType() == paella.ButtonPlugin.type.popUpButton ? paella.ButtonPlugin.kPopUpClassName + " " + this.getSubclass() : void 0
    }, setToolTip: function (e) {
        this.button.setAttribute("title", e), this.button.setAttribute("aria-label", e)
    }, getDefaultToolTip: function () {
        return ""
    }, isPopUpOpen: function () {
        return this.button.popUpIdentifier == this.containerManager.currentContainerId
    }
}), paella.ButtonPlugin.alignment = {
    left: "left",
    right: "right"
}, paella.ButtonPlugin.kClassName = "buttonPlugin", paella.ButtonPlugin.kPopUpClassName = "buttonPluginPopUp", paella.ButtonPlugin.kTimeLineClassName = "buttonTimeLine", paella.ButtonPlugin.type = {
    actionButton: 1,
    popUpButton: 2,
    timeLineButton: 3
}, paella.ButtonPlugin.buildPluginButton = function (e, t) {
    function n(e) {
        paella.userTracking.log("paella:button:action", e.plugin.getName()), e.plugin.action(e)
    }

    e.subclass = e.getSubclass();
    var a = document.createElement("div");
    return a.className = e.getClassName(), a.id = t, a.innerHTML = e.getText(), a.setAttribute("tabindex", 1e3 + e.getIndex()), a.setAttribute("alt", ""), a.setAttribute("role", "button"), a.plugin = e, e.button = a, e.container = a, e.ui = a, e.setToolTip(e.getDefaultToolTip()), $(a).click(function (e) {
        n(this)
    }), $(a).keyup(function (e) {
        13 == e.keyCode && n(this)
    }), a
}, paella.ButtonPlugin.buildPluginPopUp = function (e, t, n) {
    t.subclass = t.getSubclass();
    var a = document.createElement("div");
    return e.appendChild(a), a.className = t.getContainerClassName(), a.id = n, a.plugin = t, t.buildContent(a), a
}, Class("paella.VideoOverlayButtonPlugin", paella.ButtonPlugin, {
    type: "videoOverlayButton", getSubclass: function () {
        return "myVideoOverlayButtonPlugin"
    }, action: function (e) {
    }, getName: function () {
        return "VideoOverlayButtonPlugin"
    }
}), Class("paella.EventDrivenPlugin", paella.EarlyLoadPlugin, {
    type: "eventDriven", initialize: function () {
        this.parent();
        for (var e = this.getEvents(), t = 0; t < e.length; ++t) {
            e[t] == paella.events.loadStarted && this.onEvent(paella.events.loadStarted)
        }
    }, getEvents: function () {
        return []
    }, onEvent: function (e, t) {
    }, getName: function () {
        return "EventDrivenPlugin"
    }
}), function () {
    var e = new (Class({
        _formats: {}, addPlugin: function (e) {
            var t = this, n = e.ext;
            0 == (Array.isArray && Array.isArray(n) || n instanceof Array) && (n = [n]), 0 == n.length ? base.log.debug("No extension provided by the plugin " + e.getName()) : (base.log.debug("New captionParser added: " + e.getName()), n.forEach(function (n) {
                t._formats[n] = e
            }))
        }, initialize: function () {
            paella.pluginManager.setTarget("captionParser", this)
        }
    })), t = Class(base.AsyncLoaderCallback, {
        initialize: function (e, t) {
            this.name = "captionSearchCallback", this.caption = e, this.text = t
        }, load: function (e, t) {
            var n = this;
            this.caption.search(this.text, function (a, i) {
                a ? t() : (n.result = i, e())
            })
        }
    });
    paella.captions = {
        parsers: {}, _captions: {}, _activeCaption: void 0, addCaptions: function (e) {
            var t = e._captionsProvider + ":" + e._id;
            this._captions[t] = e, paella.events.trigger(paella.events.captionAdded, t)
        }, getAvailableLangs: function () {
            var e = [], t = this;
            return Object.keys(this._captions).forEach(function (n) {
                var a = t._captions[n];
                e.push({id: n, lang: a._lang})
            }), e
        }, getCaptions: function (e) {
            if (e && this._captions[e]) return this._captions[e]
        }, getActiveCaptions: function (e) {
            return this._activeCaption
        }, setActiveCaptions: function (e) {
            return this._activeCaption = this.getCaptions(e), void 0 != this._activeCaption ? paella.events.trigger(paella.events.captionsEnabled, e) : paella.events.trigger(paella.events.captionsDisabled), this._activeCaption
        }, getCaptionAtTime: function (e, t) {
            var n = this.getCaptions(e);
            if (void 0 != n) return n.getCaptionAtTime(t)
        }, search: function (e, n) {
            var a = this, i = new base.AsyncLoader;
            this.getAvailableLangs().forEach(function (n) {
                i.addCallback(new t(a.getCaptions(n.id), e))
            }), i.load(function () {
                var e = [];
                Object.keys(i.callbackArray).forEach(function (t) {
                    e = e.concat(i.getCallback(t).result)
                }), n && n(!1, e)
            }, function () {
                n && n(!0)
            })
        }
    }, Class("paella.captions.Caption", {
        initialize: function (e, t, n, a, i) {
            this._id = e, this._format = t, this._url = n, this._captions = void 0, this._index = lunr(function () {
                this.ref("id"), this.field("content", {boost: 10})
            }), "string" == typeof a && (a = {code: a, txt: a}), this._lang = a, this._captionsProvider = "downloadCaptionsProvider", this.reloadCaptions(i)
        }, canEdit: function (e) {
            e(!1, !1)
        }, goToEdit: function () {
        }, reloadCaptions: function (t) {
            var n = this;
            jQuery.ajax({url: n._url, cache: !1, type: "get", dataType: "text"}).then(function (a) {
                var i = e._formats[n._format];
                void 0 == i ? (base.log.debug("Error adding captions: Format not supported!"), t && t(!0)) : i.parse(a, n._lang.code, function (e, a) {
                    e || (n._captions = a, n._captions.forEach(function (e) {
                        n._index.add({id: e.id, content: e.content})
                    })), t && t(e)
                })
            }).fail(function (e) {
                base.log.debug("Error loading captions: " + n._url), t && t(!0)
            })
        }, getCaptions: function () {
            return this._captions
        }, getCaptionAtTime: function (e) {
            if (void 0 != this._captions) for (var t = 0; t < this._captions.length; ++t) {
                var n = this._captions[t];
                if (n.begin <= e && n.end >= e) return n
            }
        }, getCaptionById: function (e) {
            if (void 0 != this._captions) for (var t = 0; t < this._captions.length; ++t) {
                var n = this._captions[t];
                if (n.id == e) return n
            }
        }, search: function (e, t) {
            var n = this;
            if (void 0 == this._index) t && t(!0, "Error. No captions found."); else {
                var a = [];
                this._index.search(e).forEach(function (e) {
                    var t = n.getCaptionById(e.ref);
                    a.push({time: t.begin, content: t.content, score: e.score})
                }), t && t(!1, a)
            }
        }
    }), Class("paella.CaptionParserPlugIn", paella.FastLoadPlugin, {
        type: "captionParser", getIndex: function () {
            return -1
        }, ext: [], parse: function (e, t, n) {
            throw new Error("paella.CaptionParserPlugIn#parse must be overridden by subclass")
        }
    })
}(), function () {
    var e = new (Class({
        _plugins: [], addPlugin: function (e) {
            this._plugins.push(e)
        }, initialize: function () {
            paella.pluginManager.setTarget("SearchServicePlugIn", this)
        }
    })), t = Class(base.AsyncLoaderCallback, {
        initialize: function (e, t) {
            this.name = "searchCallback", this.plugin = e, this.text = t
        }, load: function (e, t) {
            var n = this;
            this.plugin.search(this.text, function (a, i) {
                a ? t() : (n.result = i, e())
            })
        }
    });
    paella.searchService = {
        search: function (n, a) {
            var i = new base.AsyncLoader;
            paella.userTracking.log("paella:searchService:search", n), e._plugins.forEach(function (e) {
                i.addCallback(new t(e, n))
            }), i.load(function () {
                var e = [];
                Object.keys(i.callbackArray).forEach(function (t) {
                    e = e.concat(i.getCallback(t).result)
                }), a && a(!1, e)
            }, function () {
                a && a(!0)
            })
        }
    }, Class("paella.SearchServicePlugIn", paella.FastLoadPlugin, {
        type: "SearchServicePlugIn", getIndex: function () {
            return -1
        }, search: function (e, t) {
            throw new Error("paella.SearchServicePlugIn#search must be overridden by subclass")
        }
    })
}(), function () {
    var e = new (Class({
        _plugins: [], addPlugin: function (e) {
            var t = this;
            e.checkEnabled(function (n) {
                n && (e.setup(), t._plugins.push(e))
            })
        }, initialize: function () {
            paella.pluginManager.setTarget("userTrackingSaverPlugIn", this)
        }
    }));
    paella.userTracking = {}, Class("paella.userTracking.SaverPlugIn", paella.FastLoadPlugin, {
        type: "userTrackingSaverPlugIn", getIndex: function () {
            return -1
        }, checkEnabled: function (e) {
            e(!0)
        }, log: function (e, t) {
            throw new Error("paella.userTracking.SaverPlugIn#log must be overridden by subclass")
        }
    });
    var t = {};
    paella.userTracking.log = function (n, a) {
        void 0 != t[n] && t[n].cancel(), t[n] = new base.Timer(function (i) {
            e._plugins.forEach(function (e) {
                e.log(n, a)
            }), delete t[n]
        }, 500)
    }, [paella.events.play, paella.events.pause, paella.events.endVideo, paella.events.showEditor, paella.events.hideEditor, paella.events.enterFullscreen, paella.events.exitFullscreen, paella.events.loadComplete].forEach(function (e) {
        paella.events.bind(e, function (t, n) {
            paella.userTracking.log(e)
        })
    }), [paella.events.showPopUp, paella.events.hidePopUp].forEach(function (e) {
        paella.events.bind(e, function (t, n) {
            paella.userTracking.log(e, n.identifier)
        })
    }), [paella.events.captionsEnabled, paella.events.captionsDisabled].forEach(function (e) {
        paella.events.bind(e, function (t, n) {
            var a;
            if (void 0 != n) {
                var i = paella.captions.getCaptions(n);
                a = {id: n, lang: i._lang, url: i._url}
            }
            paella.userTracking.log(e, a)
        })
    }), [paella.events.setProfile].forEach(function (e) {
        paella.events.bind(e, function (t, n) {
            paella.userTracking.log(e, n.profileName)
        })
    }), [paella.events.seekTo, paella.events.seekToTime].forEach(function (e) {
        paella.events.bind(e, function (t, n) {
            var a;
            try {
                JSON.stringify(n), a = n
            } catch (e) {
            }
            paella.userTracking.log(e, a)
        })
    }), [paella.events.setVolume, paella.events.resize, paella.events.setPlaybackRate].forEach(function (e) {
        paella.events.bind(e, function (t, n) {
            var a;
            try {
                JSON.stringify(n), a = n
            } catch (e) {
            }
            paella.userTracking.log(e, a)
        })
    })
}(), Class("paella.TimeControl", paella.DomNode, {
    initialize: function (e) {
        this.parent("div", e, {left: "0%"}), this.domElement.className = "timeControlOld", this.domElement.className = "timeControl";
        var t = this;
        paella.events.bind(paella.events.timeupdate, function (e, n) {
            t.onTimeUpdate(n)
        })
    }, onTimeUpdate: function (e) {
        e.videoContainer, e.currentTime, e.duration;
        this.domElement.innerHTML = this.secondsToHours(parseInt(e.currentTime))
    }, secondsToHours: function (e) {
        var t = Math.floor(e / 3600), n = Math.floor((e - 3600 * t) / 60), a = e - 3600 * t - 60 * n;
        return t < 10 && (t = "0" + t), n < 10 && (n = "0" + n), a < 10 && (a = "0" + a), t + ":" + n + ":" + a
    }
}), Class("paella.PlaybackBar", paella.DomNode, {
    playbackFullId: "",
    updatePlayBar: !0,
    timeControlId: "",
    _images: null,
    _keys: null,
    _prev: null,
    _next: null,
    _videoLength: null,
    _lastSrc: null,
    _aspectRatio: 1.777777778,
    _hasSlides: null,
    _imgNode: null,
    _canvas: null,
    initialize: function (e) {
        var t = this, n = {};
        this.parent("div", e, n), this.domElement.className = "playbackBar", this.domElement.setAttribute("alt", ""), this.domElement.setAttribute("aria-label", "Timeline Slider"), this.domElement.setAttribute("role", "slider"), this.domElement.setAttribute("aria-valuemin", "0"), this.domElement.setAttribute("aria-valuemax", "100"), this.domElement.setAttribute("aria-valuenow", "0"), this.domElement.setAttribute("tabindex", "1100"), $(this.domElement).keyup(function (e) {
            var t = 0, n = 0;
            paella.player.videoContainer.currentTime().then(function (e) {
                return t = e, paella.player.videoContainer.duration()
            }).then(function (a) {
                n = a;
                var i, r;
                switch (e.keyCode) {
                    case 37:
                        i = 100 * t / n, r = i - 5, paella.player.videoContainer.seekTo(r);
                        break;
                    case 39:
                        i = 100 * t / n, r = i + 5, paella.player.videoContainer.seekTo(r)
                }
            })
        }), this.playbackFullId = e + "_full", this.timeControlId = e + "_timeControl";
        var a = new paella.DomNode("div", this.playbackFullId, {width: "0%"});
        a.domElement.className = "playbackBarFull", this.addNode(a), this.addNode(new paella.TimeControl(this.timeControlId));
        var i = this;
        paella.events.bind(paella.events.timeupdate, function (e, t) {
            i.onTimeUpdate(t)
        }), $(this.domElement).bind("mousedown", function (e) {
            paella.utils.mouseManager.down(i, e), e.stopPropagation()
        }), $(a.domElement).bind("mousedown", function (e) {
            paella.utils.mouseManager.down(i, e), e.stopPropagation()
        }), base.userAgent.browser.IsMobileVersion || ($(this.domElement).bind("mousemove", function (e) {
            i.movePassive(e), paella.utils.mouseManager.move(e)
        }), $(a.domElement).bind("mousemove", function (e) {
            paella.utils.mouseManager.move(e)
        }), $(this.domElement).bind("mouseout", function (e) {
            i.mouseOut(e)
        })), $(this.domElement).bind("mouseup", function (e) {
            paella.utils.mouseManager.up(e)
        }), $(a.domElement).bind("mouseup", function (e) {
            paella.utils.mouseManager.up(e)
        }), paella.player.isLiveStream() && $(this.domElement).hide(), setTimeout(function () {
            t.drawTimeMarks()
        }, 200)
    },
    mouseOut: function (e) {
        this._hasSlides ? $("#divTimeImageOverlay").remove() : $("#divTimeOverlay").remove()
    },
    drawTimeMarks: function () {
        var e = this;
        this.imageSetup().then(function () {
            var t = e, n = $("#playerContainer_controls_playback_playbackBar");
            e.clearCanvas(), e._keys && paella.player.config.player.slidesMarks.enabled && e._keys.forEach(function (e) {
                var a = parseInt(e) * n.width() / t._videoLength;
                t.drawTimeMark(parseInt(a))
            })
        })
    },
    drawTimeMark: function (e) {
        var t = this.getCanvasContext();
        t.fillStyle = paella.player.config.player.slidesMarks.color, t.fillRect(e, 0, 1, 12)
    },
    clearCanvas: function () {
        if (this._canvas) {
            this.getCanvasContext().clearRect(0, 0, this._canvas.width, this._canvas.height)
        }
    },
    getCanvas: function () {
        if (!this._canvas) {
            var e = $("#playerContainer_controls_playback_playbackBar"), t = document.createElement("canvas");
            t.className = "playerContainer_controls_playback_playbackBar_canvas", t.id = "playerContainer_controls_playback_playbackBar_canvas", t.width = e.width();
            t.height = e.height();
            e.prepend(t), this._canvas = document.getElementById("playerContainer_controls_playback_playbackBar_canvas")
        }
        return this._canvas
    },
    getCanvasContext: function () {
        return this.getCanvas().getContext("2d")
    },
    movePassive: function (e) {
        function t(t) {
            var a = $(n.domElement), i = a.offset(), r = a.width(), o = e.clientX - i.left;
            o = o < 0 ? 0 : o;
            var l = 100 * o / r, s = l * t / 100, u = Math.floor(s / 3600) % 24;
            u = ("00" + u).slice(u.toString().length);
            var c = Math.floor(s / 60) % 60;
            c = ("00" + c).slice(c.toString().length);
            var d = Math.floor(s % 60);
            d = ("00" + d).slice(d.toString().length);
            var p = u + ":" + c + ":" + d;
            if (n._hasSlides ? (0 == $("#divTimeImageOverlay").length ? n.setupTimeImageOverlay(p, i.top, r) : $("#divTimeOverlay")[0].innerHTML = p, n.imageUpdate(s)) : 0 == $("#divTimeOverlay").length ? n.setupTimeOnly(p, i.top, r) : $("#divTimeOverlay")[0].innerHTML = p, n._hasSlides) {
                var h = $("#divTimeImageOverlay").width(), m = e.clientX - h / 2;
                e.clientX > h / 2 + i.left && e.clientX < i.left + r - h / 2 ? $("#divTimeImageOverlay").css("left", m) : e.clientX < r / 2 ? $("#divTimeImageOverlay").css("left", i.left) : $("#divTimeImageOverlay").css("left", i.left + r - h)
            }
            var f = $("#divTimeOverlay").width(), g = e.clientX - f / 2;
            e.clientX > f / 2 + i.left && e.clientX < i.left + r - f / 2 ? $("#divTimeOverlay").css("left", g) : e.clientX < r / 2 ? $("#divTimeOverlay").css("left", i.left) : $("#divTimeOverlay").css("left", i.left + r - f - 2), n._hasSlides && $("#divTimeImageOverlay").css("bottom", $(".playbackControls").height())
        }

        var n = this;
        paella.player.videoContainer.duration().then(function (e) {
            t(e)
        })
    },
    imageSetup: function () {
        var e = this;
        return new Promise(function (t) {
            paella.player.videoContainer.duration().then(function (n) {
                e._images = {};
                var a = paella.initDelegate.initParams.videoLoader.frameList;
                if (!a || 0 === Object.keys(a).length) return void(e._hasSlides = !1);
                e._hasSlides = !0, e._images = a, e._videoLength = n, e._keys = Object.keys(e._images), e._keys = e._keys.sort(function (e, t) {
                    return parseInt(e) - parseInt(t)
                }), e._next = 0, e._prev = 0, t()
            })
        })
    },
    imageUpdate: function (e) {
        var t = this, n = $("#imgOverlay").attr("src");
        if ($(t._imgNode).show(), e > this._next || e < this._prev) n = t.getPreviewImageSrc(e), n ? (t._lastSrc = n, $("#imgOverlay").attr("src", n)) : t.hideImg(); else {
            if (void 0 != n) return;
            $("#imgOverlay").attr("src", t._lastSrc)
        }
    },
    hideImg: function () {
        var e = this;
        $(e._imgNode).hide()
    },
    getPreviewImageSrc: function (e) {
        var t = Object.keys(this._images);
        t.push(e), t.sort(function (e, t) {
            return parseInt(e) - parseInt(t)
        });
        var n = t.indexOf(e) - 1;
        n = n > 0 ? n : 0;
        var a = t[n], i = t[n + 2], r = t[n];
        return i = void 0 == i ? t.length - 1 : parseInt(i), this._next = i, r = void 0 == r ? 0 : parseInt(r), this._prev = r, a = parseInt(a), !!this._images[a] && (this._images[a].url || this._images[a].url)
    },
    setupTimeImageOverlay: function (e, t, n) {
        var a = this, i = document.createElement("div");
        i.className = "divTimeImageOverlay", i.id = "divTimeImageOverlay"
        ;var r = Math.round(n / 10);
        if (i.style.width = Math.round(r * a._aspectRatio) + "px", a._hasSlides) {
            var o = document.createElement("img");
            o.className = "imgOverlay", o.id = "imgOverlay", a._imgNode = o, i.appendChild(o)
        }
        var l = document.createElement("div");
        l.className = "divTimeOverlay", l.style.top = t - 20 + "px", l.id = "divTimeOverlay", l.innerHTML = e, i.appendChild(l), $(this.domElement).parent().append(i)
    },
    setupTimeOnly: function (e, t, n) {
        var a = document.createElement("div");
        a.className = "divTimeOverlay", a.style.top = t - 20 + "px", a.id = "divTimeOverlay", a.innerHTML = e, $(this.domElement).parent().append(a)
    },
    playbackFull: function () {
        return this.getNode(this.playbackFullId)
    },
    timeControl: function () {
        return this.getNode(this.timeControlId)
    },
    setPlaybackPosition: function (e) {
        this.playbackFull().domElement.style.width = e + "%"
    },
    isSeeking: function () {
        return !this.updatePlayBar
    },
    onTimeUpdate: function (e) {
        if (this.updatePlayBar) {
            var t = e.currentTime, n = e.duration;
            this.setPlaybackPosition(100 * t / n)
        }
    },
    down: function (e, t, n) {
        this.updatePlayBar = !1, this.move(e, t, n)
    },
    move: function (e, t, n) {
        var a = $(this.domElement).width(), i = t - $(this.domElement).offset().left;
        i = i < 0 ? 0 : i > a ? 100 : 100 * i / a, this.setPlaybackPosition(i)
    },
    up: function (e, t, n) {
        var a = $(this.domElement).width(), i = t - $(this.domElement).offset().left;
        i = i < 0 ? 0 : i > a ? 100 : 100 * i / a, paella.player.videoContainer.seekTo(i), this.updatePlayBar = !0
    },
    onresize: function () {
        this.drawTimeMarks()
    }
}), Class("paella.PlaybackControl", paella.DomNode, {
    playbackBarId: "",
    pluginsContainer: null,
    _popUpPluginContainer: null,
    _timeLinePluginContainer: null,
    playbackPluginsWidth: 0,
    popupPluginsWidth: 0,
    minPlaybackBarSize: 120,
    playbackBarInstance: null,
    buttonPlugins: [],
    addPlugin: function (e) {
        var t = this, n = "buttonPlugin" + this.buttonPlugins.length;
        this.buttonPlugins.push(e);
        var a = paella.ButtonPlugin.buildPluginButton(e, n);
        e.button = a, this.pluginsContainer.domElement.appendChild(a), $(a).hide(), e.checkEnabled(function (n) {
            var i;
            if (n) {
                $(e.button).show(), paella.pluginManager.setupPlugin(e);
                var r = "buttonPlugin" + t.buttonPlugins.length;
                if (e.getButtonType() == paella.ButtonPlugin.type.popUpButton) {
                    i = t.popUpPluginContainer.domElement;
                    var o = paella.ButtonPlugin.buildPluginPopUp(i, e, r + "_container");
                    t.popUpPluginContainer.registerContainer(e.getName(), o, a, e)
                } else if (e.getButtonType() == paella.ButtonPlugin.type.timeLineButton) {
                    i = t.timeLinePluginContainer.domElement;
                    var l = paella.ButtonPlugin.buildPluginPopUp(i, e, r + "_timeline");
                    t.timeLinePluginContainer.registerContainer(e.getName(), l, a, e)
                }
            } else t.pluginsContainer.domElement.removeChild(e.button)
        })
    },
    initialize: function (e) {
        var t = {};
        this.parent("div", e, t), this.domElement.className = "playbackControls", this.playbackBarId = e + "_playbackBar";
        this.pluginsContainer = new paella.DomNode("div", e + "_playbackBarPlugins"), this.pluginsContainer.domElement.className = "playbackBarPlugins", this.pluginsContainer.domElement.setAttribute("role", "toolbar"), this.addNode(this.pluginsContainer), this.addNode(new paella.PlaybackBar(this.playbackBarId)), paella.pluginManager.setTarget("button", this), Object.defineProperty(this, "popUpPluginContainer", {
            get: function () {
                return this._popUpPluginContainer || (this._popUpPluginContainer = new paella.PopUpContainer(e + "_popUpPluginContainer", "popUpPluginContainer"), this.addNode(this._popUpPluginContainer)), this._popUpPluginContainer
            }
        }), Object.defineProperty(this, "timeLinePluginContainer", {
            get: function () {
                return this._timeLinePluginContainer || (this._timeLinePluginContainer = new paella.TimelineContainer(e + "_timelinePluginContainer", "timelinePluginContainer"), this.addNode(this._timeLinePluginContainer)), this._timeLinePluginContainer
            }
        })
    },
    showPopUp: function (e, t) {
        this.popUpPluginContainer.showContainer(e, t), this.timeLinePluginContainer.showContainer(e, t)
    },
    hidePopUp: function (e, t) {
        this.popUpPluginContainer.hideContainer(e, t), this.timeLinePluginContainer.hideContainer(e, t)
    },
    playbackBar: function () {
        return null == this.playbackBarInstance && (this.playbackBarInstance = this.getNode(this.playbackBarId)), this.playbackBarInstance
    },
    onresize: function () {
        var e = $(this.domElement).width();
        base.log.debug("resize playback bar (width=" + e + ")");
        for (var t = 0; t < this.buttonPlugins.length; ++t) {
            var n = this.buttonPlugins[t], a = n.getMinWindowSize();
            a > 0 && e < a ? n.hideUI() : n.checkVisibility()
        }
        this.getNode(this.playbackBarId).onresize()
    }
}), Class("paella.ControlsContainer", paella.DomNode, {
    playbackControlId: "",
    editControlId: "",
    isEnabled: !0,
    autohideTimer: null,
    hideControlsTimeMillis: 3e3,
    playbackControlInstance: null,
    videoOverlayButtons: null,
    buttonPlugins: [],
    _hidden: !1,
    addPlugin: function (e) {
        var t = "videoOverlayButtonPlugin" + this.buttonPlugins.length;
        this.buttonPlugins.push(e);
        var n = paella.ButtonPlugin.buildPluginButton(e, t);
        this.videoOverlayButtons.domElement.appendChild(n), e.button = n, $(n).hide(), e.checkEnabled(function (t) {
            t && ($(e.button).show(), paella.pluginManager.setupPlugin(e))
        })
    },
    initialize: function (e) {
        this.parent("div", e), this.viewControlId = e + "_view", this.playbackControlId = e + "_playback", this.editControlId = e + "_editor", this.addNode(new paella.PlaybackControl(this.playbackControlId));
        var t = this;
        paella.events.bind(paella.events.showEditor, function (e) {
            t.onShowEditor()
        }), paella.events.bind(paella.events.hideEditor, function (e) {
            t.onHideEditor()
        }), paella.events.bind(paella.events.play, function (e) {
            t.onPlayEvent()
        }), paella.events.bind(paella.events.pause, function (e) {
            t.onPauseEvent()
        }), $(document).mousemove(function (e) {
            paella.player.controls.restartHideTimer()
        }), paella.events.bind(paella.events.endVideo, function (e) {
            t.onEndVideoEvent()
        }), paella.events.bind("keydown", function (e) {
            t.onKeyEvent()
        }), this.videoOverlayButtons = new paella.DomNode("div", e + "_videoOverlayButtonPlugins"), this.videoOverlayButtons.domElement.className = "videoOverlayButtonPlugins", this.videoOverlayButtons.domElement.setAttribute("role", "toolbar"), this.addNode(this.videoOverlayButtons), paella.pluginManager.setTarget("videoOverlayButton", this)
    },
    onShowEditor: function () {
        var e = this.editControl();
        e && $(e.domElement).hide()
    },
    onHideEditor: function () {
        var e = this.editControl();
        e && $(e.domElement).show()
    },
    enterEditMode: function () {
        var e = this.playbackControl(), t = this.editControl();
        e && t && $(e.domElement).hide()
    },
    exitEditMode: function () {
        var e = this.playbackControl(), t = this.editControl();
        e && t && $(e.domElement).show()
    },
    playbackControl: function () {
        return null == this.playbackControlInstance && (this.playbackControlInstance = this.getNode(this.playbackControlId)), this.playbackControlInstance
    },
    editControl: function () {
        return this.getNode(this.editControlId)
    },
    disable: function () {
        this.isEnabled = !1, this.hide()
    },
    enable: function () {
        this.isEnabled = !0, this.show()
    },
    isHidden: function () {
        return this._hidden
    },
    hide: function () {
        function e() {
            t._doHide && ($(t.domElement).css({opacity: 0}), $(t.domElement).hide(), t.domElement.setAttribute("aria-hidden", "true"), t._hidden = !0, paella.events.trigger(paella.events.controlBarDidHide))
        }

        var t = this;
        this._doHide = !0, paella.events.trigger(paella.events.controlBarWillHide), t._doHide && (base.userAgent.browser.IsMobileVersion || base.userAgent.browser.Explorer ? e() : $(this.domElement).animate({opacity: 0}, {
            duration: 300,
            complete: e
        }))
    },
    showPopUp: function (e) {
        this.playbackControl().showPopUp(e)
    },
    hidePopUp: function (e) {
        this.playbackControl().hidePopUp(e)
    },
    show: function () {
        this.isEnabled && ($(this.domElement).stop(), this._doHide = !1, this.domElement.style.opacity = 1, this.domElement.setAttribute("aria-hidden", "false"), this._hidden = !1, $(this.domElement).show(), paella.events.trigger(paella.events.controlBarDidShow))
    },
    autohideTimeout: function () {
        this.playbackControl().playbackBar().isSeeking() ? paella.player.controls.restartHideTimer() : paella.player.controls.hideControls()
    },
    hideControls: function () {
        var e = this;
        paella.player.videoContainer.paused().then(function (t) {
            t ? e.show() : e.hide()
        })
    },
    showControls: function () {
        this.show()
    },
    onPlayEvent: function () {
        this.restartHideTimer()
    },
    onPauseEvent: function () {
        this.clearAutohideTimer()
    },
    onEndVideoEvent: function () {
        this.show(), this.clearAutohideTimer()
    },
    onKeyEvent: function () {
        this.restartHideTimer(), paella.player.videoContainer.paused().then(function (e) {
            e || paella.player.controls.restartHideTimer()
        })
    },
    cancelHideBar: function () {
        this.restartTimerEvent()
    },
    restartTimerEvent: function () {
        var e = this;
        this.isHidden() && this.showControls(), this._doHide = !1, paella.player.videoContainer.paused(function (t) {
            t || e.restartHideTimer()
        })
    },
    clearAutohideTimer: function () {
        null != this.autohideTimer && (this.autohideTimer.cancel(), this.autohideTimer = null)
    },
    restartHideTimer: function () {
        this.showControls(), this.clearAutohideTimer();
        var e = this;
        this.autohideTimer = new base.Timer(function (t) {
            e.autohideTimeout()
        }, this.hideControlsTimeMillis)
    },
    onresize: function () {
        this.playbackControl().onresize()
    }
}), Class("paella.LoaderContainer", paella.DomNode, {
    timer: null, loader: null, loaderPosition: 0, initialize: function (e) {
        this.parent("div", e, {
            position: "fixed",
            backgroundColor: "white",
            opacity: "0.7",
            top: "0px",
            left: "0px",
            right: "0px",
            bottom: "0px",
            zIndex: 1e4
        }), this.loader = this.addNode(new paella.DomNode("div", "", {
            position: "fixed",
            width: "128px",
            height: "128px",
            top: "50%",
            left: "50%",
            marginLeft: "-64px",
            marginTop: "-64px",
            backgroundImage: "url(" + paella.utils.folders.resources() + "/images/loader.png)"
        }));
        var t = this;
        paella.events.bind(paella.events.loadComplete, function (e, n) {
            t.loadComplete(n)
        }), this.timer = new base.Timer(function (e) {
            t.loaderPosition -= 128, t.loader.domElement.style.backgroundPosition = t.loaderPosition + "px"
        }, 1e3), this.timer.repeat = !0
    }, loadComplete: function (e) {
        $(this.domElement).hide(), this.timer.repeat = !1
    }
}), Class("paella.KeyManager", {
    isPlaying: !1,
    Keys: {
        Space: 32,
        Left: 37,
        Up: 38,
        Right: 39,
        Down: 40,
        A: 65,
        B: 66,
        C: 67,
        D: 68,
        E: 69,
        F: 70,
        G: 71,
        H: 72,
        I: 73,
        J: 74,
        K: 75,
        L: 76,
        M: 77,
        N: 78,
        O: 79,
        P: 80,
        Q: 81,
        R: 82,
        S: 83,
        T: 84,
        U: 85,
        V: 86,
        W: 87,
        X: 88,
        Y: 89,
        Z: 90
    },
    enabled: !0,
    initialize: function () {
        var e = this;
        paella.events.bind(paella.events.loadComplete, function (t, n) {
            e.loadComplete(t, n)
        }), paella.events.bind(paella.events.play, function (t) {
            e.onPlay()
        }), paella.events.bind(paella.events.pause, function (t) {
            e.onPause()
        })
    },
    loadComplete: function (e, t) {
        var n = this;
        paella.events.bind("keyup", function (e) {
            n.keyUp(e)
        })
    },
    onPlay: function () {
        this.isPlaying = !0
    },
    onPause: function () {
        this.isPlaying = !1
    },
    keyUp: function (e) {
        this.enabled && (e.altKey && e.ctrlKey ? e.which == this.Keys.P ? this.togglePlayPause() : e.which == this.Keys.S ? this.pause() : e.which == this.Keys.M ? this.mute() : e.which == this.Keys.U ? this.volumeUp() : e.which == this.Keys.D && this.volumeDown() : e.which == this.Keys.Space ? this.togglePlayPause() : e.which == this.Keys.Up ? this.volumeUp() : e.which == this.Keys.Down ? this.volumeDown() : e.which == this.Keys.M && this.mute())
    },
    togglePlayPause: function () {
        this.isPlaying ? paella.player.pause() : paella.player.play()
    },
    pause: function () {
        paella.player.pause()
    },
    mute: function () {
        paella.player.videoContainer.volume().then(function (e) {
            var t = 0;
            0 == e && (t = 1), paella.player.videoContainer.setVolume({master: t, slave: 0})
        })
    },
    volumeUp: function () {
        paella.player.videoContainer.volume().then(function (e) {
            e += .1, e = e > 1 ? 1 : e, paella.player.videoContainer.setVolume({master: e, slave: 0})
        })
    },
    volumeDown: function () {
        paella.player.videoContainer.volume().then(function (e) {
            e -= .1, e = e < 0 ? 0 : e, paella.player.videoContainer.setVolume({master: e, slave: 0})
        })
    }
}), paella.keyManager = new paella.KeyManager, Class("paella.VideoLoader", {
    metadata: {title: "", duration: 0},
    streams: [],
    frameList: [],
    loadStatus: !1,
    codecStatus: !1,
    getMetadata: function () {
        return this.metadata
    },
    loadVideo: function (e, t) {
        t()
    }
}), Class("paella.AccessControl", {
    canRead: function () {
        return paella_DeferredResolved(!0)
    }, canWrite: function () {
        return paella_DeferredResolved(!1)
    }, userData: function () {
        return paella_DeferredResolved({username: "anonymous", name: "Anonymous", avatar: paella.utils.folders.resources() + "/images/default_avatar.png", isAnonymous: !0})
    }, getAuthenticationUrl: function (e) {
        var t = this._authParams.authCallbackName && window[this._authParams.authCallbackName];
        return !t && paella.player.config.auth && (t = paella.player.config.auth.authCallbackName && window[paella.player.config.auth.authCallbackName]), "function" == typeof t ? t(e) : ""
    }
}), Class("paella.PlayerBase", {
    config: null, playerId: "", mainContainer: null, videoContainer: null, controls: null, accessControl: null, checkCompatibility: function () {
        var e = "";
        if (base.parameters.get("ignoreBrowserCheck")) return !0;
        if (base.userAgent.browser.IsMobileVersion) return !0;
        if (base.userAgent.browser.Chrome || base.userAgent.browser.Safari || base.userAgent.browser.Firefox || base.userAgent.browser.Opera || base.userAgent.browser.Edge || base.userAgent.browser.Explorer && base.userAgent.browser.Version.major >= 9) return !0;
        var t = base.dictionary.translate("It seems that your browser is not HTML 5 compatible");
        return paella.events.trigger(paella.events.error, {error: t}), e = t + '<div style="display:block;width:470px;height:140px;margin-left:auto;margin-right:auto;font-family:Verdana,sans-sherif;font-size:12px;"><a href="http://www.google.es/chrome" style="color:#004488;float:left;margin-right:20px;"><img src="' + paella.utils.folders.resources() + 'images/chrome.png" style="width:80px;height:80px" alt="Google Chrome"></img><p>Google Chrome</p></a><a href="http://windows.microsoft.com/en-US/internet-explorer/products/ie/home" style="color:#004488;float:left;margin-right:20px;"><img src="' + paella.utils.folders.resources() + 'images/explorer.png" style="width:80px;height:80px" alt="Internet Explorer 9"></img><p>Internet Explorer 9</p></a><a href="http://www.apple.com/safari/" style="float:left;margin-right:20px;color:#004488"><img src="' + paella.utils.folders.resources() + 'images/safari.png" style="width:80px;height:80px" alt="Safari"></img><p>Safari 5</p></a><a href="http://www.mozilla.org/firefox/" style="float:left;color:#004488"><img src="' + paella.utils.folders.resources() + 'images/firefox.png" style="width:80px;height:80px" alt="Firefox"></img><p>Firefox 12</p></a></div>', e += '<div style="margin-top:30px;"><a id="ignoreBrowserCheckLink" href="#" onclick="window.location = window.location + \'&ignoreBrowserCheck=true\'">' + base.dictionary.translate("Continue anyway") + "</a></div>", paella.messageBox.showError(e, {height: "40%"}), !1
    }, initialize: function (e) {
        if (void 0 != base.parameters.get("log")) {
            var t = 0;
            switch (base.parameters.get("log")) {
                case"error":
                    t = base.Log.kLevelError;
                    break;
                case"warn":
                    t = base.Log.kLevelWarning;
                    break;
                case"debug":
                    t = base.Log.kLevelDebug;
                    break;
                case"log":
                case"true":
                    t = base.Log.kLevelLog
            }
            base.log.setLevel(t)
        }
        if (this.checkCompatibility()) {
            paella.player = this, this.playerId = e, this.mainContainer = $("#" + this.playerId)[0];
            var n = this;
            paella.events.bind(paella.events.loadComplete, function (e, t) {
                n.loadComplete(e, t)
            })
        } else base.log.debug("It seems that your browser is not HTML 5 compatible")
    }, loadComplete: function (e, t) {
    }, auth: {
        login: function (e) {
            e = e || window.location.href;
            var t = paella.initDelegate.initParams.accessControl.getAuthenticationUrl(e);
            t && (window.location.href = t)
        }, canRead: function () {
            return paella.initDelegate.initParams.accessControl.canRead()
        }, canWrite: function () {
            return paella.initDelegate.initParams.accessControl.canWrite()
        }, userData: function () {
            return paella.initDelegate.initParams.accessControl.userData()
        }
    }
}), Class("paella.InitDelegate", {
    initParams: {configUrl: "config/config.json", dictionaryUrl: "localization/paella", accessControl: null, videoLoader: null},
    initialize: function (e) {
        if (e) for (var t in e) this.initParams[t] = e[t]
    },
    getId: function () {
        return base.parameters.get("id") || "noid"
    },
    loadDictionary: function () {
        var e = this;
        return new Promise(function (t) {
            base.ajax.get({url: e.initParams.dictionaryUrl + "_" + base.dictionary.currentLanguage() + ".json"}, function (e, n, a) {
                base.dictionary.addDictionary(e), t(e)
            }, function (e, n, a) {
                t()
            })
        })
    },
    loadConfig: function () {
        var e = this;
        return new Promise(function (t, n) {
            var a = e.initParams.configUrl, i = {};
            i.url = a, base.ajax.get(i, function (a, i, r) {
                if ("string" == typeof a) try {
                    a = JSON.parse(a)
                } catch (e) {
                    return void n()
                }
                base.dictionary.addDictionary(a);
                var o = Class.fromString(a.player.accessControlClass || "paella.AccessControl");
                e.initParams.accessControl = new o, t(a)
            }, function (e, t, n) {
                paella.messageBox.showError(base.dictionary.translate("Error! Config file not found. Please configure paella!"))
            })
        })
    }
});
var paellaPlayer = null;
paella.plugins = {}, paella.plugins.events = {}, paella.initDelegate = null, Class("paella.PaellaPlayer", paella.PlayerBase, {
    player: null,
    videoIdentifier: "",
    loader: null,
    videoData: null,
    getPlayerMode: function () {
        return paella.player.isFullScreen() ? paella.PaellaPlayer.mode.fullscreen : window.self !== window.top ? paella.PaellaPlayer.mode.embed : paella.PaellaPlayer.mode.standard
    },
    checkFullScreenCapability: function () {
        var e = document.getElementById(paella.player.mainContainer.id);
        return !!(e.webkitRequestFullScreen || e.mozRequestFullScreen || e.msRequestFullscreen || e.requestFullScreen) || !(!base.userAgent.browser.IsMobileVersion || !paella.player.videoContainer.isMonostream)
    },
    addFullScreenListeners: function () {
        var e = this, t = function () {
            setTimeout(function () {
                paella.pluginManager.checkPluginsVisibility()
            }, 1e3);
            var t = document.getElementById(paella.player.mainContainer.id);
            paella.player.isFullScreen() ? (t.style.width = "100%", t.style.height = "100%") : (t.style.width = "", t.style.height = ""), e.isFullScreen() ? paella.events.trigger(paella.events.enterFullscreen) : paella.events.trigger(paella.events.exitFullscreen)
        };
        this.eventFullScreenListenerAdded || (this.eventFullScreenListenerAdded = !0, document.addEventListener("fullscreenchange", t, !1), document.addEventListener("webkitfullscreenchange", t, !1), document.addEventListener("mozfullscreenchange", t, !1), document.addEventListener("MSFullscreenChange", t, !1), document.addEventListener("webkitendfullscreen", t, !1))
    },
    isFullScreen: function () {
        var e = !0 === document.webkitIsFullScreen, t = void 0 !== document.msFullscreenElement && null !== document.msFullscreenElement, n = !0 === document.mozFullScreen,
            a = void 0 !== document.fullScreenElement && null !== document.fullScreenElement;
        return e || t || n || a
    },
    goFullScreen: function () {
        if (!this.isFullScreen()) if (base.userAgent.system.iOS) paella.player.videoContainer.masterVideo().goFullScreen(); else {
            var e = document.getElementById(paella.player.mainContainer.id);
            e.webkitRequestFullScreen ? e.webkitRequestFullScreen() : e.mozRequestFullScreen ? e.mozRequestFullScreen() : e.msRequestFullscreen ? e.msRequestFullscreen() : e.requestFullScreen && e.requestFullScreen()
        }
    },
    exitFullScreen: function () {
        this.isFullScreen() && (document.webkitCancelFullScreen ? document.webkitCancelFullScreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.msExitFullscreen() ? document.msExitFullscreen() : document.cancelFullScreen && document.cancelFullScreen())
    },
    setProfile: function (e, t) {
        this.videoContainer.setProfile(e, t).then(function (e) {
            return paella.player.getProfile(e)
        }).then(function (t) {
            paella.player.videoContainer.isMonostream || base.cookies.set("lastProfile", e), paella.events.trigger(paella.events.setProfile, {profileName: e})
        })
    },
    getProfile: function (e) {
        return this.videoContainer.getProfile(e)
    },
    initialize: function (e) {
        if (this.parent(e), this.playerId == e) {
            this.loadPaellaPlayer()
        }
        Object.defineProperty(this, "selectedProfile", {
            get: function () {
                return this.videoContainer.getCurrentProfileName()
            }
        })
    },
    loadPaellaPlayer: function () {
        var e = this;
        this.loader = new paella.LoaderContainer("paellaPlayer_loader"), $("body")[0].appendChild(this.loader.domElement), paella.events.trigger(paella.events.loadStarted), paella.initDelegate.loadDictionary().then(function () {
            return paella.initDelegate.loadConfig()
        }).then(function (t) {
            if (e.accessControl = paella.initDelegate.initParams.accessControl, e.onLoadConfig(t), t.skin) {
                var n = t.skin.default || "dark";
                paella.utils.skin.restore(n)
            }
        })
    },
    onLoadConfig: function (e) {
        if (paella.data = new paella.Data(e), this.config = e, this.videoIdentifier = paella.initDelegate.getId(), this.videoIdentifier) {
            if (this.mainContainer) {
                this.videoContainer = new paella.VideoContainer(this.playerId + "_videoContainer");
                var t = new paella.BestFitVideoQualityStrategy;
                try {
                    var n = this.config.player.videoQualityStrategy;
                    t = new (Class.fromString(n))
                } catch (e) {
                    base.log.warning("Error selecting video quality strategy: strategy not found")
                }
                this.videoContainer.setVideoQualityStrategy(t), this.mainContainer.appendChild(this.videoContainer.domElement)
            }
            $(window).resize(function (e) {
                paella.player.onresize()
            }), this.onload()
        }
        paella.pluginManager.loadPlugins("paella.FastLoadPlugin")
    },
    onload: function () {
        var e = this, t = (this.accessControl, !1), n = {};
        this.accessControl.canRead().then(function (n) {
            return t = n, e.accessControl.userData()
        }).then(function (a) {
            if (n = a, t) e.loadVideo(), e.videoContainer.publishVideo(); else if (n.isAnonymous) {
                var i = paella.initDelegate.initParams.accessControl.getAuthenticationUrl("player/?id=" + paella.player.videoIdentifier),
                    r = "<div>" + base.dictionary.translate("You are not authorized to view this resource") + "</div>";
                i && (r += '<div class="login-link"><a href="' + i + '">' + base.dictionary.translate("Login") + "</a></div>"), e.unloadAll(r)
            } else {
                var o = base.dictionary.translate("You are not authorized to view this resource");
                e.unloadAll(o), paella.events.trigger(paella.events.error, {error: o})
            }
        }).catch(function (t) {
            var n = base.dictionary.translate(t);
            e.unloadAll(n), paella.events.trigger(paella.events.error, {error: n})
        })
    },
    onresize: function () {
        this.videoContainer.onresize(), this.controls && this.controls.onresize();
        var e = paella.utils.cookies.get("lastProfile");
        e ? this.setProfile(e, !1) : this.setProfile(paella.Profiles.getDefaultProfile(), !1), paella.events.trigger(paella.events.resize, {
            width: $(this.videoContainer.domElement).width(),
            height: $(this.videoContainer.domElement).height()
        })
    },
    unloadAll: function (e) {
        $("#paellaPlayer_loader")[0];
        this.mainContainer.innerHTML = "", paella.messageBox.showError(e)
    },
    reloadVideos: function (e, t) {
        this.videoContainer && (this.videoContainer.reloadVideos(e, t), this.onresize())
    },
    loadVideo: function () {
        if (this.videoIdentifier) {
            var e = this, t = paella.initDelegate.initParams.videoLoader;
            paella.player.videoLoader = t, this.onresize(), t.loadVideo(this.videoIdentifier, function () {
                e.videoContainer.setStreamData(t.streams).then(function () {
                    paella.events.trigger(paella.events.loadComplete), e.addFullScreenListeners(), e.onresize(), e.videoContainer.autoplay() && e.play()
                }).catch(function (e) {
                    console.log(e)
                })
            })
        }
    },
    showPlaybackBar: function () {
        this.controls || (this.controls = new paella.ControlsContainer(this.playerId + "_controls"), this.mainContainer.appendChild(this.controls.domElement), this.controls.onresize(), paella.events.trigger(paella.events.loadPlugins, {pluginManager: paella.pluginManager}))
    },
    isLiveStream: function () {
        if (void 0 === this._isLiveStream) {
            var e = paella.initDelegate.initParams.videoLoader, t = function (e, t) {
                if (e.length > t) {
                    var n = e[t];
                    for (var a in n.sources) if ("object" == $traceurRuntime.typeof(n.sources[a])) for (var i = 0; i < n.sources[a].length; ++i) {
                        var r = n.sources[a][i];
                        if (r.isLiveStream) return !0
                    }
                }
                return !1
            };
            this._isLiveStream = t(e.streams, 0) || t(e.streams, 1)
        }
        return this._isLiveStream
    },
    loadPreviews: function () {
        var e = paella.initDelegate.initParams.videoLoader.streams, t = null, n = e[0].preview;
        if (e.length >= 2 && (t = e[1].preview), n) {
            var a = paella.player.videoContainer.overlayContainer.getMasterRect();
            this.masterPreviewElem = document.createElement("img"), this.masterPreviewElem.src = n, paella.player.videoContainer.overlayContainer.addElement(this.masterPreviewElem, a)
        }
        if (t) {
            var i = paella.player.videoContainer.overlayContainer.getSlaveRect();
            this.slavePreviewElem = document.createElement("img"), this.slavePreviewElem.src = t, paella.player.videoContainer.overlayContainer.addElement(this.slavePreviewElem, i)
        }
        paella.events.bind(paella.events.timeUpdate, function (e) {
            paella.player.unloadPreviews()
        })
    },
    unloadPreviews: function () {
        this.masterPreviewElem && (paella.player.videoContainer.overlayContainer.removeElement(this.masterPreviewElem), this.masterPreviewElem = null), this.slavePreviewElem && (paella.player.videoContainer.overlayContainer.removeElement(this.slavePreviewElem), this.slavePreviewElem = null)
    },
    loadComplete: function (e, t) {
        paella.pluginManager.loadPlugins("paella.EarlyLoadPlugin"), paella.player.videoContainer._autoplay && this.play()
    },
    play: function () {
        if (!this.controls) {
            this.showPlaybackBar();
            var e = base.parameters.get("time"), t = base.hashParams.get("time"), n = t || (e || "0s"), a = paella.utils.timeParse.timeToSeconds(n);
            a && paella.player.videoContainer.setStartTime(a), paella.events.trigger(paella.events.controlBarLoaded), this.controls.onresize()
        }
        return this.videoContainer.play()
    },
    pause: function () {
        return this.videoContainer.pause()
    },
    playing: function () {
        var e = this;
        return new Promise(function (t) {
            e.paused().then(function (e) {
                t(!e)
            })
        })
    },
    paused: function () {
        return this.videoContainer.paused()
    }
});
var PaellaPlayer = paella.PaellaPlayer;
paella.PaellaPlayer.mode = {standard: "standard", fullscreen: "fullscreen", embed: "embed"}, Class("paella.DefaultVideoLoader", paella.VideoLoader, {
    _url: null,
    initialize: function (e) {
        if ("object" == $traceurRuntime.typeof(e)) this._data = e; else try {
            this._data = JSON.parse(e)
        } catch (t) {
            this._url = e
        }
    },
    loadVideo: function (e, t) {
        if (this._data) this.loadVideoData(this._data, t); else if (this._url) {
            var n = this;
            this._url = (/\/$/.test(this._url) ? this._url : this._url + "/") + e + "/", base.ajax.get({url: this._url + "data.json"}, function (e, a, i) {
                if ("string" == typeof e) try {
                    e = JSON.parse(e)
                } catch (e) {
                }
                n._data = e, n.loadVideoData(n._data, t)
            }, function (e, t, n) {
                switch (n) {
                    case 401:
                        paella.messageBox.showError(base.dictionary.translate("You are not logged in"));
                        break;
                    case 403:
                        paella.messageBox.showError(base.dictionary.translate("You are not authorized to view this resource"));
                        break;
                    case 404:
                        paella.messageBox.showError(base.dictionary.translate("The specified video identifier does not exist"));
                        break;
                    default:
                        paella.messageBox.showError(base.dictionary.translate("Could not load the video"))
                }
            })
        }
    },
    loadVideoData: function (e, t) {
        var n = this;
        e.metadata && (this.metadata = e.metadata), e.streams && e.streams.forEach(function (e) {
            n.loadStream(e)
        }), e.frameList && this.loadFrameData(e), e.captions && this.loadCaptions(e.captions), e.blackboard && this.loadBlackboard(e.streams[0], e.blackboard), this.streams = e.streams, this.frameList = e.frameList, this.loadStatus = this.streams.length > 0, t()
    },
    loadFrameData: function (e) {
        var t = this;
        if (e.frameList && e.frameList.forEach) {
            var n = {};
            e.frameList.forEach(function (e) {
                /^[a-zA-Z]+:\/\//.test(e.url) || /^data:/.test(e.url) || (e.url = t._url + e.url), !e.thumb || /^[a-zA-Z]+:\/\//.test(e.thumb) || /^data:/.test(e.thumb) || (e.thumb = t._url + e.thumb);
                var a = e.time;
                n[a] = e
            }), e.frameList = n
        }
    },
    loadStream: function (e) {
        var t = this;
        !e.preview || /^[a-zA-Z]+:\/\//.test(e.preview) || /^data:/.test(e.preview) || (e.preview = t._url + e.preview), e.sources.image && e.sources.image.forEach(function (e) {
            if (e.frames.forEach) {
                var n = {};
                e.frames.forEach(function (e) {
                    !e.src || /^[a-zA-Z]+:\/\//.test(e.src) || /^data:/.test(e.src) || (e.src = t._url + e.src), !e.thumb || /^[a-zA-Z]+:\/\//.test(e.thumb) || /^data:/.test(e.thumb) || (e.thumb = t._url + e.thumb);
                    var a = "frame_" + e.time;
                    n[a] = e.src
                }), e.frames = n
            }
        });
        for (var n in e.sources) if (e.sources[n]) {
            if ("image" != n) {
                var a = e.sources[n];
                a.forEach(function (e) {
                    var n = /^[a-zA-Z\:]+\:\/\//gi;
                    "string" == typeof e.src && null == e.src.match(n) && (e.src = t._url + e.src), e.type = e.mimetype
                })
            }
        } else delete e.sources[n]
    },
    loadCaptions: function (e) {
        if (e) for (var t = 0; t < e.length; ++t) {
            var n = e[t].url;
            /^[a-zA-Z]+:\/\//.test(n) || (n = this._url + n);
            var a = new paella.captions.Caption(t, e[t].format, n, {code: e[t].lang, txt: e[t].text});
            paella.captions.addCaptions(a)
        }
    },
    loadBlackboard: function (e, t) {
        var n = this;
        e.sources.image || (e.sources.image = []);
        var a = {count: t.frames.length, duration: t.duration, mimetype: t.mimetype, res: t.res, frames: {}};
        t.frames.forEach(function (e) {
            var t = "frame_" + Math.round(e.time);
            /^[a-zA-Z]+:\/\//.test(e.src) || (e.src = n._url + e.src), a.frames[t] = e.src
        }), e.sources.image.push(a)
    }
}), Class("paella.DefaultInitDelegate", paella.InitDelegate, {
    initialize: function (e, t) {
        1 == arguments.length ? this.parent(arguments[0]) : 2 == arguments.length && (this._config = arguments[0], this.parent(arguments[1]))
    }, loadConfig: function () {
        var e = this;
        return this._config ? new Promise(function (t) {
            base.dictionary.addDictionary(e._config);
            var n = Class.fromString(e._config.player.accessControlClass || "paella.AccessControl");
            e.initParams.accessControl = new n, t(e._config)
        }) : this.parent()
    }
}), paella.load = function (e, t) {
    var n = (t && t.auth, {videoLoader: new paella.DefaultVideoLoader(t.data || t.url)});
    t.config ? paella.initDelegate = new paella.DefaultInitDelegate(t.config, n) : paella.initDelegate = new paella.DefaultInitDelegate(n), new PaellaPlayer(e, paella.initDelegate)
}, Class("paella.RightBarPlugin", paella.DeferredLoadPlugin, {
    type: "rightBarPlugin", getName: function () {
        return "es.upv.paella.RightBarPlugin"
    }, buildContent: function (e) {
    }
}), Class("paella.TabBarPlugin", paella.DeferredLoadPlugin, {
    type: "tabBarPlugin", getName: function () {
        return "es.upv.paella.TabBarPlugin"
    }, getTabName: function () {
        return "New Tab"
    }, action: function (e) {
    }, buildContent: function (e) {
    }, setToolTip: function (e) {
        this.button.setAttribute("title", e), this.button.setAttribute("aria-label", e)
    }, getDefaultToolTip: function () {
        return ""
    }
}), Class("paella.ExtendedAdapter", {
    rightContainer: null,
    bottomContainer: null,
    rightBarPlugins: [],
    tabBarPlugins: [],
    currentTabIndex: 0,
    bottomContainerTabs: null,
    bottomContainerContent: null,
    initialize: function () {
        this.rightContainer = document.createElement("div"), this.rightContainer.className = "rightPluginContainer", this.bottomContainer = document.createElement("div"), this.bottomContainer.className = "tabsPluginContainer";
        var e = document.createElement("div");
        e.className = "tabsLabelContainer", this.bottomContainerTabs = e, this.bottomContainer.appendChild(e);
        var t = document.createElement("div");
        t.className = "tabsContentContainer", this.bottomContainerContent = t, this.bottomContainer.appendChild(t), this.initPlugins()
    },
    initPlugins: function () {
        paella.pluginManager.setTarget("rightBarPlugin", this), paella.pluginManager.setTarget("tabBarPlugin", this)
    },
    addPlugin: function (e) {
        var t = this;
        e.checkEnabled(function (n) {
            n && (paella.pluginManager.setupPlugin(e), "rightBarPlugin" == e.type && (t.rightBarPlugins.push(e), t.addRightBarPlugin(e)), "tabBarPlugin" == e.type && (t.tabBarPlugins.push(e), t.addTabPlugin(e)))
        })
    },
    showTab: function (e) {
        var t = 0, n = this.bottomContainer.getElementsByClassName("tabLabel"), a = this.bottomContainer.getElementsByClassName("tabContent");
        for (t = 0; t < n.length; ++t) n[t].getAttribute("tab") == e ? n[t].className = "tabLabel enabled" : n[t].className = "tabLabel disabled";
        for (t = 0; t < a.length; ++t) a[t].getAttribute("tab") == e ? a[t].className = "tabContent enabled" : a[t].className = "tabContent disabled"
    },
    addTabPlugin: function (e) {
        var t = this, n = this.currentTabIndex, a = document.createElement("div");
        a.setAttribute("tab", n), a.className = "tabLabel disabled", a.innerHTML = e.getTabName(), a.plugin = e, $(a).click(function (e) {
            /disabled/.test(this.className) && (t.showTab(n), this.plugin.action(this))
        }), $(a).keyup(function (e) {
            13 == e.keyCode && /disabledTabItem/.test(this.className) && (t.showTab(n), this.plugin.action(this))
        }), this.bottomContainerTabs.appendChild(a);
        var i = document.createElement("div");
        i.setAttribute("tab", n), i.className = "tabContent disabled " + e.getSubclass(), this.bottomContainerContent.appendChild(i), e.buildContent(i), e.button = a, e.container = i, e.button.setAttribute("tabindex", 3e3 + e.getIndex()), e.button.setAttribute("alt", ""), e.setToolTip(e.getDefaultToolTip()), void 0 === this.firstTabShown && (this.showTab(n), this.firstTabShown = !0), ++this.currentTabIndex
    },
    addRightBarPlugin: function (e) {
        var t = document.createElement("div");
        t.className = "rightBarPluginContainer " + e.getSubclass(), this.rightContainer.appendChild(t), e.buildContent(t)
    }
}), paella.extendedAdapter = new paella.ExtendedAdapter, Class("paella.editor.EmbedPlayer", base.AsyncLoaderCallback, {
    editar: null, initialize: function () {
        this.editor = paella.editor.instance
    }, load: function (e, t) {
        var n = this.editor.bottomBar.getHeight() + 20, a = this.editor.rightBar.getWidth() + 20;
        $(paella.player.mainContainer).css({
            position: "fixed",
            width: "",
            bottom: n + "px",
            right: a + "px",
            left: "20px",
            top: "20px"
        }), paella.player.mainContainer.className = "paellaMainContainerEditorMode", new Timer(function (t) {
            paella.player.controls.disable(), paella.player.onresize(), e && e()
        }, 500)
    }, restorePlayer: function () {
        $("body")[0].appendChild(paella.player.mainContainer), paella.player.controls.enable(), paella.player.mainContainer.className = "", $(paella.player.mainContainer).css({
            position: "",
            width: "",
            bottom: "",
            left: "",
            right: "",
            top: ""
        }), paella.player.onresize()
    }, onresize: function () {
        var e = this.editor.bottomBar.getHeight() + 20, t = this.editor.rightBar.getWidth() + 20;
        $(paella.player.mainContainer).css({
            position: "fixed", width: "", bottom: e + "px", right: t + "px", left: "20px",
            top: "20px"
        })
    }
}), DeprecatedClass("paella.Dictionary", "base.Dictionary", base.Dictionary), paella.dictionary = base.dictionary, DeprecatedClass("paella.AsyncLoaderCallback", "base.AsyncLoaderCallback", base.AsyncLoaderCallback), DeprecatedClass("paella.AjaxCallback", "base.AjaxCallback", base.AjaxCallback), DeprecatedClass("paella.JSONCallback", "base.JSONCallback", base.JSONCallback), DeprecatedClass("paella.DictionaryCallback", "base.DictionaryCallback", base.DictionaryCallback), DeprecatedClass("paella.AsyncLoader", "base.AsyncLoader", base.AsyncLoader), DeprecatedClass("paella.Timer", "base.Timer", base.Timer), DeprecatedClass("paella.utils.Timer", "base.Timer", base.Timer), paella.ajax = {}, paella.ajax.send = DeprecatedFunc("paella.ajax.send", "base.ajax.send", base.ajax.send), paella.ajax.get = DeprecatedFunc("paella.ajax.get", "base.ajax.get", base.ajax.get), paella.ajax.put = DeprecatedFunc("paella.ajax.put", "base.ajax.put", base.ajax.put), paella.ajax.post = DeprecatedFunc("paella.ajax.post", "base.ajax.post", base.ajax.post), paella.ajax.delete = DeprecatedFunc("paella.ajax.delete", "base.ajax.delete", base.ajax.send), paella.ui = {}, paella.ui.Container = function (e) {
    var t = document.createElement("div");
    return e.id && (t.id = e.id), e.className && (t.className = e.className), e.style && $(t).css(e.style), t
}, paella.utils.ajax = base.ajax, paella.utils.cookies = base.cookies, paella.utils.parameters = base.parameters, paella.utils.require = base.require, paella.utils.importStylesheet = base.importStylesheet, paella.utils.language = base.dictionary.currentLanguage, paella.utils.uuid = base.uuid, paella.utils.userAgent = base.userAgent, paella.debug = {
    log: function (e) {
        base.log.warning("paella.debug.log is deprecated, use base.debug.[error/warning/debug/log] instead."), base.log.log(e)
    }
}, Class("paella.plugins.FlexSkipPlugin", paella.ButtonPlugin, {
    getAlignment: function () {
        return "left"
    }, getName: function () {
        return "edu.harvard.dce.paella.flexSkipPlugin"
    }, getIndex: function () {
        return 121
    }, getSubclass: function () {
        return "flexSkip_Rewind_10"
    }, formatMessage: function () {
        return "Rewind 10 seconds"
    }, getDefaultToolTip: function () {
        return base.dictionary.translate(this.formatMessage())
    }, getMinWindowSize: function () {
        return 510
    }, checkEnabled: function (e) {
        e(!paella.player.isLiveStream())
    }, action: function (e) {
        paella.player.videoContainer.currentTime().then(function (e) {
            paella.player.videoContainer.seekToTime(e - 10)
        })
    }
}), paella.plugins.flexSkipPlugin = new paella.plugins.FlexSkipPlugin, Class("paella.plugins.FlexSkipForwardPlugin", paella.plugins.FlexSkipPlugin, {
    getIndex: function () {
        return 122
    }, getName: function () {
        return "edu.harvard.dce.paella.flexSkipForwardPlugin"
    }, getSubclass: function () {
        return "flexSkip_Forward_30"
    }, formatMessage: function () {
        return "Forward 30 seconds"
    }, action: function (e) {
        paella.player.videoContainer.currentTime().then(function (e) {
            paella.player.videoContainer.seekToTime(e + 30)
        })
    }
}), paella.plugins.flexSkipForwardPlugin = new paella.plugins.FlexSkipForwardPlugin, Class("paella.plugins.AnnotationsPlayerPlugin", paella.EventDrivenPlugin, {
    annotations: null,
    lastEvent: 0,
    visibleAnnotations: null,
    getName: function () {
        return "es.upv.paella.annotationsPlayerPlugin"
    },
    checkEnabled: function (e) {
        var t = this;
        this.annotations = [], this.visibleAnnotations = [], paella.data.read("annotations", {id: paella.initDelegate.getId()}, function (n, a) {
            n && "object" == $traceurRuntime.typeof(n) && n.annotations && n.annotations.length > 0 && (t.annotations = n.annotations), e(!0)
        })
    },
    getEvents: function () {
        return [paella.events.timeUpdate]
    },
    onEvent: function (e, t) {
        this.checkAnnotations(t)
    },
    checkAnnotations: function (e) {
        for (var t, n = 0; n < this.annotations.length; ++n) t = this.annotations[n], t.s < e.currentTime && t.e > e.currentTime && this.showAnnotation(t);
        for (var a in this.visibleAnnotations) "object" == $traceurRuntime.typeof(t) && (t = this.visibleAnnotations[a]) && (t.s >= e.currentTime || t.e <= e.currentTime) && this.removeAnnotation(t)
    },
    showAnnotation: function (e) {
        if (!this.visibleAnnotations[e.s]) {
            var t = {left: 100, top: 10, width: 1080, height: 20};
            e.elem = paella.player.videoContainer.overlayContainer.addText(e.content, t), e.elem.className = "textAnnotation", this.visibleAnnotations[e.s] = e
        }
    },
    removeAnnotation: function (e) {
        if (this.visibleAnnotations[e.s]) {
            var t = this.visibleAnnotations[e.s].elem;
            paella.player.videoContainer.overlayContainer.removeElement(t), this.visibleAnnotations[e.s] = null
        }
    }
}), paella.plugins.annotationsPlayerlugin = new paella.plugins.AnnotationsPlayerPlugin, Class("paella.plugins.ArrowSlidesNavigator", paella.EventDrivenPlugin, {
    getName: function () {
        return "es.upv.paella.arrowSlidesNavigatorPlugin"
    }, checkEnabled: function (e) {
        e(!paella.initDelegate.initParams.videoLoader.frameList || 0 == Object.keys(paella.initDelegate.initParams.videoLoader.frameList).length && paella.player.videoContainer.isMonostream ? !1 : !0)
    }, setup: function () {
        var e = this;
        this._showArrowsIn = this.config.showArrowsIn || "slave", this.createOverlay(), e._frames = [];
        var t = paella.initDelegate.initParams.videoLoader.frameList;
        if (t) {
            var n = Object.keys(t);
            n.length, n.map(function (e) {
                return Number(e, 10)
            }).sort(function (e, t) {
                return e - t
            }).forEach(function (n) {
                e._frames.push(t[n])
            })
        }
    }, createOverlay: function () {
        var e = this, t = paella.player.videoContainer.overlayContainer;
        if (!this.arrows) {
            this.arrows = document.createElement("div"), this.arrows.id = "arrows", this.arrows.style.marginTop = "25%";
            var n = document.createElement("div");
            n.className = "buttonPlugin arrowSlideNavidator nextButton right", this.arrows.appendChild(n);
            var a = document.createElement("div");
            a.className = "buttonPlugin arrowSlideNavidator prevButton left", this.arrows.appendChild(a), $(n).click(function (t) {
                e.goNextSlide(), t.stopPropagation()
            }), $(a).click(function (t) {
                e.goPrevSlide(), t.stopPropagation()
            })
        }
        switch (this.container && t.removeElement(this.container), e._showArrowsIn) {
            case"full":
                this.container = t.addLayer(), this.container.style.marginRight = "0", this.container.style.marginLeft = "0", this.arrows.style.marginTop = "25%";
                break;
            case"master":
                var i = document.createElement("div");
                this.container = t.addElement(i, t.getMasterRect()), this.arrows.style.marginTop = "23%";
                break;
            case"slave":
                var i = document.createElement("div");
                this.container = t.addElement(i, t.getSlaveRect()), this.arrows.style.marginTop = "35%"
        }
        this.container.appendChild(this.arrows), this.hideArrows()
    }, goNextSlide: function () {
        var e = this;
        paella.player.videoContainer.currentTime().then(function (t) {
            if (e._frames.length > 1) for (var n = 0; n < e._frames.length - 1; n++) {
                var a = e._frames[n], i = e._frames[n + 1];
                a.time <= t && i.time > t && paella.player.videoContainer.seekToTime(i.time)
            }
        })
    }, goPrevSlide: function () {
        var e = this;
        paella.player.videoContainer.currentTime().then(function (t) {
            if (1 == e._frames.length) paella.player.videoContainer.seekToTime(e._frames[0].time); else if (t < e._frames[1].time) paella.player.videoContainer.seekToTime(e._frames[0].time); else if (e._frames[e._frames.length - 1].time <= t) paella.player.videoContainer.seekToTime(e._frames[e._frames.length - 2].time); else for (var n = 1; n < e._frames.length - 1; n++) {
                var a = e._frames[n], i = e._frames[n + 1];
                a.time <= t && i.time > t && paella.player.videoContainer.seekToTime(e._frames[n - 1].time)
            }
        })
    }, showArrows: function () {
        $(this.arrows).show()
    }, hideArrows: function () {
        $(this.arrows).hide()
    }, getEvents: function () {
        return [paella.events.controlBarDidShow, paella.events.controlBarDidHide, paella.events.setComposition]
    }, onEvent: function (e, t) {
        switch (e) {
            case paella.events.controlBarDidShow:
                this.showArrows();
                break;
            case paella.events.controlBarDidHide:
                this.hideArrows();
                break;
            case paella.events.setComposition:
                this.createOverlay()
        }
    }
}), paella.plugins.arrowSlidesNavigator = new paella.plugins.ArrowSlidesNavigator, Class("paella.BlackBoard2", paella.EventDrivenPlugin, {
    _blackBoardProfile: "s_p_blackboard2",
    _blackBoardDIV: null,
    _hasImages: null,
    _active: !1,
    _creationTimer: 500,
    _zImages: null,
    _videoLength: null,
    _keys: null,
    _currentImage: null,
    _next: null,
    _prev: null,
    _lensDIV: null,
    _lensContainer: null,
    _lensWidth: null,
    _lensHeight: null,
    _conImg: null,
    _zoom: 250,
    _currentZoom: null,
    _maxZoom: 500,
    _mousePos: null,
    _containerRect: null,
    getName: function () {
        return "es.upv.paella.blackBoardPlugin"
    },
    getIndex: function () {
        return 10
    },
    getAlignment: function () {
        return "right"
    },
    getSubclass: function () {
        return "blackBoardButton2"
    },
    getDefaultToolTip: function () {
        return base.dictionary.translate("BlackBoard")
    },
    checkEnabled: function (e) {
        e(!0)
    },
    getEvents: function () {
        return [paella.events.setProfile, paella.events.timeUpdate]
    },
    onEvent: function (e, t) {
        var n = this;
        switch (e) {
            case paella.events.setProfile:
                if (t.profileName != n._blackBoardProfile) {
                    n._active && (n.destroyOverlay(), n._active = !1);
                    break
                }
                n._hasImages || paella.player.setProfile("slide_professor"), n._hasImages && !n._active && (n.createOverlay(), n._active = !0);
                break;
            case paella.events.timeUpdate:
                n._active && n._hasImages && n.imageUpdate(e, t)
        }
    },
    setup: function () {
        var e = this;
        if (paella.player.videoContainer.sourceData[0].sources.hasOwnProperty("image")) e._hasImages = !0, e._zImages = {}, e._zImages = paella.player.videoContainer.sourceData[0].sources.image[0].frames, e._videoLength = paella.player.videoContainer.sourceData[0].sources.image[0].duration, e._keys = Object.keys(e._zImages), e._keys = e._keys.sort(function (e, t) {
            return e = e.slice(6), t = t.slice(6), parseInt(e) - parseInt(t)
        }); else if (e._hasImages = !1, paella.player.selectedProfile == e._blackBoardProfile) {
            var t = paella.player.config.defaultProfile;
            paella.player.setProfile(t)
        }
        this._next = 0, this._prev = 0, paella.player.selectedProfile == e._blackBoardProfile && (e.createOverlay(), e._active = !0), e._mousePos = {}, paella.Profiles.loadProfile(e._blackBoardProfile, function (t) {
            e._containerRect = t.blackBoardImages
        })
    },
    createLens: function () {
        var e = this;
        null == e._currentZoom && (e._currentZoom = e._zoom);
        var t = document.createElement("div");
        t.className = "lensClass", e._lensDIV = t;
        var n = $(".conImg").offset(), a = $(".conImg").width(), i = $(".conImg").height();
        t.style.width = a / (e._currentZoom / 100) + "px", t.style.height = i / (e._currentZoom / 100) + "px", e._lensWidth = parseInt(t.style.width), e._lensHeight = parseInt(t.style.height), $(e._lensContainer).append(t), $(e._lensContainer).mousemove(function (t) {
            var r = t.pageX - n.left, o = t.pageY - n.top;
            e._mousePos.x = r, e._mousePos.y = o;
            var l = o - e._lensHeight / 2;
            l = l < 0 ? 0 : l, l = l > i - e._lensHeight ? i - e._lensHeight : l;
            var s = r - e._lensWidth / 2;
            if (s = s < 0 ? 0 : s, s = s > a - e._lensWidth ? a - e._lensWidth : s, e._lensDIV.style.left = s + "px", e._lensDIV.style.top = l + "px", 100 != e._currentZoom) {
                var u = 100 * s / (a - e._lensWidth), c = 100 * l / (i - e._lensHeight);
                e._blackBoardDIV.style.backgroundPosition = u.toString() + "% " + c.toString() + "%"
            } else if (100 == e._currentZoom) {
                var d = 100 * r / a, p = 100 * o / i;
                e._blackBoardDIV.style.backgroundPosition = d.toString() + "% " + p.toString() + "%"
            }
            e._blackBoardDIV.style.backgroundSize = e._currentZoom + "%"
        }), $(e._lensContainer).bind("wheel mousewheel", function (t) {
            var n;
            n = void 0 !== t.originalEvent.wheelDelta ? t.originalEvent.wheelDelta : -1 * t.originalEvent.deltaY, n > 0 && e._currentZoom < e._maxZoom ? e.reBuildLens(10) : e._currentZoom > 100 ? e.reBuildLens(-10) : 100 == e._currentZoom && (e._lensDIV.style.left = "0px", e._lensDIV.style.top = "0px"), e._blackBoardDIV.style.backgroundSize = e._currentZoom + "%"
        })
    },
    reBuildLens: function (e) {
        var t = this;
        t._currentZoom += e;
        var n = ($(".conImg").offset(), $(".conImg").width()), a = $(".conImg").height();
        if (t._lensDIV.style.width = n / (t._currentZoom / 100) + "px", t._lensDIV.style.height = a / (t._currentZoom / 100) + "px", t._lensWidth = parseInt(t._lensDIV.style.width), t._lensHeight = parseInt(t._lensDIV.style.height), 100 != t._currentZoom) {
            var i = t._mousePos.x, r = t._mousePos.y, o = r - t._lensHeight / 2;
            o = o < 0 ? 0 : o, o = o > a - t._lensHeight ? a - t._lensHeight : o;
            var l = i - t._lensWidth / 2;
            l = l < 0 ? 0 : l, l = l > n - t._lensWidth ? n - t._lensWidth : l, t._lensDIV.style.left = l + "px", t._lensDIV.style.top = o + "px";
            var s = 100 * l / (n - t._lensWidth), u = 100 * o / (a - t._lensHeight);
            t._blackBoardDIV.style.backgroundPosition = s.toString() + "% " + u.toString() + "%"
        }
    },
    destroyLens: function () {
        var e = this;
        e._lensDIV && ($(e._lensDIV).remove(), e._blackBoardDIV.style.backgroundSize = "100%", e._blackBoardDIV.style.opacity = 0)
    },
    createOverlay: function () {
        var e = this, t = document.createElement("div");
        t.className = "blackBoardDiv", e._blackBoardDIV = t, e._blackBoardDIV.style.opacity = 0;
        var n = document.createElement("div");
        n.className = "lensContainer", e._lensContainer = n;
        var a = document.createElement("img");
        a.className = "conImg", e._conImg = a, e._currentImage && (e._conImg.src = e._currentImage, $(e._blackBoardDIV).css("background-image", "url(" + e._currentImage + ")")), $(n).append(a), $(e._lensContainer).mouseenter(function () {
            e.createLens(), e._blackBoardDIV.style.opacity = 1
        }), $(e._lensContainer).mouseleave(function () {
            e.destroyLens()
        }), setTimeout(function () {
            var a = paella.player.videoContainer.overlayContainer;
            a.addElement(t, a.getMasterRect()), a.addElement(n, e._containerRect)
        }, e._creationTimer)
    },
    destroyOverlay: function () {
        var e = this;
        e._blackBoardDIV && $(e._blackBoardDIV).remove(), e._lensContainer && $(e._lensContainer).remove()
    },
    imageUpdate: function (e, t) {
        var n = this, a = Math.round(t.currentTime), i = $(n._blackBoardDIV).css("background-image");
        if ($(n._blackBoardDIV).length > 0) {
            if (n._zImages.hasOwnProperty("frame_" + a)) {
                if (i == n._zImages["frame_" + a]) return;
                i = n._zImages["frame_" + a]
            } else {
                if (!(a > n._next || a < n._prev)) return;
                i = n.returnSrc(a)
            }
            var r = new Image;
            r.onload = function () {
                $(n._blackBoardDIV).css("background-image", "url(" + i + ")")
            }, r.src = i, n._currentImage = i, n._conImg.src = n._currentImage
        }
    },
    returnSrc: function (e) {
        for (var t = 0, n = 0; n < this._keys.length; n++) {
            var a = parseInt(this._keys[n].slice(6)), i = parseInt(this._keys[this._keys.length - 1].slice(6));
            if (e < a) return this._next = a, this._prev = t, this._imageNumber = n - 1, this._zImages["frame_" + t];
            if (e > i && e < this._videoLength) return this._next = this._videoLength, this._prev = i, this._zImages["frame_" + t];
            t = a
        }
    }
}), paella.plugins.blackBoard2 = new paella.BlackBoard2, Class("paella.plugins.BreaksPlayerPlugin", paella.EventDrivenPlugin, {
    breaks: null,
    lastEvent: 0,
    visibleBreaks: null,
    getName: function () {
        return "es.upv.paella.breaksPlayerPlugin"
    },
    checkEnabled: function (e) {
        var t = this;
        this.breaks = [], this.visibleBreaks = [], paella.data.read("breaks", {id: paella.initDelegate.getId()}, function (n, a) {
            n && "object" == $traceurRuntime.typeof(n) && n.breaks && n.breaks.length > 0 && (t.breaks = n.breaks), e(!0)
        })
    },
    getEvents: function () {
        return [paella.events.timeUpdate]
    },
    onEvent: function (e, t) {
        var n = this;
        t.videoContainer.currentTime(!0).then(function (e) {
            n.checkBreaks(e)
        })
    },
    checkBreaks: function (e) {
        for (var t, n = 0; n < this.breaks.length; ++n) t = this.breaks[n], t.s < e && t.e > e ? this.areBreaksClickable() ? this.avoidBreak(t) : this.showBreaks(t) : t.s.toFixed(0) == e.toFixed(0) && this.avoidBreak(t);
        if (!this.areBreaksClickable()) for (var a in this.visibleBreaks) "object" == $traceurRuntime.typeof(t) && (t = this.visibleBreaks[a]) && (t.s >= e || t.e <= e) && this.removeBreak(t)
    },
    areBreaksClickable: function () {
        return this.config.neverShow && !(paella.editor.instance && paella.editor.instance.isLoaded)
    },
    showBreaks: function (e) {
        if (!this.visibleBreaks[e.s]) {
            var t = {left: 100, top: 350, width: 1080, height: 20};
            e.elem = paella.player.videoContainer.overlayContainer.addText(e.content, t), e.elem.className = "textBreak", this.visibleBreaks[e.s] = e
        }
    },
    removeBreak: function (e) {
        if (this.visibleBreaks[e.s]) {
            var t = this.visibleBreaks[e.s].elem;
            paella.player.videoContainer.overlayContainer.removeElement(t), this.visibleBreaks[e.s] = null
        }
    },
    avoidBreak: function (e) {
        var t = e.e + (this.config.neverShow ? .01 : 0) - paella.player.videoContainer.trimStart();
        paella.player.videoContainer.seekToTime(t)
    }
}), paella.plugins.breaksPlayerPlugin = new paella.plugins.BreaksPlayerPlugin, Class("paella.plugins.AirPlayPlugin", paella.ButtonPlugin, {
    _visible: !1, getIndex: function () {
        return 552
    }, getAlignment: function () {
        return "right"
    }, getSubclass: function () {
        return "AirPlayButton"
    }, getName: function () {
        return "es.upv.paella.airPlayPlugin"
    }, checkEnabled: function (e) {
        e(window.WebKitPlaybackTargetAvailabilityEvent)
    }, getDefaultToolTip: function () {
        return base.dictionary.translate("Emit to AirPlay.")
    }, setup: function () {
        var e = this, t = paella.player.videoContainer.masterVideo().video;
        window.WebKitPlaybackTargetAvailabilityEvent && t.addEventListener("webkitplaybacktargetavailabilitychanged", function (t) {
            switch (t.availability) {
                case"available":
                    e._visible = !0;
                    break;
                case"not-available":
                    e._visible = !1
            }
            e.updateClassName()
        })
    }, action: function (e) {
        paella.player.videoContainer.masterVideo().video.webkitShowPlaybackTargetPicker()
    }, updateClassName: function () {
        this.button.className = this.getButtonItemClass(!0)
    }, getButtonItemClass: function (e) {
        return "buttonPlugin " + this.getSubclass() + " " + this.getAlignment() + " " + (this._visible ? "available" : "not-available")
    }
}), paella.plugins.airPlayPlugin = new paella.plugins.AirPlayPlugin, function () {
    Class("paella.captions.parsers.DFXPParserPlugin", paella.CaptionParserPlugIn, {
        ext: ["dfxp"], getName: function () {
            return "es.upv.paella.captions.DFXPParserPlugin"
        }, parse: function (e, t, n) {
            for (var a = [], i = this, r = $(e), o = r.attr("xml:lang"), l = r.find("div"), s = 0; s < l.length; ++s) {
                var u = $(l[s]), c = u.attr("xml:lang");
                if (void 0 != c && "" != c || (void 0 == o || "" == o ? (base.log.debug("No xml:lang found! Using '" + t + "' lang instead."), c = t) : c = o), c == t) {
                    u.find("p").each(function (e, t) {
                        var n = {id: e, begin: i.parseTimeTextToSeg(t.getAttribute("begin")), end: i.parseTimeTextToSeg(t.getAttribute("end")), content: $(t).text().trim()};
                        a.push(n)
                    });
                    break
                }
            }
            a.length > 0 ? n(!1, a) : n(!0)
        }, parseTimeTextToSeg: function (e) {
            var t = 0;
            if (/^([0-9]*([.,][0-9]*)?)s/.test(e)) t = parseFloat(RegExp.$1); else {
                var n = e.split(":"), a = parseInt(n[0]), i = parseInt(n[1]);
                t = parseInt(n[2]) + 60 * i + 60 * a * 60
            }
            return t
        }
    }), new paella.captions.parsers.DFXPParserPlugin
}(), Class("paella.plugins.CaptionsPlugin", paella.ButtonPlugin, {
    _searchTimerTime: 1500,
    _searchTimer: null,
    _pluginButton: null,
    _open: 0,
    _parent: null,
    _body: null,
    _inner: null,
    _bar: null,
    _input: null,
    _select: null,
    _editor: null,
    _activeCaptions: null,
    _lastSel: null,
    _browserLang: null,
    _defaultBodyHeight: 280,
    _autoScroll: !0,
    _searchOnCaptions: null,
    getAlignment: function () {
        return "right"
    },
    getSubclass: function () {
        return "captionsPluginButton"
    },
    getName: function () {
        return "es.upv.paella.captionsPlugin"
    },
    getButtonType: function () {
        return paella.ButtonPlugin.type.popUpButton
    },
    getDefaultToolTip: function () {
        return base.dictionary.translate("Subtitles")
    },
    getIndex: function () {
        return 509
    },
    closeOnMouseOut: function () {
        return !0
    },
    checkEnabled: function (e) {
        e(!0)
    },
    showUI: function () {
        paella.captions.getAvailableLangs().length >= 1 && this.parent()
    },
    setup: function () {
        var e = this;
        paella.captions.getAvailableLangs().length || paella.plugins.captionsPlugin.hideUI(), paella.events.bind(paella.events.captionsEnabled, function (t, n) {
            e.onChangeSelection(n)
        }), paella.events.bind(paella.events.captionsDisabled, function (t, n) {
            e.onChangeSelection(n)
        }), paella.events.bind(paella.events.captionAdded, function (t, n) {
            e.onCaptionAdded(n), paella.plugins.captionsPlugin.showUI()
        }), paella.events.bind(paella.events.timeUpdate, function (t, n) {
            e._searchOnCaptions && e.updateCaptionHiglighted(n)
        }), paella.events.bind(paella.events.controlBarWillHide, function (t) {
            e.cancelHideBar()
        }), e._activeCaptions = paella.captions.getActiveCaptions(), e._searchOnCaptions = e.config.searchOnCaptions || !1
    },
    cancelHideBar: function () {
        this._open > 0 && paella.player.controls.cancelHideBar()
    },
    updateCaptionHiglighted: function (e) {
        var t = this, n = null;
        e && paella.player.videoContainer.trimming().then(function (a) {
            var i = a.enabled ? a.start : 0, r = paella.captions.getActiveCaptions(), o = r && r.getCaptionAtTime(e.currentTime + i), l = o && o.id;
            null != l && (n = $(".bodyInnerContainer[sec-id='" + l + "']"), n != t._lasSel && $(t._lasSel).removeClass("Highlight"), n && ($(n).addClass("Highlight"), t._autoScroll && t.updateScrollFocus(l), t._lasSel = n))
        })
    },
    updateScrollFocus: function (e) {
        var t = this, n = 0, a = $(".bodyInnerContainer").slice(0, e);
        a = a.toArray(), a.forEach(function (e) {
            var t = $(e).outerHeight(!0);
            n += t
        });
        var i = parseInt(n / 280);
        $(".captionsBody").scrollTop(i * t._defaultBodyHeight)
    },
    onCaptionAdded: function (e) {
        var t = this, n = paella.captions.getCaptions(e), a = document.createElement("option");
        a.text = n._lang.txt, a.value = e, t._select.add(a)
    },
    changeSelection: function () {
        var e = this, t = $(e._select).val();
        if ("" == t) return $(e._body).empty(), void paella.captions.setActiveCaptions(t);
        paella.captions.setActiveCaptions(t), e._activeCaptions = t, e._searchOnCaptions && e.buildBodyContent(paella.captions.getActiveCaptions()._captions, "list"), e.setButtonHideShow()
    },
    onChangeSelection: function (e) {
        var t = this;
        t._activeCaptions != e && ($(t._body).empty(), void 0 == e ? (t._select.value = "", $(t._input).prop("disabled", !0)) : ($(t._input).prop("disabled", !1), t._select.value = e, t._searchOnCaptions && t.buildBodyContent(paella.captions.getActiveCaptions()._captions, "list")), t._activeCaptions = e, t.setButtonHideShow())
    },
    action: function () {
        var e = this;
        switch (e._browserLang = base.dictionary.currentLanguage(), e._autoScroll = !0, e._open) {
            case 0:
                e._browserLang && void 0 == paella.captions.getActiveCaptions() && e.selectDefaultBrowserLang(e._browserLang), e._open = 1, paella.keyManager.enabled = !1;
                break;
            case 1:
                paella.keyManager.enabled = !0, e._open = 0
        }
    },
    buildContent: function (e) {
        var t = this;
        t._parent = document.createElement("div"), t._parent.className = "captionsPluginContainer", t._bar = document.createElement("div"), t._bar.className = "captionsBar", t._searchOnCaptions && (t._body = document.createElement("div"), t._body.className = "captionsBody", t._parent.appendChild(t._body), $(t._body).scroll(function () {
            t._autoScroll = !1
        }), t._input = document.createElement("input"), t._input.className = "captionsBarInput", t._input.type = "text", t._input.id = "captionsBarInput", t._input.name = "captionsString", t._input.placeholder = base.dictionary.translate("Search captions"), t._bar.appendChild(t._input), $(t._input).change(function () {
            var e = $(t._input).val();
            t.doSearch(e)
        }), $(t._input).keyup(function () {
            var e = $(t._input).val();
            null != t._searchTimer && t._searchTimer.cancel(), t._searchTimer = new base.Timer(function (n) {
                t.doSearch(e)
            }, t._searchTimerTime)
        })), t._select = document.createElement("select"), t._select.className = "captionsSelector";
        var n = document.createElement("option");
        n.text = base.dictionary.translate("None"), n.value = "", t._select.add(n), paella.captions.getAvailableLangs().forEach(function (e) {
            var n = document.createElement("option");
            n.text = e.lang.txt, n.value = e.id, t._select.add(n)
        }), t._bar.appendChild(t._select), t._parent.appendChild(t._bar), $(t._select).change(function () {
            t.changeSelection()
        }), t._editor = document.createElement("button"), t._editor.className = "editorButton", t._editor.innerHTML = "", t._bar.appendChild(t._editor), $(t._editor).prop("disabled", !0), $(t._editor).click(function () {
            var e = paella.captions.getActiveCaptions();
            paella.userTracking.log("paella:caption:edit", {id: e._captionsProvider + ":" + e._id, lang: e._lang}), e.goToEdit()
        }), e.appendChild(t._parent)
    },
    selectDefaultBrowserLang: function (e) {
        var t = null;
        paella.captions.getAvailableLangs().forEach(function (n) {
            n.lang.code == e && (t = n.id)
        }), t && paella.captions.setActiveCaptions(t)
    },
    doSearch: function (e) {
        var t = this, n = paella.captions.getActiveCaptions();
        n && ("" == e ? t.buildBodyContent(paella.captions.getActiveCaptions()._captions, "list") : n.search(e, function (e, n) {
            e || t.buildBodyContent(n, "search")
        }))
    },
    setButtonHideShow: function () {
        var e = this, t = $(".editorButton"), n = paella.captions.getActiveCaptions(), a = null;
        null != n ? ($(e._select).width("39%"), n.canEdit(function (e, t) {
            a = t
        }), a ? ($(t).prop("disabled", !1), $(t).show()) : ($(t).prop("disabled", !0), $(t).hide(), $(e._select).width("47%"))) : ($(t).prop("disabled", !0), $(t).hide(), $(e._select).width("47%")), e._searchOnCaptions || (a ? $(e._select).width("92%") : $(e._select).width("100%"))
    },
    buildBodyContent: function (e, t) {
        var n = this;
        $(n._body).empty(), e.forEach(function (e) {
            n._inner = document.createElement("div"), n._inner.className = "bodyInnerContainer", n._inner.innerHTML = e.content, "list" == t && (n._inner.setAttribute("sec-begin", e.begin), n._inner.setAttribute("sec-end", e.end), n._inner.setAttribute("sec-id", e.id), n._autoScroll = !0), "search" == t && n._inner.setAttribute("sec-begin", e.time), n._body.appendChild(n._inner), $(n._inner).hover(function () {
                $(this).css("background-color", "rgba(250, 161, 102, 0.5)")
            }, function () {
                $(this).removeAttr("style")
            }), $(n._inner).click(function () {
                var e = $(this).attr("sec-begin");
                paella.player.videoContainer.trimming().then(function (t) {
                    var n = t.enabled ? t.start : 0;
                    paella.player.videoContainer.seekToTime(parseInt(e - n))
                })
            })
        })
    }
}), paella.plugins.captionsPlugin = new paella.plugins.CaptionsPlugin, Class("paella.plugins.CaptionsOnScreen", paella.EventDrivenPlugin, {
    containerId: "paella_plugin_CaptionsOnScreen",
    container: null,
    innerContainer: null,
    top: null,
    actualPos: null,
    lastEvent: null,
    controlsPlayback: null,
    captions: !1,
    captionProvider: null,
    checkEnabled: function (e) {
        e(!paella.player.isLiveStream())
    },
    setup: function () {
    },
    getEvents: function () {
        return [paella.events.controlBarDidHide, paella.events.resize, paella.events.controlBarDidShow, paella.events.captionsEnabled, paella.events.captionsDisabled, paella.events.timeUpdate]
    },
    onEvent: function (e, t) {
        var n = this;
        switch (e) {
            case paella.events.controlBarDidHide:
                if (n.lastEvent == e || 0 == n.captions) break;
                n.moveCaptionsOverlay("down");
                break;
            case paella.events.resize:
                if (0 == n.captions) break;
                paella.player.controls.isHidden() ? n.moveCaptionsOverlay("down") : n.moveCaptionsOverlay("top");
                break;
            case paella.events.controlBarDidShow:
                if (n.lastEvent == e || 0 == n.captions) break;
                n.moveCaptionsOverlay("top");
                break;
            case paella.events.captionsEnabled:
                n.buildContent(t), n.captions = !0, paella.player.controls.isHidden() ? n.moveCaptionsOverlay("down") : n.moveCaptionsOverlay("top");
                break;
            case paella.events.captionsDisabled:
                n.hideContent(), n.captions = !1;
                break;
            case paella.events.timeUpdate:
                n.captions && n.updateCaptions(t)
        }
        n.lastEvent = e
    },
    buildContent: function (e) {
        var t = this;
        t.captionProvider = e, null == t.container ? (t.container = document.createElement("div"), t.container.className = "CaptionsOnScreen", t.container.id = t.containerId, t.innerContainer = document.createElement("div"), t.innerContainer.className = "CaptionsOnScreenInner", t.container.appendChild(t.innerContainer), null == t.controlsPlayback && (t.controlsPlayback = $("#playerContainer_controls_playback")), paella.player.videoContainer.domElement.appendChild(t.container)) : $(t.container).show()
    },
    updateCaptions: function (e) {
        var t = this;
        this.captions && paella.player.videoContainer.trimming().then(function (n) {
            var a = n.enabled ? n.start : 0, i = paella.captions.getActiveCaptions(), r = i.getCaptionAtTime(e.currentTime + a);
            r ? ($(t.container).show(), t.innerContainer.innerHTML = r.content) : t.innerContainer.innerHTML = ""
        })
    },
    hideContent: function () {
        var e = this;
        $(e.container).hide()
    },
    moveCaptionsOverlay: function (e) {
        var t = this;
        if (null == t.controlsPlayback && (t.controlsPlayback = $("#playerContainer_controls_playback")), "down" == e) {
            t.controlsPlayback.offset().top;
            t.innerContainer.style.bottom = 50 - t.container.offsetHeight + "px"
        }
        if ("top" == e) {
            var n = t.controlsPlayback.offset().top;
            n -= t.innerContainer.offsetHeight + 10, t.innerContainer.style.bottom = 0 - n + "px"
        }
    },
    getIndex: function () {
        return 1050
    },
    getName: function () {
        return "es.upv.paella.overlayCaptionsPlugin"
    }
}), new paella.plugins.CaptionsOnScreen, Class("paella.ChromaVideo", paella.VideoElementBase, {
    _posterFrame: null,
    _currentQuality: null,
    _autoplay: !1,
    _streamName: null,
    initialize: function (e, t, n, a, i, r, o) {
        function l() {
            if (s.canvasController) {
                var e = s.canvasController.canvas.domElement;
                s.canvasController.reshape($(e).width(), $(e).height())
            }
        }

        this.parent(e, t, "canvas", n, a, i, r), this._streamName = o || "chroma";
        var s = this;
        this._stream.sources[this._streamName] && this._stream.sources[this._streamName].sort(function (e, t) {
            return e.res.h - t.res.h
        }), this.video = null, new paella.Timer(function (e) {
            l()
        }, 500).repeat = !0
    },
    defaultProfile: function () {
        return "chroma"
    },
    _setVideoElem: function (e) {
        $(this.video).bind("progress", evtCallback), $(this.video).bind("loadstart", evtCallback), $(this.video).bind("loadedmetadata", evtCallback), $(this.video).bind("canplay", evtCallback), $(this.video).bind("oncanplay", evtCallback)
    },
    _loadDeps: function () {
        return new Promise(function (e, t) {
            window.$paella_mpd ? defer.resolve(window.$paella_mpd) : require(["resources/deps/bg2e.js"], function () {
                window.$paella_bg2e = !0, e(window.$paella_bg2e)
            })
        })
    },
    _deferredAction: function (e) {
        var t = this;
        return new Promise(function (n, a) {
            t.video ? n(e()) : $(t.video).bind("canplay", function () {
                t._ready = !0, n(e())
            })
        })
    },
    _getQualityObject: function (e, t) {
        return {
            index: e, res: t.res, src: t.src, toString: function () {
                return this.res.w + "x" + this.res.h
            }, shortLabel: function () {
                return this.res.h + "p"
            }, compare: function (e) {
                return this.res.w * this.res.h - e.res.w * e.res.h
            }
        }
    },
    getVideoData: function () {
        var e = this, t = this;
        return new Promise(function (n, a) {
            e._deferredAction(function () {
                n({
                    duration: t.video.duration,
                    currentTime: t.video.currentTime,
                    volume: t.video.volume,
                    paused: t.video.paused,
                    ended: t.video.ended,
                    res: {w: t.video.videoWidth, h: t.video.videoHeight}
                })
            })
        })
    },
    setPosterFrame: function (e) {
        this._posterFrame = e
    },
    setAutoplay: function (e) {
        this._autoplay = e, e && this.video && this.video.setAttribute("autoplay", e)
    },
    load: function () {
        var e = this;
        return new Promise(function (t, n) {
            e._loadDeps().then(function () {
                var a = e._stream.sources[e._streamName];
                null === e._currentQuality && e._videoQualityStrategy && (e._currentQuality = e._videoQualityStrategy.getQualityIndex(a));
                var i = e._currentQuality < a.length ? a[e._currentQuality] : null;
                e.video = null, i ? (e.canvasController = null, buildChromaVideoCanvas(i, e.domElement).then(function (n) {
                    e.canvasController = n, e.video = n.video, e.video.pause(), i.crop && (e.canvasController.crop = new bg.Vector4(i.crop.left, i.crop.top, i.crop.right, i.crop.bottom)), i.displacement && (e.canvasController.transform = bg.Matrix4.Translation(i.displacement.x, i.displacement.y, 0)), i.chromaColor && (e.canvasController.chroma = new bg.Color(i.chromaColor[0], i.chromaColor[1], i.chromaColor[2], i.chromaColor[3])), i.chromaBias && (e.canvasController.bias = i.chromaBias), t(i)
                })) : n(new Error("Could not load video: invalid quality stream index"))
            })
        })
    },
    getQualities: function () {
        var e = this;
        return new Promise(function (t, n) {
            setTimeout(function () {
                var n = [], a = e._stream.sources[e._streamName], i = -1;
                a.forEach(function (t) {
                    i++, n.push(e._getQualityObject(i, t))
                }), t(n)
            }, 10)
        })
    },
    setQuality: function (e) {
        var t = this;
        return new Promise(function (n) {
            var a = t.video.paused, i = t._stream.sources[t._streamName];
            t._currentQuality = e < i.length ? e : 0;
            var r = t.video.currentTime;
            t.freeze().then(function () {
                return t._ready = !1, t.load()
            }).then(function () {
                a || t.play(), $(t.video).on("seeked", function () {
                    t.unFreeze(), n(), $(t.video).off("seeked")
                }), t.video.currentTime = r
            })
        })
    },
    getCurrentQuality: function () {
        var e = this;
        return new Promise(function (t) {
            t(e._getQualityObject(e._currentQuality, e._stream.sources[e._streamName][e._currentQuality]))
        })
    },
    play: function () {
        var e = this;
        return this._deferredAction(function () {
            bg.app.MainLoop.singleton.updateMode = bg.app.FrameUpdate.AUTO, e.video.play()
        })
    },
    pause: function () {
        var e = this;
        return this._deferredAction(function () {
            bg.app.MainLoop.singleton.updateMode = bg.app.FrameUpdate.MANUAL, e.video.pause()
        })
    },
    isPaused: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.paused
        })
    },
    duration: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.duration
        })
    },
    setCurrentTime: function (e) {
        var t = this;
        return this._deferredAction(function () {
            t.video.currentTime = e, $(t.video).on("seeked", function () {
                t.canvasController.postRedisplay(), $(t.video).off("seeked")
            })
        })
    },
    currentTime: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.currentTime
        })
    },
    setVolume: function (e) {
        var t = this;
        return this._deferredAction(function () {
            t.video.volume = e
        })
    },
    volume: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.volume
        })
    },
    setPlaybackRate: function (e) {
        var t = this;
        return this._deferredAction(function () {
            t.video.playbackRate = e
        })
    },
    playbackRate: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.playbackRate
        })
    },
    goFullScreen: function () {
        var e = this;
        return this._deferredAction(function () {
            var t = e.video;
            t.requestFullscreen ? t.requestFullscreen() : t.msRequestFullscreen ? t.msRequestFullscreen() : t.mozRequestFullScreen ? t.mozRequestFullScreen() : t.webkitEnterFullscreen && t.webkitEnterFullscreen()
        })
    },
    unFreeze: function () {
        var e = this;
        return this._deferredAction(function () {
            var t = document.getElementById(e.video.className + "canvas");
            $(t).remove()
        })
    },
    freeze: function () {
        return this._deferredAction(function () {
        })
    },
    unload: function () {
        return this._callUnloadEvent(), paella_DeferredNotImplemented()
    },
    getDimensions: function () {
        return paella_DeferredNotImplemented()
    }
}), Class("paella.videoFactories.ChromaVideoFactory", {
    isStreamCompatible: function (e) {
        try {
            if (paella.ChromaVideo._loaded) return !1;
            if (paella.videoFactories.Html5VideoFactory.s_instances > 0 && base.userAgent.system.iOS) return !1
                ;
            for (var t in e.sources) if ("chroma" == t) return !0
        } catch (e) {
        }
        return !1
    }, getVideoObject: function (e, t, n) {
        return paella.ChromaVideo._loaded = !0, ++paella.videoFactories.Html5VideoFactory.s_instances, new paella.ChromaVideo(e, t, n.x, n.y, n.w, n.h)
    }
}), Class("paella.plugins.CommentsPlugin", paella.TabBarPlugin, {
    divPublishComment: null,
    divComments: null,
    publishCommentTextArea: null,
    publishCommentButtons: null,
    canPublishAComment: !1,
    comments: [],
    commentsTree: [],
    domElement: null,
    getSubclass: function () {
        return "showCommentsTabBar"
    },
    getName: function () {
        return "es.upv.paella.commentsPlugin"
    },
    getTabName: function () {
        return base.dictionary.translate("Comments")
    },
    checkEnabled: function (e) {
        e(!0)
    },
    getIndex: function () {
        return 40
    },
    getDefaultToolTip: function () {
        return base.dictionary.translate("Comments")
    },
    action: function (e) {
        this.loadContent()
    },
    buildContent: function (e) {
        this.domElement = e, this.canPublishAComment = paella.initDelegate.initParams.accessControl.permissions.canWrite, this.loadContent()
    },
    loadContent: function () {
        this.divRoot = this.domElement, this.divRoot.innerHTML = "", this.divPublishComment = document.createElement("div"), this.divPublishComment.className = "CommentPlugin_Publish", this.divPublishComment.id = "CommentPlugin_Publish", this.divComments = document.createElement("div"), this.divComments.className = "CommentPlugin_Comments", this.divComments.id = "CommentPlugin_Comments", this.canPublishAComment && (this.divRoot.appendChild(this.divPublishComment), this.createPublishComment()), this.divRoot.appendChild(this.divComments), this.reloadComments()
    },
    createPublishComment: function () {
        var e, t = this, n = this.divPublishComment.id + "_entry";
        e = document.createElement("div"), e.id = n, e.className = "comments_entry";
        var a;
        a = document.createElement("img"), a.className = "comments_entry_silhouette", a.style.width = "48px", a.src = paella.initDelegate.initParams.accessControl.userData.avatar, a.id = n + "_silhouette", e.appendChild(a);
        var i;
        i = document.createElement("div"), i.className = "comments_entry_container", i.id = n + "_textarea_container", e.appendChild(i), this.publishCommentTextArea = document.createElement("textarea"), this.publishCommentTextArea.id = n + "_textarea", this.publishCommentTextArea.onclick = function () {
            paella.keyManager.enabled = !1
        }, this.publishCommentTextArea.onblur = function () {
            paella.keyManager.enabled = !0
        }, i.appendChild(this.publishCommentTextArea), this.publishCommentButtons = document.createElement("div"), this.publishCommentButtons.id = n + "_buttons_area", i.appendChild(this.publishCommentButtons);
        var r;
        r = document.createElement("button"), r.id = n + "_btnAddComment", r.className = "publish", r.onclick = function () {
            "" != t.publishCommentTextArea.value.replace(/\s/g, "") && t.addComment()
        }, r.innerHTML = base.dictionary.translate("Publish"), this.publishCommentButtons.appendChild(r), i.commentsTextArea = this.publishCommentTextArea, i.commentsBtnAddComment = r, i.commentsBtnAddCommentToInstant = this.btnAddCommentToInstant, this.divPublishComment.appendChild(e)
    },
    addComment: function () {
        var e = this, t = paella.AntiXSS.htmlEscape(e.publishCommentTextArea.value), n = new Date;
        this.comments.push({id: base.uuid(), userName: paella.initDelegate.initParams.accessControl.userData.name, mode: "normal", value: t, created: n});
        var a = {allComments: this.comments};
        paella.data.write("comments", {id: paella.initDelegate.getId()}, a, function (t, n) {
            n && e.loadContent()
        })
    },
    addReply: function (e, t) {
        var n = this, a = document.getElementById(t), i = paella.AntiXSS.htmlEscape(a.value), r = new Date;
        paella.keyManager.enabled = !0, this.comments.push({
            id: base.uuid(),
            userName: paella.initDelegate.initParams.accessControl.userData.name,
            mode: "reply",
            parent: e,
            value: i,
            created: r
        });
        var o = {allComments: this.comments};
        paella.data.write("comments", {id: paella.initDelegate.getId()}, o, function (e, t) {
            t && n.reloadComments()
        })
    },
    reloadComments: function () {
        var e = this;
        e.commentsTree = [], e.comments = [], this.divComments.innerHTML = "", paella.data.read("comments", {id: paella.initDelegate.getId()}, function (t, n) {
            var a, i, r;
            if (t && "object" == $traceurRuntime.typeof(t) && t.allComments && t.allComments.length > 0) {
                e.comments = t.allComments;
                var o = {};
                for (a = 0; a < t.allComments.length; ++a) i = t.allComments[a].value, "reply" !== t.allComments[a].mode && (r = {}, r.id = t.allComments[a].id, r.userName = t.allComments[a].userName, r.mode = t.allComments[a].mode, r.value = i, r.created = t.allComments[a].created, r.replies = [], e.commentsTree.push(r), o[r.id] = e.commentsTree.length - 1);
                for (a = 0; a < t.allComments.length; ++a) if (i = t.allComments[a].value, "reply" === t.allComments[a].mode) {
                    r = {}, r.id = t.allComments[a].id, r.userName = t.allComments[a].userName, r.mode = t.allComments[a].mode, r.value = i, r.created = t.allComments[a].created;
                    var l = o[t.allComments[a].parent];
                    e.commentsTree[l].replies.push(r)
                }
                e.displayComments()
            }
        })
    },
    displayComments: function () {
        for (var e = this, t = 0; t < e.commentsTree.length; ++t) {
            var n = e.commentsTree[t], a = e.createACommentEntry(n);
            e.divComments.appendChild(a)
        }
    },
    createACommentEntry: function (e) {
        var t, n = this, a = this.divPublishComment.id + "_entry" + e.id;
        t = document.createElement("div"), t.id = a, t.className = "comments_entry";
        var i;
        i = document.createElement("img"), i.className = "comments_entry_silhouette", i.id = a + "_silhouette", t.appendChild(i);
        var r;
        r = document.createElement("div"), r.className = "comments_entry_container", r.id = a + "_comment_container", t.appendChild(r);
        var o;
        o = document.createElement("div"), o.id = a + "_comment_metadata", r.appendChild(o);
        var l = "";
        if (e.created) {
            var s = new Date, u = paella.utils.timeParse.matterhornTextDateToDate(e.created);
            l = paella.utils.timeParse.secondsToText((s.getTime() - u.getTime()) / 1e3)
        }
        var c;
        c = document.createElement("div"), c.id = a + "_comment_value", c.className = "comments_entry_comment", r.appendChild(c), c.innerHTML = e.value;
        var d = document.createElement("div");
        if (d.id = a + "_comment_reply", r.appendChild(d), paella.data.read("userInfo", {username: e.userName}, function (e, t) {
                if (e) {
                    i.src = e.avatar;
                    var n = "<span class='comments_entry_username'>" + e.name + " " + e.lastname + "</span>";
                    n += "<span class='comments_entry_datepublish'>" + l + "</span>", o.innerHTML = n
                }
            }), 1 == this.canPublishAComment) {
            var p = document.createElement("div");
            p.className = "reply_button", p.innerHTML = base.dictionary.translate("Reply"), p.id = a + "_comment_reply_button", p.onclick = function () {
                var t = n.createAReplyEntry(e.id);
                this.style.display = "none", this.parentElement.parentElement.appendChild(t)
            }, d.appendChild(p)
        }
        for (var h = 0; h < e.replies.length; ++h) {
            var m = n.createACommentReplyEntry(e.id, e.replies[h]);
            r.appendChild(m)
        }
        return t
    },
    createACommentReplyEntry: function (e, t) {
        var n, a = this.divPublishComment.id + "_entry_" + e + "_reply_" + t.id;
        n = document.createElement("div"), n.id = a, n.className = "comments_entry";
        var i;
        i = document.createElement("img"), i.className = "comments_entry_silhouette", i.id = a + "_silhouette", n.appendChild(i);
        var r;
        r = document.createElement("div"), r.className = "comments_entry_container", r.id = a + "_comment_container", n.appendChild(r);
        var o;
        o = document.createElement("div"), o.id = a + "_comment_metadata", r.appendChild(o);
        var l = "";
        if (t.created) {
            var s = new Date, u = paella.utils.timeParse.matterhornTextDateToDate(t.created);
            l = paella.utils.timeParse.secondsToText((s.getTime() - u.getTime()) / 1e3)
        }
        var c;
        return c = document.createElement("div"), c.id = a + "_comment_value", c.className = "comments_entry_comment", r.appendChild(c), c.innerHTML = t.value, paella.data.read("userInfo", {username: t.userName}, function (e, t) {
            if (e) {
                i.src = e.avatar;
                var n = "<span class='comments_entry_username'>" + e.name + " " + e.lastname + "</span>";
                n += "<span class='comments_entry_datepublish'>" + l + "</span>", o.innerHTML = n
            }
        }), n
    },
    createAReplyEntry: function (e) {
        var t, n = this, a = this.divPublishComment.id + "_entry_" + e + "_reply";
        t = document.createElement("div"), t.id = a + "_entry", t.className = "comments_entry";
        var i;
        i = document.createElement("img"), i.className = "comments_entry_silhouette", i.style.width = "48px", i.id = a + "_silhouette", i.src = paella.initDelegate.initParams.accessControl.userData.avatar, t.appendChild(i);
        var r;
        r = document.createElement("div"), r.className = "comments_entry_container comments_reply_container", r.id = a + "_reply_container", t.appendChild(r);
        var o;
        o = document.createElement("textArea"), o.onclick = function () {
            paella.keyManager.enabled = !1
        }, o.draggable = !1, o.id = a + "_textarea", r.appendChild(o), this.publishCommentButtons = document.createElement("div"), this.publishCommentButtons.id = a + "_buttons_area", r.appendChild(this.publishCommentButtons);
        var l;
        return l = document.createElement("button"), l.id = a + "_btnAddComment", l.className = "publish", l.onclick = function () {
            "" != o.value.replace(/\s/g, "") && n.addReply(e, o.id)
        }, l.innerHTML = base.dictionary.translate("Reply"), this.publishCommentButtons.appendChild(l), t
    }
}), paella.plugins.commentsPlugin = new paella.plugins.CommentsPlugin, Class("paella.plugins.DescriptionPlugin", paella.TabBarPlugin, {
    getSubclass: function () {
        return "showDescriptionTabBar"
    }, getName: function () {
        return "es.upv.paella.descriptionPlugin"
    }, getTabName: function () {
        return "Descripción"
    }, domElement: null, buildContent: function (e) {
        this.domElement = e, this.loadContent()
    }, action: function (e) {
        this.loadContent()
    }, loadContent: function () {
        var e = this.domElement;
        e.innerHTML = "Loading...", new paella.Timer(function (t) {
            e.innerHTML = "Loading done"
        }, 2e3)
    }
}), paella.plugins.descriptionPlugin = new paella.plugins.DescriptionPlugin, Class("paella.plugins.extendedTabAdapterPlugin", paella.ButtonPlugin, {
    currentUrl: null,
    currentMaster: null,
    currentSlave: null,
    availableMasters: [],
    availableSlaves: [],
    showWidthRes: null,
    getAlignment: function () {
        return "right"
    },
    getSubclass: function () {
        return "extendedTabAdapterPlugin"
    },
    getIndex: function () {
        return 2030
    },
    getMinWindowSize: function () {
        return 550
    },
    getName: function () {
        return "es.upv.paella.extendedTabAdapterPlugin"
    },
    getDefaultToolTip: function () {
        return base.dictionary.translate("Extended Tab Adapter")
    },
    getButtonType: function () {
        return paella.ButtonPlugin.type.popUpButton
    },
    buildContent: function (e) {
        e.appendChild(paella.extendedAdapter.bottomContainer)
    }
}), new paella.plugins.extendedTabAdapterPlugin, Class("paella.plugins.FootPrintsPlugin", paella.ButtonPlugin, {
    INTERVAL_LENGTH: 5,
    inPosition: 0,
    outPosition: 0,
    canvas: null,
    footPrintsTimer: null,
    footPrintsData: {},
    getAlignment: function () {
        return "right"
    },
    getSubclass: function () {
        return "footPrints"
    },
    getIndex: function () {
        return 590
    },
    getDefaultToolTip: function () {
        return base.dictionary.translate("Show statistics")
    },
    getName: function () {
        return "es.upv.paella.footprintsPlugin"
    },
    getButtonType: function () {
        return paella.ButtonPlugin.type.timeLineButton
    },
    setup: function () {
        var e = this;
        switch (paella.events.bind(paella.events.timeUpdate, function (t) {
            e.onTimeUpdate()
        }), this.config.skin) {
            case"custom":
                this.fillStyle = this.config.fillStyle, this.strokeStyle = this.config.strokeStyle;
                break;
            case"dark":
                this.fillStyle = "#727272", this.strokeStyle = "#424242";
                break;
            case"light":
            default:
                this.fillStyle = "#d8d8d8", this.strokeStyle = "#ffffff"
        }
    },
    checkEnabled: function (e) {
        e(!paella.player.isLiveStream())
    },
    buildContent: function (e) {
        var t = document.createElement("div");
        t.className = "footPrintsContainer", this.canvas = document.createElement("canvas"), this.canvas.id = "footPrintsCanvas", this.canvas.className = "footPrintsCanvas", t.appendChild(this.canvas), e.appendChild(t)
    },
    onTimeUpdate: function () {
        var e = this;
        paella.player.videoContainer.currentTime().then(function (t) {
            var n = Math.round(t + paella.player.videoContainer.trimStart());
            e.inPosition <= n && n <= e.inPosition + e.INTERVAL_LENGTH ? (e.outPosition = n, e.inPosition + e.INTERVAL_LENGTH === e.outPosition && (e.trackFootPrint(e.inPosition, e.outPosition), e.inPosition = e.outPosition)) : (e.trackFootPrint(e.inPosition, e.outPosition), e.inPosition = n, e.outPosition = n)
        })
    },
    trackFootPrint: function (e, t) {
        var n = {in: e, out: t};
        paella.data.write("footprints", {id: paella.initDelegate.getId()}, n)
    },
    willShowContent: function () {
        var e = this;
        this.loadFootprints(), this.footPrintsTimer = new base.Timer(function (t) {
            e.loadFootprints()
        }, 5e3), this.footPrintsTimer.repeat = !0
    },
    didHideContent: function () {
        null != this.footPrintsTimer && (this.footPrintsTimer.cancel(), this.footPrintsTimer = null)
    },
    loadFootprints: function () {
        var e = this;
        paella.data.read("footprints", {id: paella.initDelegate.getId()}, function (t, n) {
            var a = {};
            paella.player.videoContainer.duration().then(function (n) {
                for (var i = Math.floor(paella.player.videoContainer.trimStart()), r = -1, o = 0, l = 0; l < t.length; l++) {
                    var s = t[l].position - i;
                    if (s < n) {
                        var u = t[l].views;
                        if (s - 1 != r) for (var c = r + 1; c < s; c++) a[c] = o;
                        a[s] = u, r = s, o = u
                    }
                }
                e.drawFootPrints(a)
            })
        })
    },
    drawFootPrints: function (e) {
        if (this.canvas) {
            var t, n = Object.keys(e).length, a = this.canvas.getContext("2d"), i = 20;
            for (t = 0; t < n; ++t) e[t] > i && (i = e[t]);
            for (this.canvas.setAttribute("width", n), this.canvas.setAttribute("height", i), a.clearRect(0, 0, this.canvas.width, this.canvas.height), a.fillStyle = this.fillStyle, a.strokeStyle = this.strokeStyle, a.lineWidth = 2, a.webkitImageSmoothingEnabled = !1, a.mozImageSmoothingEnabled = !1, t = 0; t < n - 1; ++t) a.beginPath(), a.moveTo(t, i), a.lineTo(t, i - e[t]), a.lineTo(t + 1, i - e[t + 1]), a.lineTo(t + 1, i), a.closePath(), a.fill(), a.beginPath(), a.moveTo(t, i - e[t]), a.lineTo(t + 1, i - e[t + 1]), a.closePath(), a.stroke()
        }
    }
}), paella.plugins.footPrintsPlugin = new paella.plugins.FootPrintsPlugin, console.log("Plugin Frame control wird geladen!"), Class("paella.plugins.FrameCaptionsSearchPlugIn", paella.SearchServicePlugIn, {
    getName: function () {
        return "es.upv.paella.frameCaptionsSearchPlugin"
    }, search: function (e, t) {
        var n = RegExp(e, "i"), a = [];
        for (var i in paella.player.videoLoader.frameList) {
            var r = paella.player.videoLoader.frameList[i];
            "object" == $traceurRuntime.typeof(r) && n.test(r.caption) && a.push({time: i, content: r.caption, score: 0})
        }
        t && t(!1, a)
    }
}), new paella.plugins.FrameCaptionsSearchPlugIn, Class("paella.plugins.FrameControlPlugin", paella.ButtonPlugin, {
    frames: null,
    highResFrames: null,
    currentFrame: null,
    navButtons: null,
    buttons: [],
    contx: null,
    _img: null,
    _searchTimer: null,
    _searchTimerTime: 250,
    getAlignment: function () {
        return "right"
    },
    getSubclass: function () {
        return "frameControl"
    },
    getIndex: function () {
        return 510
    },
    getMinWindowSize: function () {
        return 450
    },
    getName: function () {
        return "es.upv.paella.frameControlPlugin"
    },
    getButtonType: function () {
        return paella.ButtonPlugin.type.timeLineButton
    },
    getDefaultToolTip: function () {
        return base.dictionary.translate("Navigate by slides")
    },
    checkEnabled: function (e) {
        e(null == paella.initDelegate.initParams.videoLoader.frameList ? !1 : 0 === paella.initDelegate.initParams.videoLoader.frameList.length ? !1 : 0 == Object.keys(paella.initDelegate.initParams.videoLoader.frameList).length ? !1 : !0)
    },
    setup: function () {
        this._showFullPreview = this.config.showFullPreview || "auto";
        var e, t, n = this, a = 1, i = 0, r = -1, o = {Tab: 9, Return: 13, Esc: 27, End: 35, Home: 36, Left: 37, Up: 38, Right: 39, Down: 40};
        $(this.button).keyup(function (l) {
            var s = Math.floor(n.contx.offsetWidth / 100), u = n.buttons.length % s, c = Math.floor(n.buttons.length / s);
            n.isPopUpOpen() && (l.keyCode == o.Left ? r > 0 && (n.buttons[r].className = e, r--, a > c && (i = s - u), t = s * (a - 1) - 1 - i, r == t && 0 != r && (n.navButtons.left.scrollContainer.scrollLeft -= 105 * s, --a), this.hiResFrame && n.removeHiResFrame(), base.userAgent.browser.IsMobileVersion || n.buttons[r].frameControl.onMouseOver(null, n.buttons[r].frameData), e = n.buttons[r].className, n.buttons[r].className = "frameControlItem selected") : l.keyCode == o.Right ? r < n.buttons.length - 1 && (r >= 0 && (n.buttons[r].className = e), r++, 1 == a && (i = 0), t = s * a - i, r == t && (n.navButtons.left.scrollContainer.scrollLeft += 105 * s, ++a), this.hiResFrame && n.removeHiResFrame(), base.userAgent.browser.IsMobileVersion || n.buttons[r].frameControl.onMouseOver(null, n.buttons[r].frameData), e = n.buttons[r].className, n.buttons[r].className = "frameControlItem selected") : l.keyCode == o.Return ? (n.buttons[r].frameControl.onClick(null, n.buttons[r].frameData), e = "frameControlItem current") : l.keyCode == o.Esc && n.removeHiResFrame())
        })
    },
    buildContent: function (e) {
        var t = this, n = this;
        this.frames = [];
        var a = document.createElement("div");
        a.className = "frameControlContainer", n.contx = a;
        var i = document.createElement("div");
        i.className = "frameControlContent";
        var r = new Image(500, 500);
        r.src = "http://www.hsv-arena.hamburg/wp-content/uploads/2017/06/BILD.jpg", a.appendChild(r), i.appendChild(r), document.appendChild(r), this.navButtons = {
            left: document.createElement("div"),
            right: document.createElement("div")
        }, this.navButtons.left.className = "frameControl navButton left", this.navButtons.right.className = "frameControl navButton right";
        var o = this.getFrame(null);
        e.appendChild(this.navButtons.left), e.appendChild(a), a.appendChild(i), e.appendChild(this.navButtons.right), this.navButtons.left.scrollContainer = a, $(this.navButtons.left).click(function (e) {
            this.scrollContainer.scrollLeft -= 100
        }), this.navButtons.right.scrollContainer = a, $(this.navButtons.right).click(function (e) {
            this.scrollContainer.scrollLeft += 100
        }), i.appendChild(o);
        var l = $(o).outerWidth(!0);
        i.innerHTML = "", $(window).mousemove(function (e) {
            ($(i).offset().top > e.pageY || !$(i).is(":visible") || $(i).offset().top + $(i).height() < e.pageY) && n.removeHiResFrame()
        });
        var s, u = paella.initDelegate.initParams.videoLoader.frameList;
        if (u) {
            var c = Object.keys(u);
            s = c.length, c.map(function (e) {
                return Number(e, 10)
            }).sort(function (e, t) {
                return e - t
            }).forEach(function (e) {
                var t = n.getFrame(u[e]);
                i.appendChild(t, "frameContrlItem_" + s), n.frames.push(t)
            })
        }
        $(i).css({width: s * l + "px"}), paella.events.bind(paella.events.setTrim, function (e, n) {
            t.updateFrameVisibility(n.trimEnabled, n.trimStart, n.trimEnd)
        }), paella.player.videoContainer.trimming().then(function (e) {
            t.updateFrameVisibility(e.enabled, e.start, e.end)
        }), paella.events.bind(paella.events.timeupdate, function (e, n) {
            return t.onTimeUpdate(n.currentTime)
        })
    },
    showHiResFrame: function (e, t) {
        var n = document.createElement("div"), a = document.createElement("div"), i = document.createElement("img");
        this._img = i, i.className = "frameHiRes", i.setAttribute("src", e), i.setAttribute("style", "width: 100%;"), $(a).append(i), $(n).append(a), n.setAttribute("style", "display: table;"), a.setAttribute("style", "display: table-cell; vertical-align:middle;");
        var r = document.createElement("p");
        r.className = "frameCaption", r.innerHTML = t || "", n.append(r), this._caption = r;
        var o = paella.player.videoContainer.overlayContainer;
        switch (this._showFullPreview) {
            case"auto":
                var l = paella.initDelegate.initParams.videoLoader.streams;
                1 == l.length ? o.addElement(n, o.getMasterRect()) : l.length >= 2 && o.addElement(n, o.getSlaveRect()), o.enableBackgroundMode(), this.hiResFrame = n;
                break;
            case"master":
                o.addElement(n, o.getMasterRect()), o.enableBackgroundMode(), this.hiResFrame = n;
                break;
            case"slave":
                var l = paella.initDelegate.initParams.videoLoader.streams;
                l.length >= 2 && (o.addElement(n, o.getSlaveRect()), o.enableBackgroundMode(), this.hiResFrame = n)
        }
    },
    removeHiResFrame: function () {
        var e = this, t = paella.player.videoContainer.overlayContainer;
        this.hiResFrame && t.removeElement(this.hiResFrame), t.disableBackgroundMode(), e._img = null
    },
    updateFrameVisibility: function (e, t, n) {
        var a;
        if (e) for (a = 0; a < this.frames.length; ++a) {
            var i = this.frames[a], r = i.frameData;
            r.time < t ? this.frames.length > a + 1 && this.frames[a + 1].frameData.time > t ? $(i).show() : $(i).hide() : r.time > n ? $(i).hide() : $(i).show()
        } else for (a = 0; a < this.frames.length; ++a) $(this.frames[a]).show()
    },
    getFrame: function (e, t) {
        var n = document.createElement("div");
        if (n.className = "frameControlItem", t && (n.id = t), e) {
            this.buttons.push(n), n.frameData = e, n.frameControl = this;
            var a = e.thumb ? e.thumb : e.url, i = paella.utils.timeParse.secondsToTime(e.time);
            n.innerHTML = '<img src="' + a + '" alt="" class="frameControlImage" title="' + i + '" aria-label="' + i + '"></img>', base.userAgent.browser.IsMobileVersion || $(n).mouseover(function (e) {
                this.frameControl.onMouseOver(e, this.frameData)
            }), $(n).mouseout(function (e) {
                this.frameControl.onMouseOut(e, this.frameData)
            }), $(n).click(function (e) {
                this.frameControl.onClick(e, this.frameData)
            })
        }
        return n
    },
    onMouseOver: function (e, t) {
        var n = paella.initDelegate.initParams.videoLoader.frameList, a = n[t.time];
        if (a) {
            var i = a.url;
            this._img ? (this._img.setAttribute("src", i), this._caption.innerHTML = a.caption || "") : this.showHiResFrame(i, a.caption)
        }
        null != this._searchTimer && this._searchTimer.cancel()
    },
    onMouseOut: function (e, t) {
        var n = this;
        n._searchTimer = new base.Timer(function (e) {
            n.removeHiResFrame()
        }, n._searchTimerTime)
    },
    onClick: function (e, t) {
        paella.player.videoContainer.seekToTime(t.time + 1)
    },
    onTimeUpdate: function (e) {
        for (var t = null, n = 0; n < this.frames.length && (this.frames[n].frameData && this.frames[n].frameData.time <= e); ++n) t = this.frames[n];
        this.currentFrame != t && t && (this.currentFrame && (this.currentFrame.className = "frameControlItem"), this.currentFrame = t, this.currentFrame.className = "frameControlItem current")
    }
}), paella.plugins.frameControlPlugin = new paella.plugins.FrameControlPlugin, Class("paella.plugins.FullScreenPlugin", paella.ButtonPlugin, {
    _reload: null, getIndex: function () {
        return 551
    }, getAlignment: function () {
        return "right"
    }, getSubclass: function () {
        return "showFullScreenButton"
    }, getName: function () {
        return "es.upv.paella.fullScreenButtonPlugin"
    }, checkEnabled: function (e) {
        e(paella.player.checkFullScreenCapability())
    }, getDefaultToolTip: function () {
        return base.dictionary.translate("Go Fullscreen")
    }, setup: function () {
        var e = this;
        this._reload = !!this.config.reloadOnFullscreen && this.config.reloadOnFullscreen.enabled, this._keepUserQuality = !this.config.reloadOnFullscreen || this.config.reloadOnFullscreen.keepUserSelection, paella.events.bind(paella.events.enterFullscreen, function (t) {
            e.onEnterFullscreen()
        }), paella.events.bind(paella.events.exitFullscreen, function (t) {
            e.onExitFullscreen()
        })
    }, action: function (e) {
        var t = this;
        if (paella.player.isFullScreen()) paella.player.exitFullScreen(); else {
            if ((!paella.player.checkFullScreenCapability() || base.userAgent.browser.Explorer) && window.location !== window.parent.location) {
                var n = window.location.href;
                return paella.player.pause(), void paella.player.videoContainer.currentTime().then(function (e) {
                    var a = t.secondsToHours(e);
                    window.open(n + "&time=" + a.h + "h" + a.m + "m" + a.s + "s&autoplay=true")
                })
            }
            paella.player.goFullScreen()
        }
        paella.player.config.player.reloadOnFullscreen && setTimeout(function () {
            t._reload && paella.player.videoContainer.setQuality(null).then(function () {
            })
        }, 1e3)
    }, secondsToHours: function (e) {
        var t = Math.floor(e / 3600), n = Math.floor((e - 3600 * t) / 60), a = Math.floor(e - 3600 * t - 60 * n), i = {};
        return t < 10 && (t = "0" + t), n < 10 && (n = "0" + n), a < 10 && (a = "0" + a), i.h = t, i.m = n, i.s = a, i
    }, onEnterFullscreen: function () {
        this.setToolTip(base.dictionary.translate("Exit Fullscreen")), this.button.className = this.getButtonItemClass(!0)
    }, onExitFullscreen: function () {
        this.setToolTip(base.dictionary.translate("Go Fullscreen")), this.button.className = this.getButtonItemClass(!1), setTimeout(function () {
            paella.player.onresize()
        }, 100)
    }, getButtonItemClass: function (e) {
        return "buttonPlugin " + this.getAlignment() + " " + this.getSubclass() + (e ? " active" : "")
    }
}), paella.plugins.fullScreenPlugin = new paella.plugins.FullScreenPlugin, Class("paella.plugins.HelpPlugin", paella.ButtonPlugin, {
    getIndex: function () {
        return 509
    }, getAlignment: function () {
        return "right"
    }, getSubclass: function () {
        return "helpButton"
    }, getName: function () {
        return "es.upv.paella.helpPlugin"
    }, getMinWindowSize: function () {
        return 650
    }, getDefaultToolTip: function () {
        return base.dictionary.translate("Show help") + " (" + base.dictionary.translate("Paella version:") + " " + paella.version + ")"
    }, checkEnabled: function (e) {
        e((this.config && this.config.langs || []).length > 0)
    }, action: function (e) {
        var t = base.dictionary.currentLanguage(), n = this.config && this.config.langs || [], a = n.indexOf(t);
        a < 0 && (a = 0);
        var i = "resources/style/help/help_" + n[a] + ".html";
        base.userAgent.browser.IsMobileVersion ? window.open(i) : paella.messageBox.showFrame(i)
    }
}), paella.plugins.helpPlugin = new paella.plugins.HelpPlugin, Class("paella.HLSPlayer", paella.Html5Video, {
    initialize: function (e, t, n, a, i, r) {
        this.parent(e, t, n, a, i, r, "hls")
    }
}), Class("paella.videoFactories.HLSVideoFactory", {
    isStreamCompatible: function (e) {
        if (base.userAgent.system.iOS && 0 == paella.videoFactories.Html5VideoFactory.s_instances) try {
            for (var t in e.sources) if ("hls" == t) return !0
        } catch (e) {
        }
        return !1
    }, getVideoObject: function (e, t, n) {
        return ++paella.videoFactories.Html5VideoFactory.s_instances, new paella.HLSPlayer(e, t, n.x, n.y, n.w, n.h)
    }
}), Class("paella.LiveStreamIndicator", paella.VideoOverlayButtonPlugin, {
    isEditorVisible: function () {
        return null != paella.editor.instance
    }, getIndex: function () {
        return 10
    }, getSubclass: function () {
        return "liveIndicator"
    }, getAlignment: function () {
        return "right"
    }, getDefaultToolTip: function () {
        return base.dictionary.translate("This video is a live stream")
    }, checkEnabled: function (e) {
        e(paella.player.isLiveStream())
    }, setup: function () {
    }, action: function (e) {
        paella.messageBox.showMessage(base.dictionary.translate("Live streaming mode: This is a live video, so, some capabilities of the player are disabled"))
    }, getName: function () {
        return "es.upv.paella.liveStreamingIndicatorPlugin"
    }
}), paella.plugins.liveStreamIndicator = new paella.LiveStreamIndicator, Class("paella.MpegDashVideo", paella.Html5Video, {
    _posterFrame: null,
    _player: null,
    initialize: function (e, t, n, a, i, r) {
        this.parent(e, t, n, a, i, r)
    },
    _loadDeps: function () {
        return new Promise(function (e, t) {
            window.$paella_mpd ? e(window.$paella_mpd) : require(["resources/deps/dash.all.js"], function () {
                window.$paella_mpd = !0, e(window.$paella_mpd)
            })
        })
    },
    _getQualityObject: function (e, t, n) {
        var a = n.length, i = Math.round(100 * t / a), r = 0 == t ? "min" : t == a - 1 ? "max" : i + "%";
        return {
            index: t, res: {w: null, h: null}, bitrate: e.bitrate, src: null, toString: function () {
                return i
            }, shortLabel: function () {
                return r
            }, compare: function (e) {
                return this.bitrate - e.bitrate
            }
        }
    },
    load: function () {
        var e = this, t = this;
        return new Promise(function (n, a) {
            var i = e._stream.sources.mpd;
            i && i.length > 0 ? (i = i[0], e._loadDeps().then(function () {
                var e = dashjs.MediaPlayer().create();
                e.initialize(t.video, i.src, !0), e.getDebug().setLogToBrowserConsole(!1), t._player = e, e.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, function (a, i) {
                    e.getBitrateInfoListFor("video");
                    t._deferredAction(function () {
                        t._firstPlay || (t._player.pause(), t._firstPlay = !0), n()
                    })
                })
            })) : a(new Error("Invalid source"))
        })
    },
    getQualities: function () {
        var e = this;
        return new Promise(function (t) {
            e._deferredAction(function () {
                e._qualities || (e._qualities = [], e._player.getBitrateInfoListFor("video").sort(function (e, t) {
                    return e.bitrate - t.bitrate
                }).forEach(function (t, n, a) {
                    e._qualities.push(e._getQualityObject(t, n, a))
                }), e.autoQualityIndex = e._qualities.length, e._qualities.push({
                    index: e.autoQualityIndex, res: {w: null, h: null}, bitrate: -1, src: null, toString: function () {
                        return "auto"
                    }, shortLabel: function () {
                        return "auto"
                    }, compare: function (e) {
                        return this.bitrate - e.bitrate
                    }
                })), t(e._qualities)
            })
        })
    },
    setQuality: function (e) {
        var t = this;
        return new Promise(function (n, a) {
            var i = t._player.getQualityFor("video");
            e == t.autoQualityIndex ? (t._player.setAutoSwitchQuality(!0), n()) : e != i ? (t._player.setAutoSwitchQuality(!1), t._player.off(dashjs.MediaPlayer.events.METRIC_CHANGED), t._player.on(dashjs.MediaPlayer.events.METRIC_CHANGED, function (e, a) {
                "metricchanged" == e.type && i != t._player.getQualityFor("video") && (i = This._player.getQualityFor("video"), n())
            }), t._player.setQualityFor("video", e)) : n()
        })
    },
    getCurrentQuality: function () {
        var e = this;
        return new Promise(function (t, n) {
            if (e._player.getAutoSwitchQuality()) t({
                index: e.autoQualityIndex, res: {w: null, h: null}, bitrate: -1, src: null, toString: function () {
                    return "auto"
                }, shortLabel: function () {
                    return "auto"
                }, compare: function (e) {
                    return this.bitrate - e.bitrate
                }
            }); else {
                var a = e._player.getQualityFor("video");
                t(e._getQualityObject(e._qualities[a], a, e._player.getBitrateInfoListFor("video")))
            }
        })
    },
    unFreeze: function () {
        return paella_DeferredNotImplemented()
    },
    freeze: function () {
        return paella_DeferredNotImplemented()
    },
    unload: function () {
        return this._callUnloadEvent(), paella_DeferredNotImplemented()
    }
}), Class("paella.videoFactories.MpegDashVideoFactory", {
    isStreamCompatible: function (e) {
        try {
            if (base.userAgent.system.iOS && paella.videoFactories.Html5VideoFactory.s_instances > 0) return !1;
            for (var t in e.sources) if ("mpd" == t) return !0
        } catch (e) {
        }
        return !1
    }, getVideoObject: function (e, t, n) {
        return ++paella.videoFactories.Html5VideoFactory.s_instances, new paella.MpegDashVideo(e, t, n.x, n.y, n.w, n.h)
    }
}), Class("paella.plugins.MultipleQualitiesPlugin", paella.ButtonPlugin, {
    _available: [], getAlignment: function () {
        return "right"
    }, getSubclass: function () {
        return "showMultipleQualitiesPlugin"
    }, getIndex: function () {
        return 2030
    }, getMinWindowSize: function () {
        return 550
    }, getName: function () {
        return "es.upv.paella.multipleQualitiesPlugin"
    }, getDefaultToolTip: function () {
        return base.dictionary.translate("Change video quality")
    }, closeOnMouseOut: function () {
        return !0
    }, checkEnabled: function (e) {
        var t = this;
        paella.player.videoContainer.getQualities().then(function (n) {
            t._available = n, e(n.length > 1)
        })
    }, setup: function () {
        var e = this;
        this.setQualityLabel(), paella.events.bind(paella.events.qualityChanged, function (t) {
            e.setQualityLabel()
        })
    }, getButtonType: function () {
        return paella.ButtonPlugin.type.popUpButton
    }, buildContent: function (e) {
        var t = this;
        this._available.forEach(function (n) {
            n.shortLabel();
            e.appendChild(t.getItemButton(n))
        })
    }, getItemButton: function (e) {
        var t = document.createElement("div"), n = this;
        return paella.player.videoContainer.getCurrentQuality().then(function (a, i) {
            var r = e.shortLabel();
            t.className = n.getButtonItemClass(r, e.index == a), t.id = r, t.innerHTML = r, t.data = e, $(t).click(function (e) {
                $(".multipleQualityItem").removeClass("selected"), $(".multipleQualityItem." + this.data.toString()).addClass("selected"), paella.player.videoContainer.setQuality(this.data.index).then(function () {
                    paella.player.controls.hidePopUp(n.getName()), n.setQualityLabel()
                })
            })
        }), t
    }, setQualityLabel: function () {
        var e = this;
        paella.player.videoContainer.getCurrentQuality().then(function (t) {
            e.setText(t.shortLabel())
        })
    }, getButtonItemClass: function (e, t) {
        return "multipleQualityItem " + e + (t ? " selected" : "")
    }
}), paella.plugins.multipleQualitiesPlugin = new paella.plugins.MultipleQualitiesPlugin, Class("paella.plugins.PlaybackRate", paella.ButtonPlugin, {
    buttonItems: null,
    buttons: [],
    selected_button: null,
    defaultRate: null,
    _domElement: null,
    available_rates: null,
    getAlignment: function () {
        return "left"
    },
    getSubclass: function () {
        return "showPlaybackRateButton"
    },
    getIndex: function () {
        return 140
    },
    getMinWindowSize: function () {
        return 500
    },
    getName: function () {
        return "es.upv.paella.playbackRatePlugin"
    },
    getButtonType: function () {
        return paella.ButtonPlugin.type.popUpButton
    },
    getDefaultToolTip: function () {
        return base.dictionary.translate("Set playback rate")
    },
    checkEnabled: function (e) {
        e(!base.userAgent.browser.IsMobileVersion && null != dynamic_cast("paella.Html5Video", paella.player.videoContainer.masterVideo()))
    },
    closeOnMouseOut: function () {
        return !0
    },
    setup: function () {
        this.defaultRate = 1, this.available_rates = this.config.availableRates || [.75, 1, 1.25, 1.5]
    },
    buildContent: function (e) {
        var t = this;
        t._domElement = e, this.buttonItems = {}, this.available_rates.forEach(function (n) {
            e.appendChild(t.getItemButton(n + "x", n))
        })
    },
    getItemButton: function (e, t) {
        var n = document.createElement("div");
        return n.className = 1 == t ? this.getButtonItemClass(e, !0) : this.getButtonItemClass(e, !1), n.id = e + "_button", n.innerHTML = e, n.data = {
            label: e,
            rate: t,
            plugin: this
        }, $(n).click(function (e) {
            this.data.plugin.onItemClick(this, this.data.label, this.data.rate)
        }), n
    },
    onItemClick: function (e, t, n) {
        var a = this;
        paella.player.videoContainer.setPlaybackRate(n), this.setText(t), paella.player.controls.hidePopUp(this.getName());
        for (var i = a._domElement.children, r = 0; r < i.length; r++) i[r].className = a.getButtonItemClass(r, !1);
        e.className = a.getButtonItemClass(r, !0)
    },
    getText: function () {
        return "1x"
    },
    getProfileItemButton: function (e, t) {
        var n = document.createElement("div");
        return n.className = this.getButtonItemClass(e, !1), n.id = e + "_button", n.data = {profile: e, profileData: t, plugin: this}, $(n).click(function (e) {
            this.data.plugin.onItemClick(this, this.data.profile, this.data.profileData)
        }), n
    },
    getButtonItemClass: function (e, t) {
        return "playbackRateItem " + e + (t ? " selected" : "")
    }
}), paella.plugins.playbackRate = new paella.plugins.PlaybackRate, Class("paella.plugins.PIPModePlugin", paella.ButtonPlugin, {
    getIndex: function () {
        return 551
    }, getAlignment: function () {
        return "right"
    }, getSubclass: function () {
        return "PIPModeButton"
    }, getName: function () {
        return "es.upv.paella.pipModePlugin"
    }, checkEnabled: function (e) {
        var t = paella.player.videoContainer.masterVideo(), n = t.video;
        e(!(!n || !n.webkitSetPresentationMode))
    }, getDefaultToolTip: function () {
        return base.dictionary.translate("Set picture-in-picture mode.")
    }, setup: function () {
    }, action: function (e) {
        var t = paella.player.videoContainer.masterVideo().video;
        "picture-in-picture" == t.webkitPresentationMode ? t.webkitSetPresentationMode("inline") : t.webkitSetPresentationMode("picture-in-picture")
    }
}), paella.plugins.pipModePlugin = new paella.plugins.PIPModePlugin, Class("paella.plugins.PlayPauseButtonPlugin", paella.ButtonPlugin, {
    playSubclass: "playButton", pauseSubclass: "pauseButton", getAlignment: function () {
        return "left"
    }, getSubclass: function () {
        return this.playSubclass
    }, getName: function () {
        return "es.upv.paella.playPauseButtonPlugin"
    }, getDefaultToolTip: function () {
        return base.dictionary.translate("Play")
    }, getIndex: function () {
        return 110
    }, checkEnabled: function (e) {
        e(!paella.player.isLiveStream())
    }, setup: function () {
        var e = this;
        paella.player.playing() && this.changeSubclass(e.pauseSubclass), paella.events.bind(paella.events.play, function (t) {
            e.changeSubclass(e.pauseSubclass), e.setToolTip(paella.dictionary.translate("Pause"))
        }), paella.events.bind(paella.events.pause, function (t) {
            e.changeSubclass(e.playSubclass), e.setToolTip(paella.dictionary.translate("Play"))
        })
    }, action: function (e) {
        paella.player.videoContainer.paused().then(function (e) {
            e ? paella.player.play() : paella.player.pause()
        })
    }
}), paella.plugins.playPauseButtonPlugn = new paella.plugins.PlayPauseButtonPlugin, Class("paella.plugins.PlayButtonOnScreen", paella.EventDrivenPlugin, {
    containerId: "paella_plugin_PlayButtonOnScreen",
    container: null,
    enabled: !0,
    isPlaying: !1,
    showIcon: !0,
    firstPlay: !1,
    checkEnabled: function (e) {
        e(!paella.player.isLiveStream())
    },
    getIndex: function () {
        return 1010
    },
    getName: function () {
        return "es.upv.paella.playButtonOnScreenPlugin"
    },
    setup: function () {
        function e() {
            var e = jQuery(t.container).innerWidth(), a = jQuery(t.container).innerHeight();
            n.width = e, n.height = a;
            var i = e < a ? e / 3 : a / 3, r = n.getContext("2d");
            r.translate((e - i) / 2, (a - i) / 2), r.beginPath(), r.arc(i / 2, i / 2, i / 2, 0, 2 * Math.PI, !0), r.closePath(), r.strokeStyle = "white", r.lineWidth = 10, r.stroke(), r.fillStyle = "#8f8f8f", r.fill(), r.beginPath(), r.moveTo(i / 3, i / 4), r.lineTo(3 * i / 4, i / 2), r.lineTo(i / 3, 3 * i / 4), r.lineTo(i / 3, i / 4), r.closePath(), r.fillStyle = "white", r.fill(), r.stroke()
        }

        var t = this;
        this.container = document.createElement("div"), this.container.className = "playButtonOnScreen", this.container.id = this.containerId, this.container.style.width = "100%", this.container.style.height = "100%", paella.player.videoContainer.domElement.appendChild(this.container), $(this.container).click(function (e) {
            t.onPlayButtonClick()
        });
        var n = document.createElement("canvas");
        n.className = "playButtonOnScreenIcon", this.container.appendChild(n), paella.events.bind(paella.events.resize, e), e()
    },
    getEvents: function () {
        return [paella.events.endVideo, paella.events.play, paella.events.pause, paella.events.showEditor, paella.events.hideEditor]
    },
    onEvent: function (e, t) {
        switch (e) {
            case paella.events.endVideo:
                this.endVideo();
                break;
            case paella.events.play:
                this.play();
                break;
            case paella.events.pause:
                this.pause();
                break;
            case paella.events.showEditor:
                this.showEditor();
                break;
            case paella.events.hideEditor:
                this.hideEditor()
        }
    },
    onPlayButtonClick: function () {
        this.firstPlay = !0, this.checkStatus()
    },
    endVideo: function () {
        this.isPlaying = !1, this.checkStatus()
    },
    play: function () {
        this.isPlaying = !0, this.showIcon = !1, this.checkStatus()
    },
    pause: function () {
        this.isPlaying = !1, this.showIcon = !1, this.checkStatus()
    },
    showEditor: function () {
        this.enabled = !1, this.checkStatus()
    },
    hideEditor: function () {
        this.enabled = !0, this.checkStatus()
    },
    checkStatus: function () {
        this.enabled && this.isPlaying || !this.enabled || !this.showIcon ? $(this.container).hide() : $(this.container).show()
    }
}), new paella.plugins.PlayButtonOnScreen, Class("paella.plugins.RatePlugin", paella.ButtonPlugin, {
    buttonItems: null,
    buttons: [],
    selected_button: null,
    score: 0,
    count: 0,
    myScore: 0,
    canVote: !1,
    scoreContainer: {header: null, rateButtons: null},
    getAlignment: function () {
        return "right"
    },
    getSubclass: function () {
        return "rateButtonPlugin"
    },
    getIndex: function () {
        return 540
    },
    getMinWindowSize: function () {
        return 500
    },
    getName: function () {
        return "es.upv.paella.ratePlugin"
    },
    getButtonType: function () {
        return paella.ButtonPlugin.type.popUpButton
    },
    getDefaultToolTip: function () {
        return base.dictionary.translate("Rate this video")
    },
    checkEnabled: function (e) {
        var t = this;
        paella.data.read("rate", {id: paella.initDelegate.getId()}, function (n, a) {
            n && "object" == $traceurRuntime.typeof(n) && (t.score = Number(n.mean).toFixed(1), t.count = n.count, t.myScore = n.myScore, t.canVote = n.canVote), e(a)
        })
    },
    setup: function () {
    },
    setScore: function (e) {
        this.score = e, this.updateScore()
    },
    closeOnMouseOut: function () {
        return !0
    },
    updateHeader: function () {
        var e = base.dictionary.translate("Not rated");
        this.count > 0 && (e = '<i class="glyphicon glyphicon-star"></i>', e += " " + this.score + ", " + this.count + " " + base.dictionary.translate("votes")), this.scoreContainer.header.innerHTML = "\n\t\t<div>\n\t\t\t<h4>" + base.dictionary.translate("Video score") + ":</h4>\n\t\t\t<h5>\n\t\t\t\t" + e + "\n\t\t\t</h5>\n\t\t\t</h4>\n\t\t\t<h4>" + base.dictionary.translate("Vote:") + "</h4>\n\t\t</div>\n\t\t"
    },
    updateRateButtons: function () {
        if (this.scoreContainer.rateButtons.className = "rateButtons", this.buttons = [], this.canVote) {
            this.scoreContainer.rateButtons.innerHTML = "";
            for (var e = 0; e < 5; ++e) {
                var t = this.getStarButton(e + 1);
                this.buttons.push(t), this.scoreContainer.rateButtons.appendChild(t)
            }
        } else this.scoreContainer.rateButtons.innerHTML = "<h5>" + base.dictionary.translate("Login to vote") + "</h5>";
        this.updateVote()
    },
    buildContent: function (e) {
        this._domElement = e;
        var t = document.createElement("div");
        e.appendChild(t), t.className = "rateContainerHeader", this.scoreContainer.header = t, this.updateHeader();
        var n = document.createElement("div");
        this.scoreContainer.rateButtons = n, e.appendChild(n), this.updateRateButtons()
    },
    getStarButton: function (e) {
        var t = this, n = document.createElement("i");
        return n.data = {score: e, active: !1}, n.className = "starButton glyphicon glyphicon-star-empty", $(n).click(function (e) {
            t.vote(this.data.score)
        }), n
    },
    vote: function (e) {
        var t = this;
        this.myScore = e;
        var n = {mean: this.score, count: this.count, myScore: e, canVote: this.canVote};
        paella.data.write("rate", {id: paella.initDelegate.getId()}, n, function (e) {
            paella.data.read("rate", {id: paella.initDelegate.getId()}, function (e, n) {
                e && "object" == $traceurRuntime.typeof(e) && (t.score = Number(e.mean).toFixed(1), t.count = e.count, t.myScore = e.myScore, t.canVote = e.canVote), t.updateHeader(), t.updateRateButtons()
            })
        })
    },
    updateVote: function () {
        var e = this;
        this.buttons.forEach(function (t, n) {
            t.className = n < e.myScore ? "starButton glyphicon glyphicon-star" : "starButton glyphicon glyphicon-star-empty"
        })
    }
}), paella.plugins.ratePlugin = new paella.plugins.RatePlugin, Class("paella.RTMPVideo", paella.VideoElementBase, {
    _posterFrame: null,
    _currentQuality: null,
    _duration: 0,
    _paused: !0,
    _flashId: null,
    _swfContainer: null,
    _flashVideo: null,
    _volume: 1,
    initialize: function (e, t, n, a, i, r) {
        this.parent(e, t, "div", n, a, i, r), this._flashId = e + "Movie";
        var o = this;
        this._stream.sources.rtmp.sort(function (e, t) {
            return e.res.h - t.res.h
        });
        var l = function (e, t) {
            if ("loadedmetadata" == e || "pause" == e || o._isReady || (o._isReady = !0, o._duration = t.duration, $(o.swfContainer).trigger("paella:flashvideoready")), "progress" == e) {
                try {
                    o.flashVideo.setVolume(o._volume)
                } catch (e) {
                }
                base.log.debug("Flash video event: " + e + ", progress: " + o.flashVideo.currentProgress())
            } else "ended" == e ? (base.log.debug("Flash video event: " + e), paella.events.trigger(paella.events.pause), paella.player.controls.showControls()) : base.log.debug("Flash video event: " + e)
        }, s = function (e, t) {
            t = t.split(",");
            for (var n = {}, a = 0; a < t.length; ++a) {
                var i = t[a].split(":"), r = i[0], o = i[1];
                "NaN" == o ? o = NaN : /^true$/i.test(o) ? o = !0 : /^false$/i.test(o) ? o = !1 : isNaN(parseFloat(o)) || (o = parseFloat(o)), n[r] = o
            }
            l(e, n)
        };
        paella.events.bind(paella.events.flashVideoEvent, function (e, t) {
            o.flashId == t.source && s(t.eventName, t.values)
        }), Object.defineProperty(this, "swfContainer", {
            get: function () {
                return o._swfContainer
            }
        }), Object.defineProperty(this, "flashId", {
            get: function () {
                return o._flashId
            }
        }), Object.defineProperty(this, "flashVideo", {
            get: function () {
                return o._flashVideo
            }
        })
    },
    _createSwfObject: function (e, t) {
        var n = this.identifier, a = {wmode: "transparent"}, i = document.createElement("div");
        if (this.domElement.appendChild(i), i.id = n + "Movie", this._swfContainer = i, swfobject.hasFlashPlayerVersion("9.0.0")) swfobject.embedSWF(e, i.id, "100%", "100%", "9.0.0", "", t, a, null, function (e) {
            if (0 == e.success) {
                var t = document.createElement("div"), n = document.createElement("h3");
                n.innerHTML = base.dictionary.translate("Flash player problem");
                var a = document.createElement("div");
                a.innerHTML = base.dictionary.translate("A problem occurred trying to load flash player.") + "<br>" + base.dictionary.translate("Please go to {0} and install it.").replace("{0}", "<a style='color: #800000; text-decoration: underline;' href='http://www.adobe.com/go/getflash'>http://www.adobe.com/go/getflash</a>") + "<br>" + base.dictionary.translate("If the problem presist, contact us.");
                var i = document.createElement("a");
                i.setAttribute("href", "http://www.adobe.com/go/getflash"), i.innerHTML = '<img style="margin:5px;" src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Obtener Adobe Flash Player" />', t.appendChild(n), t.appendChild(a), t.appendChild(i), paella.messageBox.showError(t.innerHTML)
            }
        }); else {
            var r = document.createElement("div"), o = document.createElement("h3");
            o.innerHTML = base.dictionary.translate("Flash player 9 nedded");
            var l = document.createElement("div");
            l.innerHTML = base.dictionary.translate("You need at least Flash player 9 installed.") + "<br>" + base.dictionary.translate("Please go to {0} and install it.").replace("{0}", "<a style='color: #800000; text-decoration: underline;' href='http://www.adobe.com/go/getflash'>http://www.adobe.com/go/getflash</a>");
            var s = document.createElement("a");
            s.setAttribute("href", "http://www.adobe.com/go/getflash"), s.innerHTML = '<img style="margin:5px;" src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Obtener Adobe Flash Player" />', r.appendChild(o), r.appendChild(l), r.appendChild(s), paella.messageBox.showError(r.innerHTML)
        }
        return $("#" + i.id)[0]
    },
    _deferredAction: function (e) {
        var t = this;
        return new Promise(function (n, a) {
            t.ready ? n(e()) : $(t.swfContainer).bind("paella:flashvideoready", function () {
                t._ready = !0, n(e())
            })
        })
    },
    _getQualityObject: function (e, t) {
        return {
            index: e, res: t.res, src: t.src, toString: function () {
                return this.res.w + "x" + this.res.h
            }, shortLabel: function () {
                return this.res.h + "p"
            }, compare: function (e) {
                return this.res.w * this.res.h - e.res.w * e.res.h
            }
        }
    },
    getVideoData: function () {
        var e = this, t = this;
        return new Promise(function (n, a) {
            e._deferredAction(function () {
                var e = {
                    duration: t.flashVideo.duration(),
                    currentTime: t.flashVideo.getCurrentTime(),
                    volume: t.flashVideo.getVolume(),
                    paused: t._paused,
                    ended: t._ended,
                    res: {w: t.flashVideo.getWidth(), h: t.flashVideo.getHeight()}
                };
                n(e)
            })
        })
    },
    setPosterFrame: function (e) {
        if (null == this._posterFrame) {
            this._posterFrame = e;
            var t = document.createElement("img");
            t.src = e, t.className = "videoPosterFrameImage", t.alt = "poster frame", this.domElement.appendChild(t), this._posterFrameElement = t
        }
    },
    setAutoplay: function (e) {
        this._autoplay = e
    },
    load: function () {
        var e = this._stream.sources.rtmp;
        null === this._currentQuality && this._videoQualityStrategy && (this._currentQuality = this._videoQualityStrategy.getQualityIndex(e));
        var t = this._currentQuality < e.length ? e[this._currentQuality] : null;
        if (t) {
            if (function (e) {
                    return e.src && "object" == $traceurRuntime.typeof(e.src) && e.src.server && e.src.stream
                }(t)) {
                var n = !1;
                void 0 === t.src.requiresSubscription && paella.player.config.player.rtmpSettings ? n = paella.player.config.player.rtmpSettings.requiresSubscription || !1 : t.src.requiresSubscription && (n = t.src.requiresSubscription);
                var a = {};
                return this._autoplay && (a.autoplay = this._autoplay), "true" == base.parameters.get("debug") && (a.debugMode = !0), a.playerId = this.flashId, a.isLiveStream = void 0 !== t.isLiveStream && t.isLiveStream, a.server = t.src.server, a.stream = t.src.stream, a.subscribe = n, paella.player.config.player.rtmpSettings && void 0 !== paella.player.config.player.rtmpSettings.bufferTime && (a.bufferTime = paella.player.config.player.rtmpSettings.bufferTime), this._flashVideo = this._createSwfObject("resources/deps/player_streaming.swf", a), $(this.swfContainer).trigger("paella:flashvideoready"), this._deferredAction(function () {
                    return t
                })
            }
            return paella_DeferredRejected(new Error("Invalid video data"))
        }
        return paella_DeferredRejected(new Error("Could not load video: invalid quality stream index"))
    },
    getQualities: function () {
        var e = this;
        return new Promise(function (t, n) {
            setTimeout(function () {
                var n = [], a = e._stream.sources.rtmp, i = -1;
                a.forEach(function (t) {
                    i++, n.push(e._getQualityObject(i, t))
                }), t(n)
            }, 50)
        })
    },
    setQuality: function (e) {
        var t = this;
        return e = void 0 !== e && null !== e ? e : 0, new Promise(function (n, a) {
            var i = (t._paused, t._stream.sources.rtmp);
            if (t._currentQuality = e < i.length ? e : 0, i[e].isLiveStream) return n();
            t._currentTime;
            t.load().then(function () {
                n()
            })
        })
    },
    getCurrentQuality: function () {
        var e = this;
        return new Promise(function (t, n) {
            t(e._getQualityObject(e._currentQuality, e._stream.sources.rtmp[e._currentQuality]))
        })
    },
    play: function () {
        var e = this;
        return this._deferredAction(function () {
            e._posterFrameElement && (e._posterFrameElement.parentNode.removeChild(e._posterFrameElement), e._posterFrameElement = null), e._paused = !1, e.flashVideo.play()
        })
    },
    pause: function () {
        var e = this;
        return this._deferredAction(function () {
            e._paused = !0, e.flashVideo.pause()
        })
    },
    isPaused: function () {
        var e = this;
        return this._deferredAction(function () {
            return e._paused
        })
    },
    duration: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.flashVideo.duration()
        })
    },
    setCurrentTime: function (e) {
        var t = this;
        return this._deferredAction(function () {
            var n = t.flashVideo.duration();
            t.flashVideo.seekTo(100 * e / n)
        })
    },
    currentTime: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.flashVideo.getCurrentTime()
        })
    },
    setVolume: function (e) {
        var t = this;
        return this._volume = e, this._deferredAction(function () {
            t.flashVideo.setVolume(e)
        })
    },
    volume: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.flashVideo.getVolume()
        })
    },
    setPlaybackRate: function (e) {
        var t = this;
        return this._deferredAction(function () {
            t._playbackRate = e
        })
    },
    playbackRate: function () {
        var e = this;
        return this._deferredAction(function () {
            return e._playbackRate
        })
    },
    goFullScreen: function () {
        return paella_DeferredNotImplemented()
    },
    unFreeze: function () {
        return this._deferredAction(function () {
        })
    },
    freeze: function () {
        return this._deferredAction(function () {
        })
    },
    unload: function () {
        return this._callUnloadEvent(), paella_DeferredNotImplemented()
    },
    getDimensions: function () {
        return paella_DeferredNotImplemented()
    }
}), Class("paella.videoFactories.RTMPVideoFactory", {
    isStreamCompatible: function (e) {
        try {
            if (base.userAgent.system.iOS || base.userAgent.system.Android) return !1;
            for (var t in e.sources) if ("rtmp" == t) return !0
        } catch (e) {
        }
        return !1
    }, getVideoObject: function (e, t, n) {
        return new paella.RTMPVideo(e, t, n.x, n.y, n.w, n.h)
    }
}), Class("paella.plugins.CaptionsSearchPlugIn", paella.SearchServicePlugIn, {
    getName: function () {
        return "es.upv.paella.search.captionsSearchPlugin"
    }, search: function (e, t) {
        paella.captions.search(e, t)
    }
}), new paella.plugins.CaptionsSearchPlugIn, Class("paella.plugins.SearchPlugin", paella.ButtonPlugin, {
    _open: !1,
    _sortDefault: "time",
    _colorSearch: !1,
    _localImages: null,
    _searchTimer: null,
    _searchTimerTime: 1500,
    _searchBody: null,
    getAlignment: function () {
        return "right"
    },
    getSubclass: function () {
        return "searchButton"
    },
    getMinWindowSize: function () {
        return 550
    },
    getName: function () {
        return "es.upv.paella.searchPlugin"
    },
    getButtonType: function () {
        return paella.ButtonPlugin.type.popUpButton
    },
    getDefaultToolTip: function () {
        return base.dictionary.translate("Search")
    },
    getIndex: function () {
        return 510
    },
    closeOnMouseOut: function () {
        return !0
    },
    checkEnabled: function (e) {
        e(!0)
    },
    setup: function () {
        var e = this;
        $(".searchButton").click(function (t) {
            e._open ? e._open = !1 : (e._open = !0, setTimeout(function () {
                $("#searchBarInput").focus()
            }, 0))
        }), e._localImages = paella.initDelegate.initParams.videoLoader.frameList, e._colorSearch = e.config.colorSearch || !1, e._sortDefault = e.config.sortType || "time", paella.events.bind(paella.events.controlBarWillHide, function (t) {
            e._open && paella.player.controls.cancelHideBar()
        })
    },
    prettyTime: function (e) {
        var t = Math.floor(e / 3600) % 24;
        t = ("00" + t).slice(t.toString().length);
        var n = Math.floor(e / 60) % 60;
        n = ("00" + n).slice(n.toString().length);
        var a = Math.floor(e % 60);
        return a = ("00" + a).slice(a.toString().length), t + ":" + n + ":" + a
    },
    search: function (e, t) {
        paella.searchService.search(e, t)
    },
    getPreviewImage: function (e) {
        var t = this, n = Object.keys(t._localImages);
        n.push(e), n.sort(function (e, t) {
            return parseInt(e) - parseInt(t)
        });
        var a = n.indexOf(e) - 1;
        a = a > 0 ? a : 0;
        var i = n[a];
        return i = parseInt(i), t._localImages[i].url
    },
    createLoadingElement: function (e) {
        var t = document.createElement("div");
        t.className = "loader";
        t.innerHTML = '<svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="40px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve"><path fill="#000" d="M25.251,6.461c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615V6.461z"><animateTransform attributeType="xml"attributeName="transform"type="rotate"from="0 25 25"to="360 25 25"dur="0.6s"repeatCount="indefinite"/></path></svg>', e.appendChild(t);
        var n = document.createElement("p");
        n.className = "sBodyText", n.innerHTML = base.dictionary.translate("Searching") + "...", e.appendChild(n)
    },
    createNotResultsFound: function (e) {
        var t = document.createElement("div");
        t.className = "noResults", t.innerHTML = base.dictionary.translate("Sorry! No results found."), e.appendChild(t)
    },
    doSearch: function (e, t) {
        var n = this;
        $(t).empty(), n.createLoadingElement(t), n.search(e, function (e, a) {
            if ($(t).empty(), !e) if (0 == a.length) n.createNotResultsFound(t); else for (var i = 0; i < a.length; i++) {
                "score" == n._sortDefault && a.sort(function (e, t) {
                    return t.score - e.score
                }), "time" == n._sortDefault && a.sort(function (e, t) {
                    return e.time - t.time
                });
                var r = document.createElement("div");
                r.className = "sBodyInnerContainer", n._colorSearch && (a[i].score <= .3 && $(r).addClass("redScore"), a[i].score >= .7 && $(r).addClass("greenScore"));
                var o = document.createElement("div");
                o.className = "TimePicContainer";
                var l = document.createElement("img");
                l.className = "sBodyPicture", l.src = n.getPreviewImage(a[i].time);
                var s = document.createElement("p");
                s.className = "sBodyText", s.innerHTML = "<span class='timeSpan'>" + n.prettyTime(a[i].time) + "</span>" + a[i].content, o.appendChild(l), r.appendChild(o), r.appendChild(s), t.appendChild(r), r.setAttribute("sec", a[i].time), $(r).hover(function () {
                    $(this).css("background-color", "#faa166")
                }, function () {
                    $(this).removeAttr("style")
                }), $(r).click(function () {
                    var e = $(this).attr("sec");
                    paella.player.videoContainer.seekToTime(e), paella.player.play()
                })
            }
        })
    },
    buildContent: function (e) {
        var t = this, n = document.createElement("div");
        n.className = "searchPluginContainer";
        var a = document.createElement("div");
        a.className = "searchBody", n.appendChild(a), t._searchBody = a;
        var i = document.createElement("div");
        i.className = "searchBar", n.appendChild(i);
        var r = document.createElement("input");
        r.className = "searchBarInput", r.type = "text", r.id = "searchBarInput", r.name = "searchString", r.placeholder = base.dictionary.translate("Search"), i.appendChild(r), $(r).change(function () {
            var e = $(r).val();
            null != t._searchTimer && t._searchTimer.cancel(), "" != e && t.doSearch(e, a)
        }), $(r).keyup(function (e) {
            if (13 != e.keyCode) {
                var n = $(r).val();
                null != t._searchTimer && t._searchTimer.cancel(), "" != n ? t._searchTimer = new base.Timer(function (e) {
                    t.doSearch(n, a)
                }, t._searchTimerTime) : $(t._searchBody).empty()
            }
        }), $(r).focus(function () {
            paella.keyManager.enabled = !1
        }), $(r).focusout(function () {
            paella.keyManager.enabled = !0
        }), e.appendChild(n)
    }
}), paella.plugins.searchPlugin = new paella.plugins.SearchPlugin, Class("paella.ShowEditorPlugin", paella.VideoOverlayButtonPlugin, {
    isEditorVisible: function () {
        return null != paella.editor.instance
    }, getIndex: function () {
        return 10
    }, getSubclass: function () {
        return "showEditorButton"
    }, getAlignment: function () {
        return "right"
    }, getDefaultToolTip: function () {
        return base.dictionary.translate("Enter editor mode")
    }, checkEnabled: function (e) {
        paella.editor && paella.player.config.editor && paella.player.config.editor.enabled && !base.userAgent.browser.IsMobileVersion && this.config.alwaysVisible && !paella.player.isLiveStream() ? paella.initDelegate.initParams.accessControl.canWrite().then(e) : e(!1)
    }, setup: function () {
        var e = this;
        paella.events.bind(paella.events.hideEditor, function (t) {
            e.onHideEditor()
        }), paella.events.bind(paella.events.showEditor, function (t) {
            e.onShowEditor()
        })
    }, action: function (e) {
        var t = this.config.editorPage ? this.config.editorPage : "", n = !!this.config.openEditorInIframe && this.config.openEditorInIframe;
        window == window.top || n ? paella.events.trigger(paella.events.showEditor) : window.open(t + "?id=" + paella.player.videoIdentifier, "_top")
    }, onHideEditor: function () {
        this.showButton()
    }, onShowEditor: function () {
        this.hideButton()
    }, getName: function () {
        return "es.upv.paella.showEditorPlugin"
    }
}), paella.plugins.showEditorPlugin = new paella.ShowEditorPlugin, Class("paella.plugins.SocialPlugin", paella.ButtonPlugin, {
    buttonItems: null,
    socialMedia: null,
    getAlignment: function () {
        return "right"
    },
    getSubclass: function () {
        return "showSocialPluginButton"
    },
    getIndex: function () {
        return 560
    },
    getMinWindowSize: function () {
        return 600
    },
    getName: function () {
        return "es.upv.paella.socialPlugin"
    },
    checkEnabled: function (e) {
        e(!0)
    },
    getDefaultToolTip: function () {
        return base.dictionary.translate("Share this video")
    },
    getButtonType: function () {
        return paella.ButtonPlugin.type.popUpButton
    },
    buttons: [],
    selected_button: null,
    closeOnMouseOut: function () {
        return !0
    },
    initialize: function () {
        if (this.parent(), "es" == base.dictionary.currentLanguage()) {
            var e = {
                "Custom size:": "Tamaño personalizado:",
                "Choose your embed size. Copy the text and paste it in your html page.": "Elija el tamaño del video a embeber. Copie el texto y péguelo en su página html.",
                "Width:": "Ancho:",
                "Height:": "Alto:"
            };
            base.dictionary.addDictionary(e)
        }
    },
    setup: function () {
        var e = this, t = {Tab: 9, Return: 13, Esc: 27, End: 35, Home: 36, Left: 37, Up: 38, Right: 39, Down: 40};
        $(this.button).keyup(function (n) {
            e.isPopUpOpen() && (n.keyCode == t.Up ? e.selected_button > 0 && (e.selected_button < e.buttons.length && (e.buttons[e.selected_button].className = "socialItemButton " + e.buttons[e.selected_button].data.mediaData), e.selected_button--, e.buttons[e.selected_button].className = e.buttons[e.selected_button].className + " selected") : n.keyCode == t.Down ? e.selected_button < e.buttons.length - 1 && (e.selected_button >= 0 && (e.buttons[e.selected_button].className = "socialItemButton " + e.buttons[e.selected_button].data.mediaData), e.selected_button++, e.buttons[e.selected_button].className = e.buttons[e.selected_button].className + " selected") : n.keyCode == t.Return && e.onItemClick(e.buttons[e.selected_button].data.mediaData))
        })
    },
    buildContent: function (e) {
        var t = this;
        this.buttonItems = {}, this.socialMedia = ["facebook", "twitter", "embed"], this.socialMedia.forEach(function (n) {
            var a = t.getSocialMediaItemButton(n);
            t.buttonItems[t.socialMedia.indexOf(n)] = a, e.appendChild(a), t.buttons.push(a)
        }), this.selected_button = this.buttons.length
    },
    getSocialMediaItemButton: function (e) {
        var t = document.createElement("div");
        return t.className = "socialItemButton " + e, t.id = e + "_button", t.data = {mediaData: e, plugin: this}, $(t).click(function (e) {
            this.data.plugin.onItemClick(this.data.mediaData)
        }), t
    },
    onItemClick: function (e) {
        var t = this.getVideoUrl();
        switch (e) {
            case"twitter":
                window.open("http://twitter.com/home?status=" + t);
                break;
            case"facebook":
                window.open("http://www.facebook.com/sharer.php?u=" + t);
                break;
            case"embed":
                this.embedPress()
        }
        paella.player.controls.hidePopUp(this.getName())
    },
    getVideoUrl: function () {
        return document.location.href
    },
    embedPress: function () {
        var e = document.location.protocol + "//" + document.location.host, t = document.location.pathname, n = t.split("/");
        n.length > 0 && (n[n.length - 1] = "embed.html");
        var a = paella.initDelegate.getId(), i = e + n.join("/") + "?id=" + a,
            r = "<div style='display:inline-block;'>     <div class='embedSizeButton' style='width:110px; height:73px;'> <span style='display:flex; align-items:center; justify-content:center; width:100%; height:100%;'> 620x349 </span></div>    <div class='embedSizeButton' style='width:100px; height:65px;'> <span style='display:flex; align-items:center; justify-content:center; width:100%; height:100%;'> 540x304 </span></div>    <div class='embedSizeButton' style='width:90px;  height:58px;'> <span style='display:flex; align-items:center; justify-content:center; width:100%; height:100%;'> 460x259 </span></div>    <div class='embedSizeButton' style='width:80px;  height:50px;'> <span style='display:flex; align-items:center; justify-content:center; width:100%; height:100%;'> 380x214 </span></div>    <div class='embedSizeButton' style='width:70px;  height:42px;'> <span style='display:flex; align-items:center; justify-content:center; width:100%; height:100%;'> 300x169 </span></div></div><div style='display:inline-block; vertical-align:bottom; margin-left:10px;'>    <div>" + base.dictionary.translate("Custom size:") + "</div>    <div>" + base.dictionary.translate("Width:") + " <input id='social_embed_width-input' class='embedSizeInput' maxlength='4' type='text' name='Costum width min 300px' alt='Costum width min 300px' title='Costum width min 300px' value=''></div>    <div>" + base.dictionary.translate("Height:") + " <input id='social_embed_height-input' class='embedSizeInput' maxlength='4' type='text' name='Costum width min 300px' alt='Costum width min 300px' title='Costum width min 300px' value=''></div></div>",
            o = "<div id='embedContent' style='text-align:left; font-size:14px; color:black;'><div id=''>" + r + "</div> <div id=''>" + base.dictionary.translate("Choose your embed size. Copy the text and paste it in your html page.") + "</div> <div id=''><textarea id='social_embed-textarea' class='social_embed-textarea' rows='4' cols='1' style='font-size:12px; width:95%; overflow:auto; margin-top:5px; color:black;'></textarea></div>  </div>";
        paella.messageBox.showMessage(o, {
            closeButton: !0, width: "750px", height: "210px", onClose: function () {
            }
        });
        var l = $("#social_embed_width-input")[0], s = $("#social_embed_height-input")[0];
        l.onkeyup = function (e) {
            var t = parseInt(l.value), n = parseInt(s.value);
            isNaN(t) ? l.value = "" : t < 300 ? $("#social_embed-textarea")[0].value = "Embed width too low. The minimum value is a width of 300." : (isNaN(n) && (n = (t / (16 / 9)).toFixed(), s.value = n), $("#social_embed-textarea")[0].value = '<iframe allowfullscreen src="' + i + '" style="border:0px #FFFFFF none;" name="Paella Player" scrolling="no" frameborder="0" marginheight="0px" marginwidth="0px" width="' + t + '" height="' + n + '"></iframe>')
        };
        for (var u = $(".embedSizeButton"), c = 0; c < u.length; c += 1) {
            u[c].onclick = function (e) {
                var t = e.target ? e.target.textContent : e.toElement.textContent;
                if (t) {
                    var n = t.split("x");
                    l.value = n[0], s.value = n[1], $("#social_embed-textarea")[0].value = '<iframe allowfullscreen src="' + i + '" style="border:0px #FFFFFF none;" name="Paella Player" scrolling="no" frameborder="0" marginheight="0px" marginwidth="0px" width="' + n[0] + '" height="' + n[1] + '"></iframe>'
                }
            }
        }
    }
}), paella.plugins.socialPlugin = new paella.plugins.SocialPlugin;
var MyTabBarExamplePlugin = Class.create(paella.TabBarPlugin, {
    getSubclass: function () {
        return "test"
    }, getTabName: function () {
        return "TabBar Example"
    }, getName: function () {
        return "es.upv.paella.test.tabBarExamplePlugin"
    }, buildContent: function (e) {
        e.innerHTML = "<p>This is a Paella Extended tab bar plugin</p>"
    }
});
new MyTabBarExamplePlugin, Class("paella.plugins.VideoLoadTestPlugin", paella.EventDrivenPlugin, {
    startTime: 0, endTime: 0, initialize: function () {
        if (this.parent(), this.startTime = Date.now(), "es" == base.dictionary.currentLanguage()) {
            var e = {"Video loaded in {0} seconds": "Video cargado en {0} segundos"};
            base.dictionary.addDictionary(e)
        }
    }, getName: function () {
        return "es.upv.paella.test.videoLoadPlugin"
    }, checkEnabled: function (e) {
        e(!0)
    }, getEvents: function () {
        return [paella.events.loadComplete]
    }, onEvent: function (e, t) {
        switch (e) {
            case paella.events.loadComplete:
                this.onLoadComplete()
        }
    }, onLoadComplete: function () {
        this.endTime = Date.now();
        var e = (this.endTime - this.startTime) / 1e3;
        this.showOverlayMessage(base.dictionary.translate("Video loaded in {0} seconds").replace(/\{0\}/g, e))
    }, showOverlayMessage: function (e) {
        var t = paella.player.videoContainer.overlayContainer, n = {left: 40, top: 50, width: 430, height: 80}, a = document.createElement("div");
        a.className = "videoLoadTestOverlay";
        var i = document.createElement("div");
        i.className = "btn", i.innerHTML = "X", i.onclick = function () {
            t.removeElement(a)
        };
        var r = document.createElement("div");
        r.className = "videoLoadTest", r.innerHTML = e, r.appendChild(i), a.appendChild(r), t.addElement(a, n)
    }
}), paella.plugins.videoLoadTestPlugin = new paella.plugins.VideoLoadTestPlugin, paella.plugins.translectures = {}, Class("paella.captions.translectures.Caption", paella.captions.Caption, {
    initialize: function (e, t, n, a, i, r) {
        this.parent(e, t, n, a, r), this._captionsProvider = "translecturesCaptionsProvider", this._editURL = i
    }, canEdit: function (e) {
        e(!1, void 0 != this._editURL && "" != this._editURL)
    }, goToEdit: function () {
        var e = this;
        paella.player.auth.userData().then(function (t) {
            1 == t.isAnonymous ? e.askForAnonymousOrLoginEdit() : e.doEdit()
        })
    }, doEdit: function () {
        window.location.href = this._editURL
    }, doLoginAndEdit: function () {
        paella.player.auth.login(this._editURL)
    }, askForAnonymousOrLoginEdit: function () {
        var e = this, t = document.createElement("div");
        t.className = "translecturesCaptionsMessageBox";
        var n = document.createElement("div");
        n.className = "title", n.innerHTML = base.dictionary.translate("You are trying to modify the transcriptions, but you are not Logged in!"), t.appendChild(n);
        var a = document.createElement("div");
        a.className = "authMethodsContainer", t.appendChild(a);
        var i = document.createElement("div");
        i.className = "authMethod", a.appendChild(i);
        var r = document.createElement("a");
        r.href = "#", r.style.color = "#004488", i.appendChild(r);
        var o = document.createElement("img");
        o.src = "resources/style/caption_mlangs_anonymous.png", o.alt = "Anonymous", o.style.height = "100px", r.appendChild(o);
        var l = document.createElement("p");
        l.innerHTML = base.dictionary.translate("Continue editing the transcriptions anonymously"), r.appendChild(l), $(r).click(function () {
            e.doEdit()
        }), i = document.createElement("div"), i.className = "authMethod", a.appendChild(i), r = document.createElement("a"), r.href = "#", r.style.color = "#004488", i.appendChild(r), o = document.createElement("img"), o.src = "resources/style/caption_mlangs_lock.png", o.alt = "Login", o.style.height = "100px", r.appendChild(o), l = document.createElement("p"), l.innerHTML = base.dictionary.translate("Log in and edit the transcriptions"), r.appendChild(l), $(r).click(function () {
            e.doLoginAndEdit()
        }), paella.messageBox.showElement(t)
    }
}), Class("paella.plugins.translectures.CaptionsPlugIn", paella.EventDrivenPlugin, {
    getName: function () {
        return "es.upv.paella.translecture.captionsPlugin"
    }, getEvents: function () {
        return []
    }, onEvent: function (e, t) {
    }, checkEnabled: function (e) {
        var t = this, n = paella.player.videoIdentifier;
        if (void 0 == this.config.tLServer || void 0 == this.config.tLdb) base.log.warning(this.getName() + " plugin not configured!"), e(!1); else {
            var a = (this.config.tLServer + "/langs?db=${tLdb}&id=${videoId}").replace(/\$\{videoId\}/gi, n).replace(/\$\{tLdb\}/gi, this.config.tLdb);
            base.ajax.get({url: a}, function (i, r, o, l) {
                0 == i.scode ? (i.langs.forEach(function (e) {
                    var a,
                        i = (t.config.tLServer + "/dfxp?format=1&pol=0&db=${tLdb}&id=${videoId}&lang=${tl.lang.code}").replace(/\$\{videoId\}/gi, n).replace(/\$\{tLdb\}/gi, t.config.tLdb).replace(/\$\{tl.lang.code\}/gi, e.code);
                    t.config.tLEdit && (a = t.config.tLEdit.replace(/\$\{videoId\}/gi, n).replace(/\$\{tLdb\}/gi, t.config.tLdb).replace(/\$\{tl.lang.code\}/gi, e.code));
                    var r = e.value;
                    switch (e.type) {
                        case 0:
                            r += " (" + paella.dictionary.translate("Auto") + ")";
                            break;
                        case 1:
                            r += " (" + paella.dictionary.translate("Under review") + ")"
                    }
                    var o = new paella.captions.translectures.Caption(e.code, "dfxp", i, {code: e.code, txt: r}, a);
                    paella.captions.addCaptions(o)
                }), e(!1)) : (base.log.debug("Error getting available captions from translectures: " + a), e(!1))
            }, function (t, n, i) {
                base.log.debug("Error getting available captions from translectures: " + a), e(!1)
            })
        }
    }
}), new paella.plugins.translectures.CaptionsPlugIn, Class("paella.plugins.ThemeChooserPlugin", paella.ButtonPlugin, {
    currentUrl: null, currentMaster: null, currentSlave: null, availableMasters: [], availableSlaves: [], getAlignment: function () {
        return "right"
    }, getSubclass: function () {
        return "themeChooserPlugin"
    }, getIndex: function () {
        return 2030
    }, getMinWindowSize: function () {
        return 600
    }, getName: function () {
        return "es.upv.paella.themeChooserPlugin"
    }, getDefaultToolTip: function () {
        return base.dictionary.translate("Change theme")
    }, getButtonType: function () {
        return paella.ButtonPlugin.type.popUpButton
    }, checkEnabled: function (e) {
        e(paella.player.config.skin && paella.player.config.skin.available && paella.player.config.skin.available instanceof Array && paella.player.config.skin.available.length > 0 ? !0 : !1)
    }, buildContent: function (e) {
        var t = this;
        paella.player.config.skin.available.forEach(function (n) {
            var a = document.createElement("div");
            a.className = "themebutton", a.innerHTML = n.replace("-", " ").replace("_", " "), $(a).click(function (e) {
                paella.utils.skin.set(n), paella.player.controls.hidePopUp(t.getName())
            }), e.appendChild(a)
        })
    }
}), paella.plugins.themeChooserPlugin = new paella.plugins.ThemeChooserPlugin, paella.plugins.TrimmingTrackPlugin = Class.create(paella.editor.MainTrackPlugin, {
    trimmingTrack: null,
    trimmingData: {s: 0, e: 0},
    getTrackItems: function () {
        null == this.trimmingTrack && (this.trimmingTrack = {
            id: 1,
            s: 0,
            e: 0
        }, this.trimmingTrack.s = paella.player.videoContainer.trimStart(), this.trimmingTrack.e = paella.player.videoContainer.trimEnd(), this.trimmingData.s = this.trimmingTrack.s, this.trimmingData.e = this.trimmingTrack.e);
        var e = [];
        return e.push(this.trimmingTrack), e
    },
    getName: function () {
        return "es.upv.paella.editor.trimmingTrackPlugin"
    },
    getTools: function () {
        if (this.config.enableResetButton) return [{
            name: "reset",
            label: base.dictionary.translate("Reset"),
            hint: base.dictionary.translate("Resets the trimming bar to the default length of the video.")
        }]
    },
    onToolSelected: function (e) {
        if (this.config.enableResetButton && "reset" == e) return this.trimmingTrack = {
            id: 1,
            s: 0,
            e: 0
        }, this.trimmingTrack.s = 0, this.trimmingTrack.e = paella.player.videoContainer.duration(!0), !0
    },
    getTrackName: function () {
        return base.dictionary.translate("Trimming")
    },
    getColor: function () {
        return "rgb(0, 51, 107)"
    },
    onSave: function (e) {
        paella.player.videoContainer.enableTrimming(), paella.player.videoContainer.setTrimmingStart(this.trimmingTrack.s), paella.player.videoContainer.setTrimmingEnd(this.trimmingTrack.e), this.trimmingData.s = this.trimmingTrack.s, this.trimmingData.e = this.trimmingTrack.e, paella.data.write("trimming", {id: paella.initDelegate.getId()}, {
            start: this.trimmingTrack.s,
            end: this.trimmingTrack.e
        }, function (t, n) {
            e(n)
        })
    },
    onDiscard: function (e) {
        this.trimmingTrack.s = this.trimmingData.s, this.trimmingTrack.e = this.trimmingData.e, e(!0)
    },
    allowDrag: function () {
        return !1
    },
    onTrackChanged: function (e, t, n) {
        playerEnd = paella.player.videoContainer.duration(!0), t = t < 0 ? 0 : t, n = n > playerEnd ? playerEnd : n, this.trimmingTrack.s = t, this.trimmingTrack.e = n, this.parent(e, t, n)
    },
    contextHelpString: function () {
        return "es" == base.dictionary.currentLanguage() ? 'Utiliza la herramienta de recorte para definir el instante inicial y el instante final de la clase. Para cambiar la duración solo hay que arrastrar el inicio o el final de la pista "Recorte", en la linea de tiempo.' : "Use this tool to define the start and finish time."
    }
}), paella.plugins.trimmingTrackPlugin = new paella.plugins.TrimmingTrackPlugin, Class("paella.plugins.TrimmingLoaderPlugin", paella.EventDrivenPlugin, {
    getName: function () {
        return "es.upv.paella.trimmingPlayerPlugin"
    }, getEvents: function () {
        return [paella.events.controlBarLoaded, paella.events.showEditor, paella.events.hideEditor]
    }, onEvent: function (e, t) {
        switch (e) {
            case paella.events.controlBarLoaded:
                this.loadTrimming();
                break;
            case paella.events.showEditor:
                paella.player.videoContainer.disableTrimming();
                break;
            case paella.events.hideEditor:
                paella.player.config.trimming && paella.player.config.trimming.enabled && paella.player.videoContainer.enableTrimming()
        }
    }, loadTrimming: function () {
        var e = paella.initDelegate.getId();
        paella.data.read("trimming", {id: e}, function (e, t) {
            if (e && t && e.end > 0) paella.player.videoContainer.setTrimming(e.start, e.end).then(function () {
                return paella.player.videoContainer.enableTrimming()
            }); else {
                var n = base.parameters.get("start"), a = base.parameters.get("end");
                n && a && paella.player.videoContainer.setTrimming(n, a).then(function () {
                    return paella.player.videoContainer.enableTrimming()
                })
            }
        })
    }
}), paella.plugins.trimmingLoaderPlugin = new paella.plugins.TrimmingLoaderPlugin, new (Class(paella.userTracking.SaverPlugIn, {
    type: "userTrackingSaverPlugIn",
    getName: function () {
        return "es.upv.paella.usertracking.elasticsearchSaverPlugin"
    },
    checkEnabled: function (e) {
        this._url = this.config.url, this._index = this.config.index || "paellaplayer", this._type = this.config.type || "usertracking";
        var t = !0;
        void 0 == this._url && (t = !1, base.log.debug("No ElasticSearch URL found in config file. Disabling ElasticSearch PlugIn")), e(t)
    },
    log: function (e, t) {
        var n = t;
        "object" != $traceurRuntime.typeof(n) && (n = {value: n}), paella.player.videoContainer.currentTime().then(function (t) {
            var a = {
                date: new Date,
                video: paella.initDelegate.getId(),
                playing: !paella.player.videoContainer.paused(),
                time: parseInt(t + paella.player.videoContainer.trimStart()),
                event: e,
                params: n
            };
            paella.ajax.post({url: this._url + "/" + this._index + "/" + this._type + "/", params: JSON.stringify(a)})
        })
    }
})), new (Class(paella.userTracking.SaverPlugIn, {
    getName: function () {
        return "es.upv.paella.usertracking.GoogleAnalyticsSaverPlugin"
    }, checkEnabled: function (e) {
        var t = this.config.trackingID, n = this.config.domain || "auto";
        t ? (base.log.debug("Google Analitycs Enabled"), function (e, t, n, a, i, r, o) {
            e.GoogleAnalyticsObject = i, e[i] = e[i] || function () {
                (e[i].q = e[i].q || []).push(arguments)
            }, e[i].l = 1 * new Date, r = t.createElement(n), o = t.getElementsByTagName(n)[0], r.async = 1, r.src = "//www.google-analytics.com/analytics.js", o.parentNode.insertBefore(r, o)
        }(window, document, "script", 0, "__gaTracker"), __gaTracker("create", t, n), __gaTracker("send", "pageview"), e(!0)) : (base.log.debug("No Google Tracking ID found in config file. Disabling Google Analitycs PlugIn"), e(!1))
    }, log: function (e, t) {
        if (void 0 === this.config.category || !0 === this.config.category) {
            var n = this.config.category || "PaellaPlayer", a = e, i = "";
            try {
                i = JSON.stringify(t)
            } catch (e) {
            }
            __gaTracker("send", "event", n, a, i)
        }
    }
})), Class("paella.Video360", paella.VideoElementBase, {
    _posterFrame: null, _currentQuality: null, _autoplay: !1, _streamName: null, initialize: function (e, t, n, a, i, r, o) {
        function l() {
            if (s.canvasController) {
                s.canvasController.canvas.domElement
            }
        }

        this.parent(e, t, "canvas", 0, 0, 1280, 720), this._streamName = o || "video360";
        var s = this;
        paella.player.videoContainer.disablePlayOnClick(), this._stream.sources[this._streamName] && this._stream.sources[this._streamName].sort(function (e, t) {
            return e.res.h - t.res.h
        }), this.video = null, new paella.Timer(function (e) {
            l()
        }, 500).repeat = !0
    }, defaultProfile: function () {
        return "chroma"
    }, _setVideoElem: function (e) {
        $(this.video).bind("progress", evtCallback), $(this.video).bind("loadstart", evtCallback), $(this.video).bind("loadedmetadata", evtCallback), $(this.video).bind("canplay", evtCallback), $(this.video).bind("oncanplay", evtCallback)
    }, _loadDeps: function () {
        return new Promise(function (e, t) {
            window.$paella_mpd ? defer.resolve(window.$paella_mpd) : require(["resources/deps/bg2e.js"], function () {
                window.$paella_bg2e = !0, e(window.$paella_bg2e)
            })
        })
    }, _deferredAction: function (e) {
        var t = this;
        return new Promise(function (n, a) {
            t.video ? n(e()) : $(t.video).bind("canplay", function () {
                t._ready = !0, n(e())
            })
        })
    }, _getQualityObject: function (e, t) {
        return {
            index: e, res: t.res, src: t.src, toString: function () {
                return this.res.w + "x" + this.res.h
            }, shortLabel: function () {
                return this.res.h + "p"
            }, compare: function (e) {
                return this.res.w * this.res.h - e.res.w * e.res.h
            }
        }
    }, getVideoData: function () {
        var e = this, t = this;
        return new Promise(function (n, a) {
            e._deferredAction(function () {
                n({
                    duration: t.video.duration,
                    currentTime: t.video.currentTime,
                    volume: t.video.volume,
                    paused: t.video.paused,
                    ended: t.video.ended,
                    res: {w: t.video.videoWidth, h: t.video.videoHeight}
                })
            })
        })
    }, setPosterFrame: function (e) {
        this._posterFrame = e
    }, setAutoplay: function (e) {
        this._autoplay = e, e && this.video && this.video.setAttribute("autoplay", e)
    }, load: function () {
        var e = this;
        return new Promise(function (t, n) {
            e._loadDeps().then(function () {
                var a = e._stream.sources[e._streamName];
                null === e._currentQuality && e._videoQualityStrategy && (e._currentQuality = e._videoQualityStrategy.getQualityIndex(a));
                var i = e._currentQuality < a.length ? a[e._currentQuality] : null;
                e.video = null, i ? (e.canvasController = null, buildVideo360Canvas(i, e.domElement).then(function (n) {
                    e.canvasController = n, e.video = n.video, e.video.pause(), t(i)
                })) : n(new Error("Could not load video: invalid quality stream index"))
            })
        })
    }, getQualities: function () {
        var e = this;
        return new Promise(function (t, n) {
            setTimeout(function () {
                var n = [], a = e._stream.sources[e._streamName], i = -1;
                a.forEach(function (t) {
                    i++, n.push(e._getQualityObject(i, t))
                }), t(n)
            }, 10)
        })
    }, setQuality: function (e) {
        var t = this;
        return new Promise(function (n) {
            var a = t.video.paused, i = t._stream.sources[t._streamName];
            t._currentQuality = e < i.length ? e : 0;
            var r = t.video.currentTime;
            t.freeze().then(function () {
                return t._ready = !1, t.load()
            }).then(function () {
                a || t.play(), $(t.video).on("seeked", function () {
                    t.unFreeze(), n(), $(t.video).off("seeked")
                }), t.video.currentTime = r
            })
        })
    }, getCurrentQuality: function () {
        var e = this;
        return new Promise(function (t) {
            t(e._getQualityObject(e._currentQuality, e._stream.sources[e._streamName][e._currentQuality]))
        })
    }, play: function () {
        var e = this;
        return this._deferredAction(function () {
            bg.app.MainLoop.singleton.updateMode = bg.app.FrameUpdate.AUTO, e.video.play()
        })
    }, pause: function () {
        var e = this;
        return this._deferredAction(function () {
            bg.app.MainLoop.singleton.updateMode = bg.app.FrameUpdate.MANUAL, e.video.pause()
        })
    }, isPaused: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.paused
        })
    }, duration: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.duration
        })
    }, setCurrentTime: function (e) {
        var t = this;
        return this._deferredAction(function () {
            t.video.currentTime = e, $(t.video).on("seeked", function () {
                t.canvasController.postRedisplay(), $(t.video).off("seeked")
            })
        })
    }, currentTime: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.currentTime
        })
    }, setVolume: function (e) {
        var t = this;
        return this._deferredAction(function () {
            t.video.volume = e
        })
    }, volume: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.volume
        })
    }, setPlaybackRate: function (e) {
        var t = this;
        return this._deferredAction(function () {
            t.video.playbackRate = e
        })
    }, playbackRate: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.playbackRate
        })
    }, goFullScreen: function () {
        var e = this;
        return this._deferredAction(function () {
            var t = e.video;
            t.requestFullscreen ? t.requestFullscreen() : t.msRequestFullscreen ? t.msRequestFullscreen() : t.mozRequestFullScreen ? t.mozRequestFullScreen() : t.webkitEnterFullscreen && t.webkitEnterFullscreen()
        })
    }, unFreeze: function () {
        var e = this;
        return this._deferredAction(function () {
            var t = document.getElementById(e.video.className + "canvas");
            $(t).remove()
        })
    }, freeze: function () {
        return this._deferredAction(function () {
        })
    }, unload: function () {
        return this._callUnloadEvent(), paella_DeferredNotImplemented()
    }, getDimensions: function () {
        return paella_DeferredNotImplemented()
    }
}), Class("paella.videoFactories.Video360Factory", {
    isStreamCompatible: function (e) {
        try {
            if (paella.ChromaVideo._loaded) return !1;
            if (paella.videoFactories.Html5VideoFactory.s_instances > 0 && base.userAgent.system.iOS) return !1;
            for (var t in e.sources) if ("video360" == t) return !0
        } catch (e) {
        }
        return !1
    }, getVideoObject: function (e, t, n) {
        return paella.ChromaVideo._loaded = !0, ++paella.videoFactories.Html5VideoFactory.s_instances, new paella.Video360(e, t, n.x, n.y, n.w, n.h)
    }
}), Class("paella.Video360Theta", paella.VideoElementBase, {
    _posterFrame: null,
    _currentQuality: null,
    _autoplay: !1,
    _streamName: null,
    initialize: function (e, t, n, a, i, r, o) {
        function l() {
            if (s.canvasController) {
                s.canvasController.canvas.domElement
            }
        }

        this.parent(e, t, "canvas", 0, 0, 1280, 720), this._streamName = o || "video360theta";
        var s = this;
        paella.player.videoContainer.disablePlayOnClick(), this._stream.sources[this._streamName] && this._stream.sources[this._streamName].sort(function (e, t) {
            return e.res.h - t.res.h
        }), this.video = null, new paella.Timer(function (e) {
            l()
        }, 500).repeat = !0
    },
    defaultProfile: function () {
        return "chroma"
    },
    _setVideoElem: function (e) {
        $(this.video).bind("progress", evtCallback), $(this.video).bind("loadstart", evtCallback), $(this.video).bind("loadedmetadata", evtCallback), $(this.video).bind("canplay", evtCallback), $(this.video).bind("oncanplay", evtCallback)
    },
    _loadDeps: function () {
        return new Promise(function (e, t) {
            window.$paella_mpd ? defer.resolve(window.$paella_mpd) : require(["resources/deps/bg2e.js"], function () {
                window.$paella_bg2e = !0, e(window.$paella_bg2e)
            })
        })
    },
    _deferredAction: function (e) {
        var t = this;
        return new Promise(function (n, a) {
            t.video ? n(e()) : $(t.video).bind("canplay", function () {
                t._ready = !0, n(e())
            })
        })
    },
    _getQualityObject: function (e, t) {
        return {
            index: e, res: t.res, src: t.src, toString: function () {
                return this.res.w + "x" + this.res.h
            }, shortLabel: function () {
                return this.res.h + "p"
            }, compare: function (e) {
                return this.res.w * this.res.h - e.res.w * e.res.h
            }
        }
    },
    getVideoData: function () {
        var e = this, t = this;
        return new Promise(function (n, a) {
            e._deferredAction(function () {
                n({
                    duration: t.video.duration,
                    currentTime: t.video.currentTime,
                    volume: t.video.volume,
                    paused: t.video.paused,
                    ended: t.video.ended,
                    res: {w: t.video.videoWidth, h: t.video.videoHeight}
                })
            })
        })
    },
    setPosterFrame: function (e) {
        this._posterFrame = e
    },
    setAutoplay: function (e) {
        this._autoplay = e, e && this.video && this.video.setAttribute("autoplay", e)
    },
    load: function () {
        var e = this;
        return new Promise(function (t, n) {
            e._loadDeps().then(function () {
                var a = e._stream.sources[e._streamName];
                null === e._currentQuality && e._videoQualityStrategy && (e._currentQuality = e._videoQualityStrategy.getQualityIndex(a));
                var i = e._currentQuality < a.length ? a[e._currentQuality] : null;
                e.video = null, i ? (e.canvasController = null, buildVideo360ThetaCanvas(i, e.domElement).then(function (n) {
                    e.canvasController = n, e.video = n.video, e.video.pause(), t(i)
                })) : n(new Error("Could not load video: invalid quality stream index"))
            })
        })
    },
    getQualities: function () {
        var e = this;
        return new Promise(function (t, n) {
            setTimeout(function () {
                var n = [], a = e._stream.sources[e._streamName], i = -1;
                a.forEach(function (t) {
                    i++, n.push(e._getQualityObject(i, t))
                }), t(n)
            }, 10)
        })
    },
    setQuality: function (e) {
        var t = this;
        return new Promise(function (n) {
            var a = t.video.paused, i = t._stream.sources[t._streamName];
            t._currentQuality = e < i.length ? e : 0;
            var r = t.video.currentTime;
            t.freeze().then(function () {
                return t._ready = !1, t.load()
            }).then(function () {
                a || t.play(), $(t.video).on("seeked", function () {
                    t.unFreeze(), n(), $(t.video).off("seeked")
                }), t.video.currentTime = r
            })
        })
    },
    getCurrentQuality: function () {
        var e = this;
        return new Promise(function (t) {
            t(e._getQualityObject(e._currentQuality, e._stream.sources[e._streamName][e._currentQuality]))
        })
    },
    play: function () {
        var e = this;
        return this._deferredAction(function () {
            bg.app.MainLoop.singleton.updateMode = bg.app.FrameUpdate.AUTO, e.video.play()
        })
    },
    pause: function () {
        var e = this;
        return this._deferredAction(function () {
            bg.app.MainLoop.singleton.updateMode = bg.app.FrameUpdate.MANUAL, e.video.pause()
        })
    },
    isPaused: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.paused
        })
    },
    duration: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.duration
        })
    },
    setCurrentTime: function (e) {
        var t = this;
        return this._deferredAction(function () {
            t.video.currentTime = e, $(t.video).on("seeked", function () {
                t.canvasController.postRedisplay(), $(t.video).off("seeked")
            })
        })
    },
    currentTime: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.currentTime
        })
    },
    setVolume: function (e) {
        var t = this;
        return this._deferredAction(function () {
            t.video.volume = e
        })
    },
    volume: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.volume
        })
    },
    setPlaybackRate: function (e) {
        var t = this;
        return this._deferredAction(function () {
            t.video.playbackRate = e
        })
    },
    playbackRate: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.playbackRate
        })
    },
    goFullScreen: function () {
        var e = this;
        return this._deferredAction(function () {
            var t = e.video;
            t.requestFullscreen ? t.requestFullscreen() : t.msRequestFullscreen ? t.msRequestFullscreen() : t.mozRequestFullScreen ? t.mozRequestFullScreen() : t.webkitEnterFullscreen && t.webkitEnterFullscreen()
        })
    },
    unFreeze: function () {
        var e = this;
        return this._deferredAction(function () {
            var t = document.getElementById(e.video.className + "canvas");
            $(t).remove()
        })
    },
    freeze: function () {
        return this._deferredAction(function () {
        })
    },
    unload: function () {
        return this._callUnloadEvent(), paella_DeferredNotImplemented()
    },
    getDimensions: function () {
        return paella_DeferredNotImplemented()
    }
}), Class("paella.videoFactories.Video360ThetaFactory", {
    isStreamCompatible: function (e) {
        try {
            if (paella.ChromaVideo._loaded) return !1;
            if (paella.videoFactories.Html5VideoFactory.s_instances > 0 && base.userAgent.system.iOS) return !1;
            for (var t in e.sources) if ("video360theta" == t) return !0
        } catch (e) {
        }
        return !1
    }, getVideoObject: function (e, t, n) {
        return paella.ChromaVideo._loaded = !0, ++paella.videoFactories.Html5VideoFactory.s_instances, new paella.Video360Theta(e, t, n.x, n.y, n.w, n.h)
    }
}), Class("paella.plugins.ViewModePlugin", paella.ButtonPlugin, {
    buttonItems: null, buttons: [], selected_button: null, active_profiles: null, getAlignment: function () {
        return "right"
    }, getSubclass: function () {
        return "showViewModeButton"
    }, getIndex: function () {
        return 540
    }, getMinWindowSize: function () {
        return 300
    }, getName: function () {
        return "es.upv.paella.viewModePlugin"
    }, getButtonType: function () {
        return paella.ButtonPlugin.type.popUpButton
    }, getDefaultToolTip: function () {
        return base.dictionary.translate("Change video layout")
    }, checkEnabled: function (e) {
        this.active_profiles = this.config.activeProfiles, e(!paella.player.videoContainer.isMonostream)
    }, closeOnMouseOut: function () {
        return !0
    }, setup: function () {
        var e = this, t = {Tab: 9, Return: 13, Esc: 27, End: 35, Home: 36, Left: 37, Up: 38, Right: 39, Down: 40};
        paella.events.bind(paella.events.setProfile, function (t, n) {
            e.onProfileChange(n.profileName)
        }), $(this.button).keyup(function (n) {
            e.isPopUpOpen() && (n.keyCode == t.Up ? e.selected_button > 0 && (e.selected_button < e.buttons.length && (e.buttons[e.selected_button].className = "viewModeItemButton " + e.buttons[e.selected_button].data.profile), e.selected_button--, e.buttons[e.selected_button].className = e.buttons[e.selected_button].className + " selected") : n.keyCode == t.Down ? e.selected_button < e.buttons.length - 1 && (e.selected_button >= 0 && (e.buttons[e.selected_button].className = "viewModeItemButton " + e.buttons[e.selected_button].data.profile), e.selected_button++, e.buttons[e.selected_button].className = e.buttons[e.selected_button].className + " selected") : n.keyCode == t.Return && e.onItemClick(e.buttons[e.selected_button], e.buttons[e.selected_button].data.profile, e.buttons[e.selected_button].data.profile))
        })
    }, buildContent: function (e) {
        var t = this;
        this.buttonItems = {}, paella.Profiles.loadProfileList(function (n) {
            Object.keys(n).forEach(function (a) {
                if (!n[a].hidden) {
                    if (t.active_profiles) {
                        var i = !1;
                        if (t.active_profiles.forEach(function (e) {
                                e == a && (i = !0)
                            }), 0 == i) return
                    }
                    var r = paella.player.videoContainer.sourceData[0].sources;
                    if (("s_p_blackboard2" != a || 0 != r.hasOwnProperty("image")) && ("chroma" != a || r.chroma)) {
                        var o = n[a], l = t.getProfileItemButton(a, o);
                        t.buttonItems[a] = l, e.appendChild(l), t.buttons.push(l), paella.player.selectedProfile == a && (t.buttonItems[a].className = t.getButtonItemClass(a, !0))
                    }
                }
            }), t.selected_button = t.buttons.length
        })
    }, getProfileItemButton: function (e, t) {
        var n = document.createElement("div");
        return n.className = this.getButtonItemClass(e, !1), n.id = e + "_button", n.data = {profile: e, profileData: t, plugin: this}, $(n).click(function (e) {
            this.data.plugin.onItemClick(this, this.data.profile, this.data.profileData)
        }), n
    }, onProfileChange: function (e) {
        var t = this, n = this.buttonItems[e], a = this.buttonItems;
        Object.keys(a).forEach(function (e) {
            t.buttonItems[e].className = t.getButtonItemClass(e, !1)
        }), n && (n.className = t.getButtonItemClass(e, !0))
    }, onItemClick: function (e, t, n) {
        this.buttonItems[t] && paella.player.setProfile(t), paella.player.controls.hidePopUp(this.getName())
    }, getButtonItemClass: function (e, t) {
        return "viewModeItemButton " + e + (t ? " selected" : "")
    }
}), paella.plugins.viewModePlugin = new paella.plugins.ViewModePlugin, paella.dataDelegates.VisualAnnotationsDataDelegate = Class.create(paella.DataDelegate, {
    read: function (e, t, n) {
        $.getJSON(t.url + t.id + "/annotations", function (e) {
            "function" == typeof n && n(e, !0)
        })
    }
}), Class("paella.plugins.visualAnnotationPlugin", paella.EventDrivenPlugin, {
    _annotations: null,
    _paused: null,
    _rootElement: null,
    _prevProfile: null,
    checkEnabled: function (e) {
        e(!0)
    },
    getName: function () {
        return "es.upv.paella.visualAnnotationPlugin"
    },
    getEvents: function () {
        return [paella.events.timeUpdate]
    },
    setup: function () {
        var e = this;
        paella.data.read("visualAnnotations", {id: paella.initDelegate.getId(), url: e.config.url}, function (t, n) {
            e._annotations = Array.isArray(t) ? t : []
        }), e._prevProfile = null
    },
    onEvent: function (e, t) {
        switch (e) {
            case paella.events.timeUpdate:
                this.drawAnnotation(e, t)
        }
    },
    drawAnnotation: function (e, t) {
        var n = this, a = {};
        a.closeButton = !0, a.onClose = function () {
            paella.events.trigger(paella.events.play)
        }, n._annotations && n._annotations.some(function (e, a, i) {
            var r = Math.round(t.currentTime), o = JSON.parse(e.content);
            if (r >= e.time && r < e.time + e.duration && 0 == $("#" + e._id).length) {
                var l = paella.player.videoContainer.overlayContainer.getLayer(e.type);
                o.format;
                n._rootElement = document.createElement("div"), n._rootElement.className = e.type + "textAnnotation", n._rootElement.id = e._id;
                var s = document.createElement("div");
                s.className = "annotationClose righttop", s.innerHTML = "X", s.onclick = function () {
                    $("#" + e._id).css({display: "none"})
                };
                var u = document.createElement("div");
                u.className = "innerAnnotation";
                for (var c in o.data) break;
                "AD" == e.type ? u.innerHTML = '<div class="AdtextAnnotationLink" ><img src="./resources/images/popup.png" class="AdtextAnnotationIMG"></div>  <div class="AdtextAnnotationBody">' + o.data[navigator.language || navigator.userLanguage] || o.data[c] + "</div></div>" : u.innerHTML = o.data[navigator.language || navigator.userLanguage] || o.data[c], "" != o.profile && (null == n._prevProfile && (n._prevProfile = paella.plugins.viewModePlugin.active_profiles || paella.Profiles.getDefaultProfile()), paella.player.setProfile(o.profile)), u.appendChild(s);
                var d = document.createElement("style");
                return d.innerHTML = o.style, u.appendChild(d), n._rootElement.appendChild(u), l.appendChild(n._rootElement), !0
            }
            if ((r < e.time || r > e.time + e.duration) && 0 != $("#" + e._id).length) {
                if (1 == o.pauser && n._paused != e._id) n._paused = e._id, paella.player.pause(); else {
                    var p = !0;
                    paella.player.paused().then(function (e) {
                        p = e
                    }), p || (n._paused = null, n.closeAnnotation(e, !1))
                }
                return !0
            }
        })
    },
    closeAnnotation: function (e, t) {
        paella.player.setProfile(this._prevProfile), this._prevProfile = null, $("#" + e._id).remove()
    }
}), new paella.plugins.visualAnnotationPlugin, Class("paella.plugins.VolumeRangePlugin", paella.ButtonPlugin, {
    getAlignment: function () {
        return "left"
    },
    getSubclass: function () {
        return "volumeRangeButton"
    },
    getName: function () {
        return "es.upv.paella.volumeRangePlugin"
    },
    getButtonType: function () {
        return paella.ButtonPlugin.type.popUpButton
    },
    getDefaultToolTip: function () {
        return base.dictionary.translate("Volume")
    },
    getIndex: function () {
        return 120
    },
    _showMasterVolume: null,
    _showSlaveVolume: null,
    _tempMasterVolume: 0,
    _tempSlaveVolume: 0,
    _inputMaster: null,
    _inputSlave: null,
    _control_NotMyselfEvent: !0,
    _storedValue: !1,
    closeOnMouseOut: function () {
        return !0
    },
    checkEnabled: function (e) {
        var t = !1;
        base.userAgent.browser.IsMobileVersion || (this._showMasterVolume = void 0 === this.config.showMasterVolume || this.config.showMasterVolume, this._showSlaveVolume = void 0 !== this.config.showSlaveVolume && !paella.player.videoContainer.isMonostream && this.config.showSlaveVolume, (this._showMasterVolume || this._showSlaveVolume) && (t = !0)), e(t)
    },
    setup: function () {
        var e = this;
        paella.events.bind(paella.events.videoUnloaded, function (t, n) {
            e.storeVolume()
        }), paella.events.bind(paella.events.singleVideoReady, function (t, n) {
            e.loadStoredVolume(n)
        }), paella.events.bind(paella.events.setVolume, function (t, n) {
            e.updateVolumeOnEvent(n)
        })
    },
    updateVolumeOnEvent: function (e) {
        var t = this;
        t._control_NotMyselfEvent ? (t._inputMaster && (t._inputMaster.value = e.master), t._inputSlave && (t._inputSlave.value = e.slave)) : t._control_NotMyselfEvent = !0
    },
    storeVolume: function () {
        var e = this;
        paella.player.videoContainer.masterVideo().volume().then(function (t) {
            return e._tempMasterVolume = t, paella.player.videoContainer.slaveVideo() ? paella.player.videoContainer.slaveVideo().volume() : 0
        }).then(function (t) {
            e._tempSlaveVolume = t, e._storedValue = !0
        })
    },
    loadStoredVolume: function (e) {
        0 == this._storedValue && this.storeVolume(), ("playerContainer_videoContainer_1" == e.sender.identifier && this._tempSlaveVolume || this._tempMasterVolume) && paella.player.videoContainer.setVolume({
            master: this._tempMasterVolume,
            slave: this._tempSlaveVolume
        }), this._storedValue = !1
    },
    buildContent: function (e) {
        var t = this, n = this, a = document.createElement("div");
        if (a.className = "videoRangeContainer", this._showMasterVolume) {
            var i = function () {
                var e = $(l).val(), t = paella.player.videoContainer.slaveVideo(), a = 0;
                t ? t.volume().then(function (t) {
                    a = t, n._control_NotMyselfEvent = !1, paella.player.videoContainer.setVolume({master: e, slave: a})
                }) : (n._control_NotMyselfEvent = !1, paella.player.videoContainer.setVolume({master: e, slave: a}))
            }, r = document.createElement("div");
            r.className = "range";
            var o = document.createElement("div");
            o.className = "image master";
            var l = document.createElement("input");
            n._inputMaster = l, l.type = "range", l.min = 0, l.max = 1, l.step = .01, paella.player.videoContainer.masterVideo().volume().then(function (e) {
                l.value = e
            }), $(l).bind("input", function (e) {
                i()
            }), $(l).change(function () {
                i()
            }), r.appendChild(o), r.appendChild(l), a.appendChild(r)
        }
        if (!paella.player.videoContainer.isMonostream && this._showSlaveVolume) {
            var s = document.createElement("div");
            s.className = "range";
            var u = document.createElement("div");
            u.className = "image slave";
            var c = document.createElement("input");
            this._inputSlave = c, c.type = "range", c.min = 0, c.max = 1, c.step = .01, paella.player.videoContainer.slaveVideo() && paella.player.videoContainer.slaveVideo().volume().then(function (e) {
                c.value = e
            });
            var d = function () {
                var e = paella.player.videoContainer.masterVideo(), t = $(c).val();
                e ? e.volume().then(function (e) {
                    n._control_NotMyselfEvent = !1, paella.player.videoContainer.setVolume({master: e, slave: t})
                }) : (n._control_NotMyselfEvent = !1, paella.player.videoContainer.setVolume({master: 0, slave: t}))
            };
            $(c).bind("input", function (e) {
                d()
            }), $(c).change(function () {
                d()
            }), s.appendChild(u), s.appendChild(c), a.appendChild(s)
        }
        paella.events.bind(paella.events.setVolume, function (e, n) {
            t._showMasterVolume && (l.value = n.master), !paella.player.videoContainer.isMonostream && t._showMasterVolume && t._inputSlave && (t._inputSlave.value = n.slave), t.updateClass()
        }), e.appendChild(a), n.updateClass()
    },
    getSlaveVolume: function () {
        var e = paella.player.videoContainer.slaveVideo();
        return e ? e.volume() : 0
    },
    updateClass: function () {
        var e = "", t = this;
        if (this._showMasterVolume && this._showSlaveVolume) e = "med", this.button.className = ["buttonPlugin", this.getAlignment(), this.getSubclass(), e].join(" "); else {
            var n;
            this._showMasterVolume && (n = paella.player.videoContainer.masterVideo().volume()), this._showSlaveVolume && (n = paella.player.videoContainer.slaveVideo().volume()), n.then(function (n) {
                e = void 0 === n ? "med" : 0 == n ? "mute" : n < .33 ? "min" : n < .66 ? "med" : "max", t.button.className = ["buttonPlugin", t.getAlignment(), t.getSubclass(), e].join(" ")
            })
        }
    }
}), paella.plugins.volumeRangePlugin = new paella.plugins.VolumeRangePlugin, Class("paella.videoFactories.WebmVideoFactory", {
    webmCapable: function () {
        var e = document.createElement("video");
        return !!e.canPlayType && "" !== e.canPlayType('video/webm; codecs="vp8, vorbis"')
    }, isStreamCompatible: function (e) {
        try {
            if (!this.webmCapable()) return !1;
            for (var t in e.sources) if ("webm" == t) return !0
        } catch (e) {
        }
        return !1
    }, getVideoObject: function (e, t, n) {
        return new paella.Html5Video(e, t, n.x, n.y, n.w, n.h, "webm")
    }
}), Class("paella.plugins.WindowTitlePlugin", paella.EventDrivenPlugin, {
    _initDone: !1, getName: function () {
        return "es.upv.paella.windowTitlePlugin"
    }, checkEnabled: function (e) {
        var t = this;
        paella.player.videoContainer.masterVideo().duration().then(function (e) {
            t.loadTitle()
        }), e(!0)
    }, loadTitle: function () {
        var e = paella.player.videoLoader.getMetadata() && paella.player.videoLoader.getMetadata().title;
        document.title = e || document.title, this._initDone = !0
    }
}), paella.plugins.windowTitlePlugin = new paella.plugins.WindowTitlePlugin, Class("paella.YoutubeVideo", paella.VideoElementBase, {
    _posterFrame: null, _currentQuality: null, _autoplay: !1, _readyPromise: null, initialize: function (e, t, n, a, i, r) {
        this.parent(e, t, "div", n, a, i, r);
        var o = this;
        this._readyPromise = $.Deferred(), Object.defineProperty(this, "video", {
            get: function () {
                return o._youtubePlayer
            }
        })
    }, _deferredAction: function (e) {
        var t = this;
        return new Promise(function (n, a) {
            t._readyPromise.then(function () {
                n(e())
            }, function () {
                a()
            })
        })
    }, _getQualityObject: function (e, t) {
        var n = 0;
        switch (t) {
            case"small":
                n = 1;
                break;
            case"medium":
                n = 2;
                break;
            case"large":
                n = 3;
                break;
            case"hd720":
                n = 4;
                break;
            case"hd1080":
                n = 5;
                break;
            case"highres":
                n = 6
        }
        return {
            index: e, res: {w: null, h: null}, src: null, label: t, level: n, bitrate: n, toString: function () {
                return this.label
            }, shortLabel: function () {
                return this.label
            }, compare: function (e) {
                return this.level - e.level
            }
        }
    }, _onStateChanged: function (e) {
        console.log("On state changed")
    }, getVideoData: function () {
        var e = this, t = this;
        return new Promise(function (n, a) {
            var i = e._stream.sources.youtube[0];
            e._deferredAction(function () {
                var e = {
                    duration: t.video.getDuration(),
                    currentTime: t.video.getCurrentTime(),
                    volume: t.video.getVolume(),
                    paused: !t._playing,
                    ended: t.video.ended,
                    res: {w: i.res.w, h: i.res.h}
                };
                n(e)
            })
        })
    }, setPosterFrame: function (e) {
        this._posterFrame = e
    }, setAutoplay: function (e) {
        this._autoplay = e
    }, setRect: function (e, t) {
        this._rect = JSON.parse(JSON.stringify(e));
        var n = new paella.RelativeVideoSize, a = n.percentVSize(e.top) + "%", i = n.percentWSize(e.left) + "%", r = n.percentWSize(e.width) + "%",
            o = n.percentVSize(e.height) + "%", l = {top: a, left: i, width: r, height: o, position: "absolute"};
        if (t) {
            this.disableClassName();
            var s = this;
            $("#" + this.identifier).animate(l, 400, function () {
                s.enableClassName(), paella.events.trigger(paella.events.setComposition, {video: s})
            }), this.enableClassNameAfter(400)
        } else $("#" + this.identifier).css(l), paella.events.trigger(paella.events.setComposition, {video: this})
    }, setVisible: function (e, t) {
        "true" == e && t ? ($("#" + this.identifier).show(), $("#" + this.identifier).animate({opacity: 1}, 300)) : "true" != e || t ? "false" == e && t ? $("#" + this.identifier).animate({opacity: 0}, 300) : "false" != e || t || $("#" + this.identifier).hide() : $("#" + this.identifier).show()
    }, setLayer: function (e) {
        $("#" + this.identifier).css({zIndex: e})
    }, load: function () {
        var e = this, t = this;
        return new Promise(function (n, a) {
            e._qualityListReadyPromise = $.Deferred(), paella.youtubePlayerVars.apiReadyPromise.then(function () {
                var i = e._stream.sources.youtube[0];
                i ? (e._youtubePlayer = new YT.Player(t.identifier, {
                    height: "390",
                    width: "640",
                    videoId: i.id,
                    playerVars: {controls: 0, disablekb: 1},
                    events: {
                        onReady: function (e) {
                            t._readyPromise.resolve()
                        }, onStateChanged: function (e) {
                            console.log("state changed")
                        }, onPlayerStateChange: function (e) {
                            console.log("state changed")
                        }
                    }
                }), n()) : a(new Error("Could not load video: invalid quality stream index"))
            })
        })
    }, getQualities: function () {
        var e = this;
        return new Promise(function (t, n) {
            e._qualityListReadyPromise.then(function (n) {
                var a = [], i = -1;
                e._qualities = {}, n.forEach(function (t) {
                    i++, e._qualities[t] = e._getQualityObject(i, t), a.push(e._qualities[t])
                }), t(a)
            })
        })
    }, setQuality: function (e) {
        var t = this;
        return new Promise(function (n, a) {
            t._qualityListReadyPromise.then(function (a) {
                for (var i in t._qualities) {
                    var r = t._qualities[i];
                    if ("object" == $traceurRuntime.typeof(r) && r.index == e) {
                        t.video.setPlaybackQuality(r.label);
                        break
                    }
                }
                n()
            })
        })
    }, getCurrentQuality: function () {
        var e = this;
        return new Promise(function (t, n) {
            e._qualityListReadyPromise.then(function (n) {
                t(e._qualities[e.video.getPlaybackQuality()])
            })
        })
    }, play: function () {
        var e = this, t = this;
        return new Promise(function (n, a) {
            t._playing = !0, t.video.playVideo(), new base.Timer(function (t) {
                var a = e.video.getAvailableQualityLevels();
                a.length ? (t.repeat = !1, e._qualityListReadyPromise.resolve(a), n()) : t.repeat = !0
            }, 500)
        })
    }, pause: function () {
        var e = this;
        return this._deferredAction(function () {
            e._playing = !1, e.video.pauseVideo()
        })
    }, isPaused: function () {
        var e = this;
        return this._deferredAction(function () {
            return !e._playing
        })
    }, duration: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.getDuration()
        })
    }, setCurrentTime: function (e) {
        var t = this;
        return this._deferredAction(function () {
            t.video.seekTo(e)
        })
    }, currentTime: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.getCurrentTime()
        })
    }, setVolume: function (e) {
        var t = this;
        return this._deferredAction(function () {
            t.video.setVolume && t.video.setVolume(100 * e)
        })
    }, volume: function () {
        var e = this
        ;
        return this._deferredAction(function () {
            return e.video.getVolume() / 100
        })
    }, setPlaybackRate: function (e) {
        var t = this;
        return this._deferredAction(function () {
            t.video.playbackRate = e
        })
    }, playbackRate: function () {
        var e = this;
        return this._deferredAction(function () {
            return e.video.playbackRate
        })
    }, goFullScreen: function () {
        var e = this;
        return this._deferredAction(function () {
            var t = e.video;
            t.requestFullscreen ? t.requestFullscreen() : t.msRequestFullscreen ? t.msRequestFullscreen() : t.mozRequestFullScreen ? t.mozRequestFullScreen() : t.webkitEnterFullscreen && t.webkitEnterFullscreen()
        })
    }, unFreeze: function () {
        var e = this;
        return this._deferredAction(function () {
            var t = document.getElementById(e.video.className + "canvas");
            $(t).remove()
        })
    }, freeze: function () {
        var e = this;
        return this._deferredAction(function () {
            var t = document.createElement("canvas");
            t.id = e.video.className + "canvas", t.width = e.video.videoWidth, t.height = e.video.videoHeight, t.style.cssText = e.video.style.cssText, t.style.zIndex = 2, t.getContext("2d").drawImage(e.video, 0, 0, 16 * Math.ceil(t.width / 16), 16 * Math.ceil(t.height / 16)), e.video.parentElement.appendChild(t)
        })
    }, unload: function () {
        return this._callUnloadEvent(), paella_DeferredNotImplemented()
    }, getDimensions: function () {
        return paella_DeferredNotImplemented()
    }
}), Class("paella.videoFactories.YoutubeVideoFactory", {
    initYoutubeApi: function () {
        if (!this._initialized) {
            var e = document.createElement("script");
            e.src = "https://www.youtube.com/iframe_api";
            var t = document.getElementsByTagName("script")[0];
            t.parentNode.insertBefore(e, t), paella.youtubePlayerVars = {apiReadyPromise: new $.Deferred}, this._initialized = !0
        }
    }, isStreamCompatible: function (e) {
        try {
            for (var t in e.sources) if ("youtube" == t) return !0
        } catch (e) {
        }
        return !1
    }, getVideoObject: function (e, t, n) {
        return this.initYoutubeApi(), new paella.YoutubeVideo(e, t, n.x, n.y, n.w, n.h)
    }
}), Class("paella.ZoomPlugin", paella.EventDrivenPlugin, {
    _zImages: null,
    _imageNumber: null,
    _isActivated: !1,
    _isCreated: !1,
    _keys: null,
    _ant: null,
    _next: null,
    _videoLength: null,
    _compChanged: !1,
    _restartPlugin: !1,
    _actualImage: null,
    _zoomIncr: null,
    _maxZoom: null,
    _minZoom: null,
    _dragMode: !1,
    _mouseDownPosition: null,
    getIndex: function () {
        return 20
    },
    getAlignment: function () {
        return "right"
    },
    getSubclass: function () {
        return "zoomButton"
    },
    getDefaultToolTip: function () {
        return base.dictionary.translate("Zoom")
    },
    getEvents: function () {
        return [paella.events.timeUpdate, paella.events.setComposition, paella.events.loadPlugins, paella.events.play]
    },
    onEvent: function (e, t) {
        switch (e) {
            case paella.events.timeUpdate:
                this.imageUpdate(e, t);
                break;
            case paella.events.setComposition:
                this.compositionChanged(e, t);
                break;
            case paella.events.loadPlugins:
                this.loadPlugin(e, t);
                break;
            case paella.events.play:
                this.exitPhotoMode()
        }
    },
    checkEnabled: function (e) {
        if (paella.player.videoContainer.sourceData.length < 2) return void e(!1);
        e(!!paella.player.videoContainer.sourceData[0].sources.hasOwnProperty("image"))
    },
    setupIcons: function () {
        var e = this, t = $(".zoomFrame").width(), n = document.createElement("div");
        n.className = "arrowsLeft", n.style.display = "none";
        var a = document.createElement("div");
        a.className = "arrowsRight", a.style.display = "none", a.style.left = t - 24 + "px", $(n).click(function () {
            e.arrowCallLeft(), event.stopPropagation()
        }), $(a).click(function () {
            e.arrowCallRight(), event.stopPropagation()
        });
        var i = document.createElement("div");
        i.className = "iconsFrame";
        var r = document.createElement("button");
        r.className = "zoomActionButton buttonZoomIn", r.style.display = "none";
        var o = document.createElement("button");
        o.className = "zoomActionButton buttonZoomOut", o.style.display = "none";
        var l = document.createElement("button");
        l.className = "zoomActionButton buttonSnapshot", l.style.display = "none";
        var s = document.createElement("button");
        s.className = "zoomActionButton buttonZoomOn", $(i).append(s), $(i).append(l), $(i).append(r), $(i).append(o), $(".newframe").append(i), $(".newframe").append(n), $(".newframe").append(a), $(s).click(function () {
            e._isActivated ? (e.exitPhotoMode(), $(".zoomActionButton.buttonZoomOn").removeClass("clicked")) : (e.enterPhotoMode(), $(".zoomActionButton.buttonZoomOn").addClass("clicked")), event.stopPropagation()
        }), $(l).click(function () {
            null != e._actualImage && window.open(e._actualImage, "_blank"), event.stopPropagation()
        }), $(r).click(function () {
            e.zoomIn(), event.stopPropagation()
        }), $(o).click(function () {
            e.zoomOut(), event.stopPropagation()
        })
    },
    enterPhotoMode: function () {
        var e = this;
        $(".zoomFrame").show(), $(".zoomFrame").css("opacity", "1"), this._isActivated = !0, $(".buttonSnapshot").show(), $(".buttonZoomOut").show(), $(".buttonZoomIn").show(), $(".arrowsRight").show(), $(".arrowsLeft").show(), paella.player.pause(), e._imageNumber <= 1 ? $(".arrowsLeft").hide() : this._isActivated && $(".arrowsLeft").show(), e._imageNumber >= e._keys.length - 2 ? $(".arrowsRight").hide() : this._isActivated && $(".arrowsRight").show()
    },
    exitPhotoMode: function () {
        $(".zoomFrame").hide(), this._isActivated = !1, $(".buttonSnapshot").hide(), $(".buttonZoomOut").hide(), $(".buttonZoomIn").hide(), $(".arrowsRight").hide(), $(".arrowsLeft").hide(), $(".zoomActionButton.buttonZoomOn").removeClass("clicked")
    },
    setup: function () {
        var e = this;
        e._maxZoom = e.config.maxZoom || 500, e._minZoom = e.config.minZoom || 100, e._zoomIncr = e.config.zoomIncr || 10, this._zImages = {}, this._zImages = paella.player.videoContainer.sourceData[0].sources.image[0].frames, this._videoLength = paella.player.videoContainer.sourceData[0].sources.image[0].duration, this._keys = Object.keys(this._zImages), this._keys = this._keys.sort(function (e, t) {
            return e = e.slice(6), t = t.slice(6), parseInt(e) - parseInt(t)
        }), this._next = 0, this._ant = 0
    },
    loadPlugin: function () {
        var e = this;
        0 == e._isCreated && (e.createOverlay(), e.setupIcons(), $(".zoomFrame").hide(), e._isActivated = !1, e._isCreated = !0)
    },
    imageUpdate: function (e, t) {
        var n = this, a = Math.round(t.currentTime), i = $(".zoomFrame").css("background-image");
        if ($(".newframe").length > 0) {
            if (this._zImages.hasOwnProperty("frame_" + a)) {
                if (i == this._zImages["frame_" + a]) return;
                i = this._zImages["frame_" + a]
            } else {
                if (!(a > this._next || a < this._ant || n._compChanged)) return;
                n._compChanged && (n._compChanged = !1), i = n.returnSrc(a)
            }
            $("#photo_01").attr("src", i).load();
            var r = new Image;
            r.onload = function () {
                $(".zoomFrame").css("background-image", "url(" + i + ")")
            }, r.src = i, n._actualImage = i, n._imageNumber <= 1 ? $(".arrowsLeft").hide() : this._isActivated && $(".arrowsLeft").show(), n._imageNumber >= n._keys.length - 2 ? $(".arrowsRight").hide() : this._isActivated && $(".arrowsRight").show()
        }
    },
    returnSrc: function (e) {
        var t = 0;
        for (i = 0; i < this._keys.length; i++) {
            var n = parseInt(this._keys[i].slice(6)), a = parseInt(this._keys[this._keys.length - 1].slice(6));
            if (e < n) return this._next = n, this._ant = t, this._imageNumber = i - 1, this._zImages["frame_" + t];
            if (e > a && e < this._videoLength) return this._next = this._videoLength, this._ant = a, this._zImages["frame_" + t];
            t = n
        }
    },
    arrowCallLeft: function () {
        var e = this;
        if (e._imageNumber - 1 >= 0) {
            var t = e._keys[e._imageNumber - 1];
            e._imageNumber -= 1, paella.player.videoContainer.seekToTime(parseInt(t.slice(6)))
        }
    },
    arrowCallRight: function () {
        var e = this;
        if (e._imageNumber + 1 <= e._keys.length) {
            var t = e._keys[e._imageNumber + 1];
            e._imageNumber += 1, paella.player.videoContainer.seekToTime(parseInt(t.slice(6)))
        }
    },
    createOverlay: function () {
        var e = this, t = document.createElement("div");
        t.className = "newframe", overlayContainer = paella.player.videoContainer.overlayContainer, overlayContainer.addElement(t, overlayContainer.getMasterRect());
        var n = document.createElement("div");
        n.className = "zoomFrame", t.insertBefore(n, t.firstChild), $(n).click(function (e) {
            e.stopPropagation()
        }), $(n).bind("mousewheel", function (t) {
            t.originalEvent.wheelDelta / 120 > 0 ? e.zoomIn() : e.zoomOut()
        }), $(n).mousedown(function (t) {
            e.mouseDown(t.clientX, t.clientY)
        }), $(n).mouseup(function (t) {
            e.mouseUp()
        }), $(n).mouseleave(function (t) {
            e.mouseLeave()
        }), $(n).mousemove(function (t) {
            e.mouseMove(t.clientX, t.clientY)
        })
    },
    mouseDown: function (e, t) {
        this._dragMode = !0, this._mouseDownPosition = {x: e, y: t}
    },
    mouseUp: function () {
        this._dragMode = !1
    },
    mouseLeave: function () {
        this._dragMode = !1
    },
    mouseMove: function (e, t) {
        if (this._dragMode) {
            var n = ($(".zoomFrame")[0], this._backgroundPosition ? this._backgroundPosition : {left: 0, top: 0}),
                a = ($(".zoomFrame").width(), $(".zoomFrame").height(), this._mouseDownPosition.x - e), i = this._mouseDownPosition.y - t, r = n.left + a, o = n.top + i;
            r = r >= 0 ? r : 0, r = r <= 100 ? r : 100, o = o >= 0 ? o : 0, o = o <= 100 ? o : 100, $(".zoomFrame").css("background-position", r + "% " + o + "%"), this._backgroundPosition = {
                left: r,
                top: o
            }, this._mouseDownPosition.x = e, this._mouseDownPosition.y = t
        }
    },
    zoomIn: function () {
        var e = this;
        z = $(".zoomFrame").css("background-size"), z = z.split(" "), z = parseInt(z[0]), z < e._maxZoom && $(".zoomFrame").css("background-size", z + e._zoomIncr + "% auto")
    },
    zoomOut: function () {
        var e = this;
        z = $(".zoomFrame").css("background-size"), z = z.split(" "), z = parseInt(z[0]), z > e._minZoom && $(".zoomFrame").css("background-size", z - e._zoomIncr + "% auto")
    },
    imageUpdateOnPause: function (e) {
        var t = this, n = Math.round(e), a = $(".zoomFrame").css("background-image");
        if ($(".newframe").length > 0 && a != t._actualImage) {
            if (this._zImages.hasOwnProperty("frame_" + n)) {
                if (a == this._zImages["frame_" + n]) return;
                a = this._zImages["frame_" + n]
            } else t._compChanged && (t._compChanged = !1), a = t.returnSrc(n);
            $("#photo_01").attr("src", a).load();
            var i = new Image;
            i.onload = function () {
                $(".zoomFrame").css("background-image", "url(" + a + ")")
            }, i.src = a, t._actualImage = a
        }
    },
    compositionChanged: function (e, t) {
        var n = this;
        $(".newframe").remove(), n._isCreated = !1, paella.player.videoContainer.getMasterVideoRect().visible && (n.loadPlugin(), paella.player.paused() && paella.player.videoContainer.currentTime().then(function (e) {
            n.imageUpdateOnPause(e)
        })), n._compChanged = !0
    },
    getName: function () {
        return "es.upv.paella.zoomPlugin"
    }
}), paella.plugins.zoomPlugin = new paella.ZoomPlugin;