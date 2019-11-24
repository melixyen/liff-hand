// LIFF hand ver 1.0
// Use search parameter "hashpath" for save real hash value.
// Example LIFF web app url trans
// http://example.com/myliff.php?start=1&end=5#/add
// to
// line://app/1234567890-abcd9876?start=1&end=5&hashpath=%23%2Fadd
//
// Use script tag src to include this js after liff sdk.js and when you initial liff done, call liff.$hashpath.changeHash() to replace location.hash

(function(){

    var storeA = {
        liffId: '',
        os: '',
        redirectUri: ''
    };
    var GetP = (function(){
        var s = location.search, aryParam, tmpParam, rt = {};
        if(s.indexOf('?')!=-1){
            aryParam = s.split('?')[1].split('&');
            aryParam.map(function(tmpA){
                tmpParam = tmpA.split('=');
                rt[tmpParam[0]] = decodeURIComponent(tmpParam[1]);
            });
        }
        return rt;
    })();

    if(!window.liff){
        console.log("No window.liff detected or you need load this file after liff sdk.js cdn.");
        alert('No window.liff detected.');
        return false;
    }

    var hand = {
        liff_hash: location.hash,
        store: storeA,
        profile: {},
        data: {},
        isInWeb: false,
        path: GetP['hashpath'],
        delay: GetP['liffhanddelay'],//Delay time (ms) to run changeHash
        debug: !!(GetP['liffhanddebug'])
    }

    hand.changeHash = function(){
        if(!hand.path) return false;
        hand.delay = parseInt(hand.delay);
        if(isNaN(hand.delay)){
            hand.delay = 0;
            if(hand.debug) console.log("Your delay is not a number so liffhand will set value as 0.")
        }
        if(hand.delay){
            setTimeout(function(){
                location.hash = hand.path;
            }, hand.delay);
        }else{
            location.hash = hand.path;
        }
    }

    hand.getProfile = function(cbFn){
        liff.getProfile().then(function(c){
            hand.profile = c;
            if(typeof(cbFn)=='function') cbFn(c);
        }).catch(function(c){
            if(typeof(cbFn)=='function') cbFn(c);
        })
    }
    hand.getLSToken = function(){
        return localStorage.getItem('LIFF_STORE:' + storeA.liffId + ':accessToken');
    }
    hand.removeLSToken = function(){
        localStorage.removeItem('LIFF_STORE:' + storeA.liffId + ':accessToken');
    }
    hand.getWebURL = function(){
        var searchAry = [];
        for(var k in GetP){
            if(!/^code$|^liffClientId$|^liffRedirectUri$|^state$/.test(k)){
                searchAry.push(k + '=' + encodeURIComponent(GetP[k]));
            }
        }
        var searchStr = searchAry.join('&');
        if(searchStr!='') searchStr = '?' + searchStr;
        return location.protocol + '//' + location.host + location.pathname + searchStr + location.hash;
    }

    hand.makeURL = function(url){
        var urlState = {search:/\?/.test(url), hash:/\#/.test(url)}
        var objA = {path:'', search:'', hash:''}
        var tmpA, link = '';
        if(urlState.search){
            objA.path = url.split('?')[0];
            tmpA = url.split('?')[1];
            if(urlState.hash){
                objA.search = '?' + tmpA.split('#')[0];
                objA.hash = '#' + tmpA.split('#')[1];
            }else{
                objA.search = '?' + tmpA;
            }
        }else{
            objA.path = url.split('#')[0];
            if(urlState.hash){
                objA.hash = '#' + url.split('#')[1]
            }
        }

        if(!urlState.hash){ //沒有 hash，直接附加就好
            link = url + hand.liff_hash;
        }else{
            if(urlState.search){//有 search，加在最後
                tmpA = objA.search + '&hashpath=' + encodeURIComponent(objA.hash);
            }else{
                tmpA = '?hashpath=' + encodeURIComponent(objA.hash);
            }
            link = objA.path + tmpA + hand.liff_hash;
        }

        return {
            state: urlState,
            data: objA,
            original: url,
            url: link
        }
    }

    hand.goto = function(url){
        location.href = hand.makeURL(url).url;
    }

    hand.login = function(){
        var cfg = arguments[0] || {redirectUri: hand.getWebURL()}
        window.liff.login(cfg);
    }
    
    hand.regData = function(cfg){
        if(typeof(cfg)=='object'){
            for(var k in cfg){
                storeA[k] = cfg[k];
            }
        }
    }

    hand.initAll = function(successFn, errorFn, liffCfg, regesterConfig){//初始化完並取回 profile 才 callback，用第三參數判斷是 V1 或 V2
        if(typeof(liffCfg)=='undefined'){// V1
            liff.init(function(data){
                hand.data = data;
                var initThis = this;
                var r = arguments;
                hand.getProfile(function(pFile){
                    hand.profile = pFile;
                    if(typeof(successFn)=='function'){
                        successFn.apply(initThis, r);
                    }
                })
                hand.isInWeb = !!(liff.getOS()=='web');
            }, function(){
                if(typeof(errorFn)=='function') successFn.apply(this, arguments);
            })
        }else{//V2
            if(typeof(liffCfg)=='string'){
                liffCfg = { liffId: liffCfg }
            }
            storeA.liffId = liffCfg.liffId;
            storeA.os = liff.getOS();
            hand.regData(regesterConfig);
            if(storeA.os=='web' && !GetP['code'] && !hand.getLSToken() && !GetP['liffClientId'] && (storeA.autoLogin || GetP['liffHandAutoLogin'])){//By PC, before login
                liff.init(liffCfg, function(data){
                    hand.login();
                });
            }else{
                liff.init(liffCfg, function(data){
                    hand.data = data;
                    var initThis = this;
                    var r = arguments;
                    hand.getProfile(function(pFile){
                        hand.profile = pFile;
                        if(typeof(successFn)=='function'){
                            successFn.apply(initThis, r);
                        }
                    })
                    hand.isInWeb = !!(liff.getOS()=='web');
                }, function(){
                    if(typeof(errorFn)=='function') errorFn.apply(this, arguments);
                })
            }
        }
    }

    window.liff.$hand = hand;
    window.liffHand = hand;
})();