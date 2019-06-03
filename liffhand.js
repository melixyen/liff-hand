// LIFF hand ver 1.0
// Use search parameter "hashpath" for save real hash value.
// Example LIFF web app url trans
// http://example.com/myliff.php?start=1&end=5#/add
// to
// line://app/1234567890-abcd9876?start=1&end=5&hashpath=%23%2Fadd
//
// Use script tag src to include this js after liff sdk.js and when you initial liff done, call liff.$hashpath.changeHash() to replace location.hash

(function(){

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
        profile: {},
        data: {},
        path: GetP['hashpath'],
        delay: GetP['liffhanddelay'],//Delay time (ms) to run changeHash
        debug: !!(GetP['liffhanddebug'])
    }

    hand.changeHash = function(){
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

    hand.initAll = function(successFn, errorFn){//初始化完並取回 profile 才 callback
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
        }, function(){
            if(typeof(errorFn)=='function') successFn.apply(this, arguments);
        })
    }

    window.liff.$hand = hand;
})();