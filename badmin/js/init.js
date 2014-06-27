/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

(function(w, d){
    
    var json_rpc_async = function(method, params, handler){
        
        var jsonrpc, request = new XMLHttpRequest();
        
        if(params)
            jsonrpc = '{\"method\":\"'+method+'\", \"params\":{'+params+'}, \"id\":'+1+'}';
        else
            jsonrpc = '{\"method\":\"'+method+'\", \"id\":'+1+'}';

        request.open('POST', '/', true);

        request.onload = function (e) {
            if (request.readyState === 4) {

                // Check if the get was successful.

                if (request.status === 200) {
                    var parsedJSON = JSON.parse(request.responseText);
                    if(handler) handler(parsedJSON.result);
                } else {
                    console.error(request.statusText);
                }
            }
        };

        // Catch errors:

        request.onerror = function (e) {
            console.error(request.statusText);
        };
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        request.send(jsonrpc);
    },
    
    init = function(result){
        var language = result.lang || 'en',
            path = '/badmin/'+language+'/branch.html';
        
        w.localStorage.setItem('pbxLanguage', language);
        w.location.pathname = path;
        
    };
            
    json_rpc_async('getPbxOptions', null, init);
    
})(window, document);