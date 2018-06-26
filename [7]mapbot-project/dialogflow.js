module.exports = function(app) {

	const request = require('request');		
	const admin = require("firebase-admin");
	const serviceAccount = require("[어드민 SDK JSON 패스]");

	admin.initializeApp({
	  credential: admin.credential.cert(serviceAccount),
	  databaseURL: "https://ghbot-762ee.firebaseio.com/"
	});	

	const TOKEN = '[dialogflow v1 Token]';

	app.post('/process', (req, res) => {		
	  	const query = req.body.query;

	  	if(!query){
	  		res.json({flag: 0});
	  		return;
	  	}	  	

	  	const session_id = 'my_session_id';
	  	const language = 'en'

	  	const api_url = `https://api.dialogflow.com/v1/query?v=20170712&lang=${language}&sessionId=${session_id}&query=${query}`	  	

		const options = {
		    url: encodeURI(api_url),		    
		    headers: {
		    	'Authorization': "Bearer "+TOKEN,
		    	'Content-Type': 'application/x-www-form-urlencoded'
		    }		    
	    };
	    request.get(options, function (error, response, body) {
	     if (!error) {			     		     	
	     	const objResult = JSON.parse(body);

	     	const intentName = objResult.result.metadata.intentName;

	     	if(intentName=='near_location'){
	     		const location = objResult.result.parameters.location["street-address"];	     		

	     		getGeocode(location).then((data) => {
			      	const jsonObj = JSON.parse(data);			      	

		      		res.json({flag: 1, type: 0, data: jsonObj.results[0].geometry.location});
		      	}).catch((err) =>{
		      		console.error(err);
		      		res.json({flag: 0});
		      	});

	     	} else if(intentName=='find_location'){
	     		const ghname = objResult.result.parameters.gh_name;

	     		findGhInfo(ghname).then((data) => {

		      		res.json({flag: 1, type: 1, data: data})
		      	}).catch((err) =>{
		      		console.error(err);
		      		res.json({flag: 0});
		      	});		      	
	     	} else {
	     		console.log(`  No intent matched.`);
		      	res.json({flag: 0});
	     	}	     	
	       	
	     } else {
	       console.error('error:', err);
	       res.json({flag: 0});
	     }
	    });  	

	});

	function getGeocode(addr){
		return new Promise((resolve, reject) => {
			const address = encodeURI(addr);

			const api_key = '[맵 API 키]';
			const api_url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${api_key}`;
		    
		    request.get({url: api_url}, function (error, response, body) {
		     if (!error && response.statusCode == 200) {		     	
		       resolve(body);
		     } else {
		       reject(error);		       
		     }
		    });
	    });
	}


	function findGhInfo(ghname){
		return new Promise((resolve, reject) => {
		    admin.database().ref('/guesthouses')
	        .once('value', function(snapshot) {
	        	snapshot.forEach(function(childSnapshot) {
	    			var childKey = childSnapshot.key;
	    			var info = childSnapshot.val();

	    			if(info.enname == ghname){	    				
	    				resolve(info);
	    				return;
	    			}
	    		});

	    		reject("no guesthouse");
	        });        
	    });
	}
	

}