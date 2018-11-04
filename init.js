/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

(function(w, d){
    
    // var json_rpc_async = function(method, params, handler){
    //     var xhr = new XMLHttpRequest(),
    //     data = {
    //         method: method,
    //     };
    //     if(params) data.params = params;
        
    //     var jsonrpc = JSON.stringify(data);

    //     xhr.open("POST", "/", true);

    //     xhr.onreadystatechange = function() {
    //         if (xhr.readyState==4){
    //             if(xhr.status != 200) {
    //                 console.log(xhr.statusText);
    //             } else {
    //                 if(xhr.responseText) {
    //                     var parsedJSON = JSON.parse(xhr.responseText);
    //                     if(parsedJSON.error != undefined){
    //                         console.log(parsedJSON.error.message);
    //                     } else if(parsedJSON.result){
    //                         if(handler != null) {
    //                             handler(parsedJSON.result);
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     };

    //     xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    //     xhr.send(jsonrpc);
    // },
    
    // init = function(result){ 
    //     // var language = result.lang || 'en',
    //     var path = '/badmin/branch.html';

    //     var options = JSON.stringify(result);
    //     w.localStorage.setItem('pbxOptions', options);
    //     // w.localStorage.setItem('pbxLanguage', language);
    //     w.location.pathname = path;
        
    // };
            
    // json_rpc_async('getPbxOptions', null, init);

    w.location = '/badmin/branch.html';
    
})(window, document);